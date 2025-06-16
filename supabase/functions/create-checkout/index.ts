
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Stripe secret key from environment
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!
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

    const { planId } = await req.json()

    // Input validation
    if (!planId || typeof planId !== 'string' || planId.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan selection' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate planId against allowed values
    const allowedPlans = ['silver', 'gold']
    if (!allowedPlans.includes(planId.trim().toLowerCase())) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan selection' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Stripe checkout session
    const stripe = (await import('https://esm.sh/stripe@14.21.0')).default(stripeKey)

    // Map plan IDs to correct Stripe Price IDs
    const planPriceMapping = {
      'silver': 'price_1RaTLo4J821s9xRYtV9Wexel',
      'gold': 'price_1RaTMh4J821s9xRYE1pkc1WB'
    }

    const priceId = planPriceMapping[planId.toLowerCase() as keyof typeof planPriceMapping]

    console.log(`Creating checkout for plan: ${planId}, price ID: ${priceId}`)

    // Check if customer already exists
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    })

    let customerId = null
    if (customers.data.length > 0) {
      customerId = customers.data[0].id
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/?success=true&plan=${planId}`,
      cancel_url: `${req.headers.get('origin')}/?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      locale: 'pt-BR',
    })

    console.log(`Checkout session created: ${session.id}, URL: ${session.url}`)

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: 'Unable to process request' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
