
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactNotificationRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactNotificationRequest = await req.json();

    const subjectLabels: { [key: string]: string } = {
      'order': 'Commande',
      'product': 'Produit',
      'return': 'Retour',
      'feedback': 'Avis',
      'other': 'Autre'
    };

    const subjectLabel = subjectLabels[subject] || subject;

    const emailResponse = await resend.emails.send({
      from: "Teknoland <onboarding@resend.dev>",
      to: ["teknolandproduction@gmail.com"],
      subject: `[Teknoland] Nouveau message: ${subjectLabel}`,
      html: `
        <h2>Nouveau message de contact reçu</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Sujet:</strong> ${subjectLabel}</p>
        <div style="margin-top: 20px;">
          <strong>Message:</strong>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Ce message a été envoyé depuis le formulaire de contact de Teknoland.
        </p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-notification function:", error);
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
