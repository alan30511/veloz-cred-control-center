
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    logStep("Function started");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // First check the local database for recent subscription data
    const { data: subscriber, error: dbError } = await supabaseClient
      .from('subscribers')
      .select('subscribed, subscription_tier, subscription_end, updated_at')
      .eq('user_id', user.id)
      .maybeSingle()

    // If we have recent data (less than 5 minutes old), return it
    if (subscriber && !dbError) {
      const lastUpdate = new Date(subscriber.updated_at);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      if (lastUpdate > fiveMinutesAgo) {
        logStep("Returning cached subscription data", { 
          subscribed: subscriber.subscribed,
          lastUpdate: subscriber.updated_at 
        });
        
        return new Response(
          JSON.stringify({
            subscribed: subscriber.subscribed || false,
            subscription_tier: subscriber.subscription_tier || null,
            subscription_end: subscriber.subscription_end || null
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Only check with Stripe if data is stale or missing
    logStep("Checking with Stripe for fresh data");

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });

    if (customers.data.length === 0) {
      logStep("No customer found in Stripe");
      
      // Update database with no subscription
      await supabaseClient.from('subscribers').upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      return new Response(
        JSON.stringify({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get active subscriptions - limit to 1 for performance
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      // Determine tier based on price (simplified)
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      if (amount <= 3000) { // $30 or less
        subscriptionTier = "silver";
      } else {
        subscriptionTier = "gold";
      }
      
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        tier: subscriptionTier,
        endDate: subscriptionEnd 
      });
    } else {
      logStep("No active subscription found");
    }

    // Update database with fresh data
    await supabaseClient.from('subscribers').upsert({
      user_id: user.id,
      email: user.email,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // Return subscription data
    const subscriptionData = {
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    };

    logStep("Returning fresh subscription data", subscriptionData);

    return new Response(
      JSON.stringify(subscriptionData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: 'Unable to process request' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
