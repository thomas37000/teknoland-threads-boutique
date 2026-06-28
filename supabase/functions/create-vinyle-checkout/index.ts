import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@12.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * create-vinyle-checkout
 *
 * Stripe checkout pour les vinyles distribués (source : Airtable, table « Vinyles »).
 * - Authentifie l'utilisateur (JWT) et vérifie qu'il est admin OU distributor.
 * - Récupère les vinyles ciblés depuis Airtable pour valider prix & stock côté serveur
 *   (on ne fait jamais confiance au prix envoyé par le client).
 * - Crée une commande `orders` (status=pending) + `order_items` (item_type='vinyle',
 *   external_ref = recordId Airtable) afin que le distributeur retrouve sa commande
 *   dans son profil / achats.
 * - Crée la session Stripe Checkout et renvoie l'URL.
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const AIRTABLE_URL = Deno.env.get("VITE_AIRTABLE_URL") || "";
    const AIRTABLE_KEY = Deno.env.get("VITE_AIRTABLE_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const userId = claimsData.claims.sub as string;

    const admin = createClient(supabaseUrl, supabaseServiceKey);

    // Vérifier rôle (admin ou distributor)
    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const allowed = (roles || []).some((r: any) => r.role === "admin" || r.role === "distributor");
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Accès distributeur requis" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const { items } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Panier vide" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Récupération des vinyles depuis Airtable (1 appel par record pour fiabilité).
    const fetched: Array<{
      recordId: string;
      quantity: number;
      name: string;
      price: number;
      stock: number | null;
      image?: string;
    }> = [];

    for (const it of items) {
      const recordId = String(it?.recordId || "");
      const quantity = Math.max(1, Math.min(50, parseInt(it?.quantity) || 1));
      if (!recordId.startsWith("rec")) {
        return new Response(JSON.stringify({ error: `Record invalide: ${recordId}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      const res = await fetch(`${AIRTABLE_URL}/Vinyles/${recordId}`, {
        headers: { Authorization: `Bearer ${AIRTABLE_KEY}` },
      });
      if (!res.ok) {
        return new Response(JSON.stringify({ error: `Vinyle introuvable: ${recordId}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }
      const json = await res.json();
      const f = json?.fields || {};
      const price = Number(f.Prix_distributeur);
      if (!Number.isFinite(price) || price <= 0) {
        return new Response(JSON.stringify({ error: `Prix invalide pour ${f.Titre || recordId}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      const stock = f.Stock != null ? Number(f.Stock) : null;
      if (stock != null && stock < quantity) {
        return new Response(JSON.stringify({ error: `Stock insuffisant pour ${f.Titre || recordId}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      const img = Array.isArray(f.Image) && f.Image[0]?.url ? f.Image[0].url : undefined;
      fetched.push({
        recordId,
        quantity,
        name: `${f.Ref ? f.Ref + " — " : ""}${f.Titre || "Vinyle"}`,
        price,
        stock,
        image: img,
      });
    }

    const subtotal = fetched.reduce((s, x) => s + x.price * x.quantity, 0);

    // 1) Créer la commande pending + order_items
    const { data: orderRow, error: orderErr } = await admin
      .from("orders")
      .insert({ user_id: userId, total: subtotal, status: "pending" })
      .select("id")
      .single();
    if (orderErr || !orderRow) {
      console.error("orders insert error", orderErr);
      return new Response(JSON.stringify({ error: "Création commande échouée" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    const orderId = orderRow.id as string;

    const orderItemsRows = fetched.map((x) => ({
      order_id: orderId,
      product_id: null,
      item_type: "vinyle",
      external_ref: x.recordId,
      item_name: x.name,
      item_image: x.image || null,
      price: x.price,
      quantity: x.quantity,
    }));
    const { error: itemsErr } = await admin.from("order_items").insert(orderItemsRows);
    if (itemsErr) {
      console.error("order_items insert error", itemsErr);
      return new Response(JSON.stringify({ error: "Création lignes commande échouée" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // 2) Session Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    const line_items = fetched.map((x) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: x.name,
          images: x.image ? [x.image] : [],
        },
        unit_amount: Math.round(x.price * 100),
      },
      quantity: x.quantity,
    }));

    const origin = req.headers.get("origin") || "";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      shipping_address_collection: { allowed_countries: ["FR", "BE", "LU", "CH", "MC"] },
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${origin}/distribution`,
      metadata: { userId, orderId, kind: "vinyle" },
    });

    return new Response(JSON.stringify({ url: session.url, orderId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    console.error("create-vinyle-checkout error", e);
    return new Response(JSON.stringify({ error: e?.message || "Erreur" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
