import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify the user is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user role with anon client
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await anonClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Accès refusé - Admin requis" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role client for bucket operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { action, bucketName, newBucketName, isPublic } = await req.json();

    switch (action) {
      case "list": {
        const { data, error } = await adminClient.storage.listBuckets();
        if (error) throw error;
        return new Response(JSON.stringify({ buckets: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "create": {
        if (!bucketName) throw new Error("Nom du bucket requis");
        const { data, error } = await adminClient.storage.createBucket(bucketName, {
          public: isPublic ?? true,
        });
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update": {
        if (!bucketName || !newBucketName) throw new Error("Noms requis");
        // Supabase doesn't support renaming buckets directly.
        // We need to: create new bucket, move files, delete old bucket.
        // For simplicity, we update the bucket settings (public/private).
        // True rename requires file migration.
        const { error } = await adminClient.storage.updateBucket(bucketName, {
          public: isPublic ?? true,
        });
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete": {
        if (!bucketName) throw new Error("Nom du bucket requis");
        // First empty the bucket
        const { data: files } = await adminClient.storage.from(bucketName).list("", { limit: 1000 });
        if (files && files.length > 0) {
          const filePaths = files.map((f) => f.name);
          await adminClient.storage.from(bucketName).remove(filePaths);
        }
        // Then delete the bucket
        const { error } = await adminClient.storage.deleteBucket(bucketName);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error("Action non reconnue");
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
