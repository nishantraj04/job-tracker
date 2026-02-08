import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  email: string;
  type: 'password_change' | 'hibernate' | 'delete_account';
}

serve(async (req) => {
  // Handle CORS (Browser security)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, type } = await req.json() as EmailPayload;
    
    let subject = "";
    let htmlContent = "";

    // 1. Password Change Alert
    if (type === "password_change") {
      subject = "Security Alert: Password Changed";
      htmlContent = `
        <div style="font-family: sans-serif; color: #333;">
          <h1 style="color: #2563eb;">Password Updated</h1>
          <p>The password for your <strong>JobTracker Pro</strong> account was just changed.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Was this you?</strong><br/>If yes, you can safely ignore this email.</p>
          </div>
          <p style="color: #dc2626;"><strong>If this wasn't you, please reset your password immediately.</strong></p>
        </div>
      `;
    } 
    // 2. Hibernate (Hide Profile)
    else if (type === "hibernate") {
      subject = "Your Account is now Hidden";
      htmlContent = `
        <div style="font-family: sans-serif; color: #333;">
          <h1 style="color: #4b5563;">Account Hibernated</h1>
          <p>Your JobTracker Pro profile is now <strong>hidden from the public</strong>.</p>
          <p>Your data is safe, but no one can see your portfolio URL.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p>To reactivate, simply log in to your dashboard.</p>
        </div>
      `;
    }
    // 3. Delete Account (Goodbye)
    else if (type === "delete_account") {
      subject = "Account Permanently Deleted";
      htmlContent = `
        <div style="font-family: sans-serif; color: #333;">
          <h1 style="color: #dc2626;">Account Deleted</h1>
          <p>As requested, your account and all associated data have been <strong>permanently wiped</strong>.</p>
          <p>We are sorry to see you go.</p>
          <p>- The JobTracker Team</p>
        </div>
      `;
    }

    // Send via Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        // "onboarding@resend.dev" is REQUIRED for free testing. 
        // It delivers ONLY to the email you signed up with (nishant.raj0403@gmail.com).
        from: "JobTracker Security <onboarding@resend.dev>",
        to: [email],
        subject: subject,
        html: htmlContent,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});