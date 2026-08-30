import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * Vérifie que l'appelant est un admin authentifié.
 * Retourne { userId } si autorisé, sinon { response } (401/403) à renvoyer tel quel.
 */
export async function requireAdmin(
  req: Request,
  corsHeaders: Record<string, string>,
  tag = "edge",
): Promise<{ userId?: string; response?: Response }> {
  const deny = (status: number, error: string) => ({
    response: new Response(JSON.stringify({ error }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }),
  });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    console.warn(`[${tag}] rejected: missing Authorization header`);
    return deny(401, "Unauthorized");
  }

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user) {
    console.warn(`[${tag}] rejected: invalid session`);
    return deny(401, "Unauthorized");
  }

  const { data: isAdmin } = await userClient.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });
  if (!isAdmin) {
    console.warn(`[${tag}] rejected: user ${user.id} is not admin`);
    return deny(403, "Forbidden");
  }

  return { userId: user.id };
}
