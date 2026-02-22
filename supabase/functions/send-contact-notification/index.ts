import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
  type?: 'contact' | 'reply';
  to?: string;
}

// Validation functions
const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: "Le nom est requis" };
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: "Le nom ne peut pas être vide" };
  }
  if (trimmed.length > 100) {
    return { isValid: false, error: "Le nom doit contenir moins de 100 caractères" };
  }
  // Only allow letters, spaces, hyphens, and apostrophes
  if (!/^[\p{L}\s\-']+$/u.test(trimmed)) {
    return { isValid: false, error: "Le nom contient des caractères non autorisés" };
  }
  return { isValid: true };
};

const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: "L'email est requis" };
  }
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length === 0) {
    return { isValid: false, error: "L'email ne peut pas être vide" };
  }
  if (trimmed.length > 255) {
    return { isValid: false, error: "L'email doit contenir moins de 255 caractères" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Format d'email invalide" };
  }
  return { isValid: true };
};

const validateSubject = (subject: string): { isValid: boolean; error?: string } => {
  const validSubjects = ['order', 'product', 'return', 'feedback', 'other'];
  if (!subject || typeof subject !== 'string') {
    return { isValid: false, error: "Le sujet est requis" };
  }
  if (!validSubjects.includes(subject)) {
    return { isValid: false, error: "Sujet invalide" };
  }
  return { isValid: true };
};

const validateMessage = (message: string): { isValid: boolean; error?: string } => {
  if (!message || typeof message !== 'string') {
    return { isValid: false, error: "Le message est requis" };
  }
  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: "Le message ne peut pas être vide" };
  }
  if (trimmed.length > 5000) {
    return { isValid: false, error: "Le message doit contenir moins de 5000 caractères" };
  }
  return { isValid: true };
};

// Sanitize HTML to prevent XSS in email
const sanitizeForHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { name, email, subject, message, type, to } = body as ContactNotificationRequest;

    // Handle reply from admin
    if (type === 'reply' && to) {
      const emailValidation = validateEmail(to);
      if (!emailValidation.isValid) {
        return new Response(
          JSON.stringify({ error: emailValidation.error }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      const messageValidation = validateMessage(message);
      if (!messageValidation.isValid) {
        return new Response(
          JSON.stringify({ error: messageValidation.error }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const sanitizedName = sanitizeForHtml((name || '').trim());
      const sanitizedMessage = sanitizeForHtml(message.trim());

      const emailResponse = await resend.emails.send({
        from: "Teknoland <onboarding@resend.dev>",
        to: [to],
        subject: subject || "Réponse de Teknoland",
        html: `
          <h2>Bonjour ${sanitizedName},</h2>
          <div style="margin-top: 20px;">
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
              ${sanitizedMessage.replace(/\n/g, '<br>')}
            </div>
          </div>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Cet email a été envoyé par l'équipe Teknoland.
          </p>
        `,
      });

      console.log("Reply sent successfully:", emailResponse);
      return new Response(JSON.stringify(emailResponse), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Original contact notification flow
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      return new Response(
        JSON.stringify({ error: nameValidation.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return new Response(
        JSON.stringify({ error: emailValidation.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const subjectValidation = validateSubject(subject);
    if (!subjectValidation.isValid) {
      return new Response(
        JSON.stringify({ error: subjectValidation.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const messageValidation = validateMessage(message);
    if (!messageValidation.isValid) {
      return new Response(
        JSON.stringify({ error: messageValidation.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Sanitize inputs for HTML email
    const sanitizedName = sanitizeForHtml(name.trim());
    const sanitizedEmail = sanitizeForHtml(email.trim().toLowerCase());
    const sanitizedMessage = sanitizeForHtml(message.trim());

    const subjectLabels: { [key: string]: string } = {
      'order': 'Commande',
      'product': 'Produit',
      'return': 'Retour',
      'feedback': 'Avis',
      'other': 'Autre'
    };

    const subjectLabel = subjectLabels[subject] || subject;

    console.log(`Processing contact form from: ${sanitizedEmail}, subject: ${subject}`);

    const emailResponse = await resend.emails.send({
      from: "Teknoland <onboarding@resend.dev>",
      to: ["teknolandproduction@gmail.com"],
      subject: `[Teknoland] Nouveau message: ${subjectLabel}`,
      html: `
        <h2>Nouveau message de contact reçu</h2>
        <p><strong>Nom:</strong> ${sanitizedName}</p>
        <p><strong>Email:</strong> ${sanitizedEmail}</p>
        <p><strong>Sujet:</strong> ${subjectLabel}</p>
        <div style="margin-top: 20px;">
          <strong>Message:</strong>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
            ${sanitizedMessage.replace(/\n/g, '<br>')}
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
      JSON.stringify({ error: "Une erreur s'est produite lors de l'envoi du message" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
