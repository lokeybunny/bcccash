import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Webhook from email provider (Resend inbound)
interface InboundEmailPayload {
  from: string;
  from_name?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: InboundEmailPayload = await req.json();

    // Extract username from to address (username@bcc.cash)
    const toMatch = payload.to.match(/^([a-z0-9]+)@bcc\.cash$/i);
    if (!toMatch) {
      return new Response(
        JSON.stringify({ error: "Invalid recipient address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const bccUsername = toMatch[1].toLowerCase();

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find BCC account
    const { data: bccAccount, error: bccError } = await supabase
      .from("bcc_accounts")
      .select("id, forward_to_email, is_active")
      .eq("bcc_username", bccUsername)
      .maybeSingle();

    if (bccError || !bccAccount) {
      console.error("BCC account not found:", bccUsername);
      return new Response(
        JSON.stringify({ error: "Recipient not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!bccAccount.is_active) {
      return new Response(
        JSON.stringify({ error: "Account is inactive" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store email in database
    const { data: email, error: insertError } = await supabase
      .from("bcc_emails")
      .insert({
        bcc_account_id: bccAccount.id,
        from_email: payload.from,
        from_name: payload.from_name,
        subject: payload.subject,
        body_text: payload.text,
        body_html: payload.html,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error storing email:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to store email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Forward email to original address using Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      try {
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: `${bccUsername}@bcc.cash`,
            to: [bccAccount.forward_to_email],
            subject: `[BCC] ${payload.subject || "(No Subject)"}`,
            html: payload.html || `<pre>${payload.text || ""}</pre>`,
            text: payload.text,
            reply_to: payload.from,
          }),
        });

        if (resendResponse.ok) {
          // Mark as forwarded
          await supabase
            .from("bcc_emails")
            .update({ is_forwarded: true, forwarded_at: new Date().toISOString() })
            .eq("id", email.id);
        } else {
          console.error("Resend API error:", await resendResponse.text());
        }
      } catch (forwardError) {
        console.error("Error forwarding email:", forwardError);
        // Don't fail the request - email is stored, just not forwarded
      }
    }

    return new Response(
      JSON.stringify({ success: true, emailId: email.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in receive-email:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
