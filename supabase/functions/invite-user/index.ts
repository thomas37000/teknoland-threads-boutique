import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const ALLOWED_ROLES = ["client", "seller", "distributor", "admin"] as const;
type AppRole = (typeof ALLOWED_ROLES)[number];

interface InviteRequest {
  email: string;
  firstname?: string;
  lastname?: string;
  role?: AppRole;
}

// Génère un mot de passe temporaire conforme aux règles de l'app
// (8+ caractères, majuscule, minuscule, chiffre, caractère spécial)
function generateTemporaryPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*?";
  const all = upper + lower + digits + special;

  const pick = (set: string) => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return set[buf[0] % set.length];
  };

  // 1 de chaque catégorie + 8 aléatoires = 12 caractères
  const chars = [pick(upper), pick(lower), pick(digits), pick(special)];
  for (let i = 0; i < 8; i++) chars.push(pick(all));

  // Mélange (Fisher-Yates)
  for (let i = chars.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const j = buf[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

const validateEmail = (email: unknown): email is string =>
  typeof email === "string" &&
  email.length <= 255 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const sanitizeForHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // 1. Vérification JWT + rôle admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

    const { data: isAdmin } = await userClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) return jsonResponse({ error: "Forbidden" }, 403);

    // 2. Validation du body
    const body = (await req.json()) as InviteRequest;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!validateEmail(email)) return jsonResponse({ error: "Email invalide" }, 400);

    const role: AppRole = ALLOWED_ROLES.includes(body.role as AppRole)
      ? (body.role as AppRole)
      : "client";
    const firstname = (body.firstname ?? "").trim().slice(0, 100);
    const lastname = (body.lastname ?? "").trim().slice(0, 100);

    // 3. Création du user avec mot de passe temporaire (email déjà confirmé)
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const temporaryPassword = generateTemporaryPassword();

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { firstname, lastname, invited: true },
    });

    if (createError) {
      const msg = createError.message?.includes("already been registered")
        ? "Un utilisateur avec cet email existe déjà"
        : createError.message;
      return jsonResponse({ error: msg }, 400);
    }

    const newUserId = created.user.id;

    // 4. Rôle dans user_roles (source de vérité RBAC)
    const { error: roleError } = await adminClient
      .from("user_roles")
      .insert({ user_id: newUserId, role });
    if (roleError) console.error("user_roles insert error:", roleError);

    // 5. Profil (au cas où le trigger handle_new_user ne l'aurait pas créé)
    const fullName = [firstname, lastname].filter(Boolean).join(" ") || null;
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("id", newUserId)
      .maybeSingle();

    if (existingProfile) {
      await adminClient
        .from("profiles")
        .update({ firstname, lastname, full_name: fullName, roles: role })
        .eq("id", newUserId);
    } else {
      const { error: profileError } = await adminClient.from("profiles").insert({
        id: newUserId,
        email,
        firstname,
        lastname,
        full_name: fullName,
        roles: role,
      });
      if (profileError) console.error("profiles insert error:", profileError);
    }

    // 6. Email d'invitation avec le mot de passe temporaire
    const origin = req.headers.get("origin") ?? "https://teknoland-threads-boutique.lovable.app";
    const loginUrl = `${origin}/auth`;
    const displayName = sanitizeForHtml(firstname || email);

    const { error: emailError } = await resend.emails.send({
      from: "Teknoland <onboarding@resend.dev>",
      to: [email],
      subject: "Invitation à rejoindre Teknoland",
      html: `
        <h2>Bonjour ${displayName},</h2>
        <p>Vous avez été invité(e) à rejoindre <strong>Teknoland</strong>.</p>
        <p>Voici vos identifiants de connexion :</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email :</strong> ${sanitizeForHtml(email)}</p>
          <p style="margin: 5px 0;"><strong>Mot de passe temporaire :</strong> <code style="background: #e5e5e5; padding: 2px 6px; border-radius: 3px;">${temporaryPassword}</code></p>
        </div>
        <p>
          <a href="${loginUrl}" style="display: inline-block; background: #1e40af; color: #ffffff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
            Se connecter
          </a>
        </p>
        <p style="color: #666;">Pour des raisons de sécurité, nous vous recommandons de changer ce mot de passe temporaire dès votre première connexion (Profil → Compte).</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Cet email a été envoyé par l'équipe Teknoland.</p>
      `,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return jsonResponse(
        {
          ok: true,
          userId: newUserId,
          warning: "Utilisateur créé mais l'email d'invitation n'a pas pu être envoyé",
        },
        200,
      );
    }

    console.log(`[invite-user] invited=${email} role=${role} by=${user.id}`);
    return jsonResponse({ ok: true, userId: newUserId });
  } catch (e) {
    console.error("[invite-user] error:", e);
    return jsonResponse({ error: "Erreur interne lors de l'invitation" }, 500);
  }
});