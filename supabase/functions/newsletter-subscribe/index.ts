import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SubscribeRequest = await req.json();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if email already exists
    const { data: existingSubscription } = await supabase
      .from("newsletter_subscriptions")
      .select("*")
      .eq("email", email)
      .single();

    if (existingSubscription) {
      if (existingSubscription.confirmed) {
        return new Response(
          JSON.stringify({ error: "Email already subscribed" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      } else {
        // Resend confirmation email
        const confirmationUrl = `${req.headers.get("origin") || "https://teknolandclothes.com"}/newsletter/confirm?token=${existingSubscription.confirmation_token}`;
        
        await resend.emails.send({
          from: "Teknoland <onboarding@resend.dev>",
          to: [email],
          subject: "Confirmez votre inscription à la newsletter Teknoland",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Bienvenue chez Teknoland !</h1>
              <p>Merci de votre intérêt pour notre newsletter.</p>
              <p>Pour confirmer votre inscription, veuillez cliquer sur le lien ci-dessous :</p>
              <a href="${confirmationUrl}" 
                 style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; 
                        text-decoration: none; border-radius: 4px; margin: 20px 0;">
                Confirmer mon inscription
              </a>
              <p style="color: #666; font-size: 14px;">
                Si vous n'avez pas demandé cette inscription, vous pouvez ignorer cet email.
              </p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px;">
                Ce lien est valable pendant 7 jours.<br>
                Teknoland Threads Boutique - Mode streetwear et vinyles
              </p>
            </div>
          `,
        });

        return new Response(
          JSON.stringify({ message: "Confirmation email resent" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    // Generate unique confirmation token
    const confirmationToken = crypto.randomUUID();

    // Insert subscription
    const { error: insertError } = await supabase
      .from("newsletter_subscriptions")
      .insert({
        email,
        confirmation_token: confirmationToken,
        confirmed: false,
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to subscribe" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send confirmation email
    const confirmationUrl = `${req.headers.get("origin") || "https://teknolandclothes.com"}/newsletter/confirm?token=${confirmationToken}`;
    
    const { error: emailError } = await resend.emails.send({
      from: "Teknoland <onboarding@resend.dev>",
      to: [email],
      subject: "Confirmez votre inscription à la newsletter Teknoland",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Bienvenue chez Teknoland !</h1>
          <p>Merci de votre intérêt pour notre newsletter.</p>
          <p>Pour confirmer votre inscription, veuillez cliquer sur le lien ci-dessous :</p>
          <a href="${confirmationUrl}" 
             style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Confirmer mon inscription
          </a>
          <p style="color: #666; font-size: 14px;">
            Si vous n'avez pas demandé cette inscription, vous pouvez ignorer cet email.
          </p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Ce lien est valable pendant 7 jours.<br>
            Teknoland Threads Boutique - Mode streetwear et vinyles
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Email error:", emailError);
      const errorMessage = emailError.message || "Failed to send confirmation email";
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: "Please verify your domain in Resend if you're seeing validation errors."
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Newsletter subscription successful for:", email);

    return new Response(
      JSON.stringify({ message: "Confirmation email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in newsletter-subscribe function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
