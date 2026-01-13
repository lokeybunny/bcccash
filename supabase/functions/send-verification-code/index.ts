import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-forwarded-for",
};

interface SendCodeRequest {
  email: string;
}

// Rate limiting: max 5 code requests per email per hour
const CODE_EXPIRY_MINUTES = 10;
const MAX_CODES_PER_HOUR = 5;

// IP-based rate limiting
const IP_RATE_LIMIT_MAX_REQUESTS = 10;
const IP_RATE_LIMIT_WINDOW_MINUTES = 60;
const ipRateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIP = req.headers.get("x-real-ip");
  if (realIP) return realIP;
  const cfIP = req.headers.get("cf-connecting-ip");
  if (cfIP) return cfIP;
  return "unknown";
}

function checkIPRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowMs = IP_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;
  const record = ipRateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    ipRateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  if (record.count >= IP_RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterMs = record.resetTime - now;
    return { allowed: false, retryAfter: Math.ceil(retryAfterMs / (60 * 1000)) };
  }
  
  record.count++;
  return { allowed: true };
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(to: string, code: string): Promise<void> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "BCC.cash <onboarding@resend.dev>",
      to: [to],
      subject: "🔐 Your Verification Code",
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
              <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px;">Verify Your Email</h1>
              <p style="color: #a1a1aa; margin: 0;">Enter this code to create your Solana wallet</p>
            </div>

            <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 32px; margin-bottom: 24px; text-align: center;">
              <p style="color: #a1a1aa; font-size: 12px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
              <p style="color: #ffffff; font-size: 36px; font-family: monospace; letter-spacing: 8px; margin: 0; font-weight: bold;">${code}</p>
            </div>

            <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #fbbf24; font-size: 14px; margin: 0; text-align: center;">
                ⏰ This code expires in ${CODE_EXPIRY_MINUTES} minutes
              </p>
            </div>

            <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #71717a; font-size: 13px; margin: 0;">
                If you didn't request this code, you can safely ignore this email.
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
    const clientIP = getClientIP(req);
    
    // Check IP rate limit
    const ipRateLimitResult = checkIPRateLimit(clientIP);
    if (!ipRateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: `Too many requests. Please try again in ${ipRateLimitResult.retryAfter} minutes.`,
          retryAfter: ipRateLimitResult.retryAfter
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email }: SendCodeRequest = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email address is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check rate limit: max codes per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("email_verifications")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", oneHourAgo);

    if (count && count >= MAX_CODES_PER_HOUR) {
      return new Response(
        JSON.stringify({ error: "Too many verification requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate new code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000).toISOString();

    // Delete any existing unverified codes for this email
    await supabase
      .from("email_verifications")
      .delete()
      .eq("email", email)
      .eq("verified", false);

    // Store new code
    const { error: insertError } = await supabase
      .from("email_verifications")
      .insert({
        email,
        code,
        expires_at: expiresAt,
        verified: false,
      });

    if (insertError) {
      console.error("Database insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create verification code" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send email
    await sendVerificationEmail(email, code);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent",
        expiresIn: CODE_EXPIRY_MINUTES
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-verification-code function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);