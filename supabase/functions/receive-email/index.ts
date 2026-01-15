import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

// Resend inbound webhook payload structure
interface ResendInboundPayload {
  type: string;
  created_at: string;
  data: {
    from: string;
    to: string[];
    subject: string;
    text?: string;
    html?: string;
    headers: Array<{ name: string; value: string }>;
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: ResendInboundPayload = await req.json();
    
    console.log("Received webhook:", JSON.stringify(payload, null, 2));

    // Validate it's an inbound email event
    if (payload.type !== "email.received") {
      return new Response(
        JSON.stringify({ message: "Ignored non-inbound event" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailData = payload.data;
    
    // Find the @bcc.cash recipient
    const bccRecipient = emailData.to.find((addr) => addr.toLowerCase().includes("@bcc.cash"));
    if (!bccRecipient) {
      return new Response(
        JSON.stringify({ error: "No @bcc.cash recipient found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract username from recipient (username@bcc.cash)
    const toMatch = bccRecipient.match(/<?([a-z0-9]+)@bcc\.cash>?/i);
    if (!toMatch) {
      return new Response(
        JSON.stringify({ error: "Invalid recipient address format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const bccUsername = toMatch[1].toLowerCase();
    
    // Extract sender name from "Name <email>" format
    const fromMatch = emailData.from.match(/^(?:"?([^"<]+)"?\s*)?<?([^>]+)>?$/);
    const fromName = fromMatch?.[1]?.trim() || null;
    const fromEmail = fromMatch?.[2]?.trim() || emailData.from;

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
        from_email: fromEmail,
        from_name: fromName,
        subject: emailData.subject,
        body_text: emailData.text,
        body_html: emailData.html,
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
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not configured - email stored but not forwarded");
    } else {
      console.log(`Forwarding email to: ${bccAccount.forward_to_email}`);
      
      try {
        // Try with bcc.cash domain first, fallback to resend.dev if not verified
        const fromAddresses = [
          `${bccUsername}@bcc.cash`,
          `BCC Mail <onboarding@resend.dev>`, // Fallback for unverified domains
        ];
        
        let forwardSuccess = false;
        let lastError = "";
        
        for (const fromAddr of fromAddresses) {
          const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: fromAddr,
              to: [bccAccount.forward_to_email],
              subject: `[Forwarded to ${bccUsername}@bcc.cash] ${emailData.subject || "(No Subject)"}`,
              html: `
                <div style="border-left: 3px solid #8b5cf6; padding-left: 16px; margin-bottom: 20px; color: #666;">
                  <p><strong>Original sender:</strong> ${fromName ? `${fromName} &lt;${fromEmail}&gt;` : fromEmail}</p>
                  <p><strong>To:</strong> ${bccUsername}@bcc.cash</p>
                  <p><strong>Subject:</strong> ${emailData.subject || "(No Subject)"}</p>
                </div>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                ${emailData.html || `<pre style="white-space: pre-wrap;">${emailData.text || ""}</pre>`}
              `,
              text: `--- Forwarded from ${bccUsername}@bcc.cash ---\nFrom: ${fromEmail}\nSubject: ${emailData.subject || "(No Subject)"}\n\n${emailData.text || ""}`,
              reply_to: fromEmail,
            }),
          });

          if (resendResponse.ok) {
            // Mark as forwarded
            await supabase
              .from("bcc_emails")
              .update({ is_forwarded: true, forwarded_at: new Date().toISOString() })
              .eq("id", email.id);
            console.log(`Email forwarded successfully using: ${fromAddr}`);
            forwardSuccess = true;
            break;
          } else {
            lastError = await resendResponse.text();
            console.warn(`Failed with ${fromAddr}: ${lastError}`);
          }
        }
        
        if (!forwardSuccess) {
          console.error("All forwarding attempts failed. Last error:", lastError);
        }
      } catch (forwardError) {
        console.error("Error forwarding email:", forwardError);
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
