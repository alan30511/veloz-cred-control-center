
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null
  });
  const [loading, setLoading] = useState(false);

  const checkSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Subscription check error:', error);
        throw new Error('Failed to check subscription status');
      }
      
      if (data && typeof data === 'object') {
        setSubscription(data);
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
  };

  const createCheckout = async (planId: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Faça login para continuar",
        variant: "destructive"
      });
      return;
    }

    // Input validation
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
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId: planId.trim() }
      });
      
      if (error) {
        console.error('Checkout creation error:', error);
        throw new Error('Failed to create checkout session');
      }
      
      if (data?.url && typeof data.url === 'string') {
        // Validate URL before opening
        try {
          new URL(data.url);
          window.open(data.url, '_blank');
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
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Customer portal error:', error);
        throw new Error('Failed to access customer portal');
      }
      
      if (data?.url && typeof data.url === 'string') {
        // Validate URL before opening
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

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  return {
    subscription,
    loading,
    checkSubscription,
    createCheckout,
    openCustomerPortal
  };
};
