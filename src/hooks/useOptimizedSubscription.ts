
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

interface CachedSubscription extends SubscriptionData {
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'subscription_cache';

export const useOptimizedSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null
  });
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<number>(0);

  // Load cached subscription data
  const loadCachedSubscription = useCallback(() => {
    if (!user) return null;
    
    try {
      const cached = localStorage.getItem(`${CACHE_KEY}_${user.id}`);
      if (cached) {
        const parsedCache: CachedSubscription = JSON.parse(cached);
        const now = Date.now();
        
        if (now - parsedCache.timestamp < CACHE_DURATION) {
          setSubscription({
            subscribed: parsedCache.subscribed,
            subscription_tier: parsedCache.subscription_tier,
            subscription_end: parsedCache.subscription_end
          });
          setLastChecked(parsedCache.timestamp);
          return parsedCache;
        }
      }
    } catch (error) {
      console.error('Error loading cached subscription:', error);
    }
    return null;
  }, [user]);

  // Save subscription to cache
  const saveToCache = useCallback((data: SubscriptionData) => {
    if (!user) return;
    
    try {
      const cacheData: CachedSubscription = {
        ...data,
        timestamp: Date.now()
      };
      localStorage.setItem(`${CACHE_KEY}_${user.id}`, JSON.stringify(cacheData));
      setLastChecked(cacheData.timestamp);
    } catch (error) {
      console.error('Error saving subscription to cache:', error);
    }
  }, [user]);

  // Manual subscription check (only called when user requests it)
  const checkSubscription = useCallback(async (force = false) => {
    if (!user) return;

    // Check if we have recent cached data and force is not true
    if (!force) {
      const cached = loadCachedSubscription();
      if (cached) {
        return;
      }
    }

    setLoading(true);
    try {
      console.log('Checking subscription status with Stripe...');
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Subscription check error:', error);
        throw new Error('Failed to check subscription status');
      }
      
      if (data && typeof data === 'object') {
        setSubscription(data);
        saveToCache(data);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar o status da assinatura",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast, loadCachedSubscription, saveToCache]);

  const createCheckout = async (planId: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Faça login para continuar",
        variant: "destructive"
      });
      return;
    }

    if (!planId || typeof planId !== 'string' || planId.trim().length === 0) {
      toast({
        title: "Erro",
        description: "Plano inválido selecionado",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating checkout session...');
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId: planId.trim() }
      });
      
      if (error) {
        console.error('Checkout creation error:', error);
        throw new Error('Failed to create checkout session');
      }
      
      if (data?.url && typeof data.url === 'string') {
        try {
          new URL(data.url);
          window.open(data.url, '_blank');
          // Invalidate cache after successful checkout initiation
          if (user) {
            localStorage.removeItem(`${CACHE_KEY}_${user.id}`);
          }
        } catch {
          throw new Error('Invalid checkout URL received');
        }
      } else {
        throw new Error('Invalid response from payment service');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Faça login para continuar",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Opening customer portal...');
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Customer portal error:', error);
        throw new Error('Failed to access customer portal');
      }
      
      if (data?.url && typeof data.url === 'string') {
        try {
          new URL(data.url);
          window.open(data.url, '_blank');
        } catch {
          throw new Error('Invalid portal URL received');
        }
      } else {
        throw new Error('Invalid response from portal service');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar o portal do cliente. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Only load cached data on mount, don't make API calls
  useEffect(() => {
    if (user) {
      loadCachedSubscription();
    } else {
      // Clear subscription data when user logs out
      setSubscription({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null
      });
      setLastChecked(0);
    }
  }, [user, loadCachedSubscription]);

  const isDataStale = useCallback(() => {
    if (lastChecked === 0) return true;
    return Date.now() - lastChecked > CACHE_DURATION;
  }, [lastChecked]);

  return {
    subscription,
    loading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    isDataStale,
    lastChecked
  };
};
