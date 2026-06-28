import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@12.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * confirm-vinyle-order
 *
 * Appelé par /payment-success quand un order_id est présent dans l'URL.
 * Vérifie le statut de la session Stripe et marque la commande comme `paid`
 * (ou `failed`) côté Supabase. Authentifie l'appelant pour ne mettre à jour
 * que ses propres commandes.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const anon = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims } = await supabase.auth.getClaims(token);
    const userId = claims?.claims?.sub as string | undefined;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { sessionId, orderId } = await req.json();
    if (!sessionId || !orderId) {
      return new Response(JSON.stringify({ error: "Paramètres manquants" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";

    const admin = createClient(supabaseUrl, service);
    const { data: order } = await admin
      .from("orders")
      .select("id, user_id, status")
      .eq("id", orderId)
      .maybeSingle();
    if (!order || order.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Commande introuvable" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const newStatus = paid ? "paid" : "failed";
    if (order.status !== newStatus) {
      await admin.from("orders").update({ status: newStatus }).eq("id", orderId);
    }

    return new Response(JSON.stringify({ status: newStatus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    console.error("confirm-vinyle-order", e);
    return new Response(JSON.stringify({ error: e?.message || "Erreur" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
