import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function applyBucketPolicies(bucket: string) {
  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) {
    console.error("SUPABASE_DB_URL not set, cannot apply policies");
    return ["SUPABASE_DB_URL not configured"];
  }

  const sql = postgres(dbUrl);
  const errors: string[] = [];

  const policies = [
    {
      name: `Allow public read ${bucket}`,
      stmt: `CREATE POLICY "Allow public read ${bucket}" ON storage.objects FOR SELECT TO public USING (bucket_id = '${bucket}')`,
    },
    {
      name: `Allow admin insert ${bucket}`,
      stmt: `CREATE POLICY "Allow admin insert ${bucket}" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = '${bucket}' AND public.has_role(auth.uid(), 'admin'))`,
    },
    {
      name: `Allow admin update ${bucket}`,
      stmt: `CREATE POLICY "Allow admin update ${bucket}" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = '${bucket}' AND public.has_role(auth.uid(), 'admin'))`,
    },
    {
      name: `Allow admin delete ${bucket}`,
      stmt: `CREATE POLICY "Allow admin delete ${bucket}" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = '${bucket}' AND public.has_role(auth.uid(), 'admin'))`,
    },
  ];

  try {
    for (const p of policies) {
      try {
        await sql.unsafe(p.stmt);
      } catch (e) {
        // Policy might already exist
        if (!e.message?.includes("already exists")) {
          errors.push(`${p.name}: ${e.message}`);
        }
      }
    }
  } finally {
    await sql.end();
  }

  return errors;
}

async function removeBucketPolicies(bucket: string) {
  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) return;

  const sql = postgres(dbUrl);
  const policyNames = [
    `Allow public read ${bucket}`,
    `Allow admin insert ${bucket}`,
    `Allow admin update ${bucket}`,
    `Allow admin delete ${bucket}`,
  ];

  try {
    for (const name of policyNames) {
      await sql.unsafe(`DROP POLICY IF EXISTS "${name}" ON storage.objects`);
    }
  } finally {
    await sql.end();
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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

        // Auto-apply RBAC storage policies
        const policyErrors = await applyBucketPolicies(bucketName);

        return new Response(JSON.stringify({
          success: true,
          data,
          policies_applied: policyErrors.length === 0,
          policy_errors: policyErrors.length > 0 ? policyErrors : undefined,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update": {
        if (!bucketName || !newBucketName) throw new Error("Noms requis");
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
        // Remove RLS policies first
        await removeBucketPolicies(bucketName);

        // Empty the bucket
        const { data: files } = await adminClient.storage.from(bucketName).list("", { limit: 1000 });
        if (files && files.length > 0) {
          const filePaths = files.map((f) => f.name);
          await adminClient.storage.from(bucketName).remove(filePaths);
        }
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
