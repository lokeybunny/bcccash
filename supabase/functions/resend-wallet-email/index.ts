import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResendEmailRequest {
  email: string;
  turnstileToken: string;
}

// Rate limit: 5 minutes between resend requests
const RATE_LIMIT_MINUTES = 5;

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY not configured");
    return false;
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}

// Base58 encoding for Solana keys
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function encodeBase58(bytes: Uint8Array): string {
  const digits = [0];
  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let str = '';
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    str += ALPHABET[0];
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    str += ALPHABET[digits[i]];
  }
  return str;
}

async function sendEmail(to: string, publicKey: string, privateKey: string, secretKeyArray: number[]): Promise<void> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "BCC.cash <noreply@bcc.cash>",
      to: [to],
      subject: "🔐 Your Solana Wallet Credentials (Resent)",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0f; color: #e2e8f0; padding: 40px 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0f 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(139, 92, 246, 0.3);">
            
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px;">📧 Wallet Credentials Resent</h1>
              <p style="color: #a1a1aa; margin: 0;">Here are your wallet details again</p>
            </div>

            <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <p style="color: #a1a1aa; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Your Public Address</p>
              <p style="color: #ffffff; font-size: 14px; font-family: monospace; word-break: break-all; margin: 0; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px;">${publicKey}</p>
            </div>

            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <p style="color: #ef4444; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">⚠️ Your Private Key (Base58 Format)</p>
              <p style="color: #ffffff; font-size: 11px; font-family: monospace; word-break: break-all; margin: 0 0 12px; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px;">${privateKey}</p>
              
              <p style="color: #ef4444; font-size: 12px; margin: 12px 0 8px; text-transform: uppercase; letter-spacing: 1px;">⚠️ Secret Key Array (For Phantom/Solflare)</p>
              <p style="color: #ffffff; font-size: 10px; font-family: monospace; word-break: break-all; margin: 0; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px;">[${secretKeyArray.join(',')}]</p>
            </div>

            <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #22c55e; margin: 0 0 12px; font-size: 16px;">🔒 Security Tips</h3>
              <ul style="color: #a1a1aa; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                <li><strong>Never share your private key</strong> with anyone</li>
                <li><strong>Store it securely</strong> - write it down and keep it safe offline</li>
                <li><strong>Delete this email</strong> after saving your private key</li>
                <li><strong>Use a hardware wallet</strong> for large amounts</li>
              </ul>
            </div>

            <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #71717a; font-size: 13px; margin: 0;">
                You requested to have your wallet credentials resent.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to send email: ${errorText}`);
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, turnstileToken }: ResendEmailRequest = await req.json();

    // Verify Turnstile token
    if (!turnstileToken) {
      return new Response(
        JSON.stringify({ error: "CAPTCHA verification required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const isTurnstileValid = await verifyTurnstile(turnstileToken);
    if (!isTurnstileValid) {
      return new Response(
        JSON.stringify({ error: "CAPTCHA verification failed. Please try again." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email address is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find wallet for this email
    const { data: wallet, error: fetchError } = await supabase
      .from("wallets")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (fetchError) {
      console.error("Database fetch error:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch wallet" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!wallet) {
      return new Response(
        JSON.stringify({ error: "No wallet found for this email" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!wallet.secret_key) {
      return new Response(
        JSON.stringify({ error: "Cannot resend email - wallet was created before this feature was available" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check rate limiting
    if (wallet.last_email_sent_at) {
      const lastSent = new Date(wallet.last_email_sent_at);
      const now = new Date();
      const minutesSinceLastEmail = (now.getTime() - lastSent.getTime()) / (1000 * 60);
      
        if (minutesSinceLastEmail < RATE_LIMIT_MINUTES) {
          const remainingMinutes = Math.ceil(RATE_LIMIT_MINUTES - minutesSinceLastEmail);

          // Return 200 so the frontend can show the remaining cooldown without throwing
          // (functions.invoke treats non-2xx as errors)
          return new Response(
            JSON.stringify({
              error: `Please wait ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''} before requesting another email`,
              retryAfter: remainingMinutes,
            }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
    }

    // Reconstruct private key from stored secret key array
    const secretKeyArray = wallet.secret_key as number[];
    const secretKeyBytes = new Uint8Array(secretKeyArray);
    const privateKey = encodeBase58(secretKeyBytes);

    // Send email
    await sendEmail(email, wallet.public_key, privateKey, secretKeyArray);

    // Update timestamp and confirmed status
    await supabase
      .from("wallets")
      .update({ 
        confirmed: true,
        last_email_sent_at: new Date().toISOString()
      })
      .eq("email", email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Wallet credentials resent to email" 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in resend-wallet-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
