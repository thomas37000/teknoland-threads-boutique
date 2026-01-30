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
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Authentication required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate JWT and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("JWT validation failed:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    // Get the request body
    const { cartItems } = await req.json();

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return new Response(
        JSON.stringify({ error: "Cart is empty or invalid" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Validate cart items structure
    const productIds = cartItems.map((item: any) => {
      if (!item.product?.id || typeof item.product.id !== "string") {
        throw new Error("Invalid cart item structure");
      }
      return item.product.id;
    });

    // Initialize Stripe with the secret key
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Fetch all products from database (server-side price validation)
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, description, price, image, stock")
      .in("id", productIds);

    if (productsError || !products) {
      console.error("Error fetching products:", productsError);
      return new Response(
        JSON.stringify({ error: "Failed to validate products" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Create a map of products by ID for quick lookup
    const productMap = new Map(products.map(p => [p.id, p]));

    // Validate all products exist and build line items with server-side prices
    const line_items = [];
    const validatedItems = [];
    let subtotal = 0;

    for (const item of cartItems) {
      const productId = item.product.id;
      const dbProduct = productMap.get(productId);

      if (!dbProduct) {
        console.error("Product not found:", productId);
        return new Response(
          JSON.stringify({ error: `Product not found: ${item.product.name || productId}` }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          }
        );
      }

      // Validate and sanitize quantity
      const quantity = Math.max(1, Math.min(100, parseInt(item.quantity) || 1));

      // Check stock if available
      if (dbProduct.stock !== null && dbProduct.stock < quantity) {
        return new Response(
          JSON.stringify({ error: `Insufficient stock for: ${dbProduct.name}` }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      // Use server-side price (never trust client price)
      const unitAmountCents = Math.round(dbProduct.price * 100);
      subtotal += dbProduct.price * quantity;

      line_items.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: dbProduct.name,
            description: dbProduct.description || `Produit ${dbProduct.name}`,
            images: dbProduct.image ? [dbProduct.image] : [],
          },
          unit_amount: unitAmountCents,
        },
        quantity,
      });

      validatedItems.push({
        id: dbProduct.id,
        name: dbProduct.name,
        price: dbProduct.price,
        quantity,
        size: item.size,
        color: item.color,
      });
    }

    console.log(`Creating cart checkout for ${line_items.length} items, subtotal: ${subtotal}€`);

    // Define shipping options
    const shipping_options = [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: subtotal > 50 ? 0 : 499,
            currency: "eur",
          },
          display_name: "La Poste - Standard",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 5 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 399,
            currency: "eur",
          },
          display_name: "Mondial Relay - Point relais",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 6 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 999,
            currency: "eur",
          },
          display_name: "Chronopost - Express",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 1 },
            maximum: { unit: "business_day", value: 2 },
          },
        },
      },
    ];

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      shipping_options,
      shipping_address_collection: {
        allowed_countries: ["FR", "BE", "LU", "CH", "MC"],
      },
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/cart`,
      metadata: {
        userId,
        cart_summary: JSON.stringify(validatedItems),
        expected_subtotal: Math.round(subtotal * 100).toString(),
      },
    });

    console.log("Cart checkout session created:", session.id);

    // Return the session URL
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Cart checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
