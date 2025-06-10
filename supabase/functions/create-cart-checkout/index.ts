
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@12.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS pre-flight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get the request body
    const { cartItems } = await req.json();

    if (!cartItems || cartItems.length === 0) {
      return new Response(
        JSON.stringify({ error: "Cart is empty" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Initialize Stripe with the secret key
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Convert cart items to Stripe line items
    const line_items = cartItems.map((item: any) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.product.name,
          description: item.product.description || "",
          images: item.product.image ? [item.product.image] : [],
        },
        unit_amount: Math.round(item.product.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    // Calculate if shipping should be added
    const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
    const needsShipping = subtotal <= 50;

    if (needsShipping) {
      line_items.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: "Frais de livraison",
            description: "Livraison standard",
          },
          unit_amount: 499, // 4.99 EUR in cents
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/cart`,
      metadata: {
        cart_items: JSON.stringify(cartItems),
      },
    });

    // Return the session URL
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
