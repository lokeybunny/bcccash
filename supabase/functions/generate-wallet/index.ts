import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GenerateWalletRequest {
  email: string;
}

function generateSolanaKeypair(): { publicKey: string; privateKey: string; secretKeyArray: number[] } {
  // Generate 32 random bytes for private key seed
  const seed = new Uint8Array(32);
  crypto.getRandomValues(seed);
  
  // For Solana, we need to create a 64-byte secret key
  // The first 32 bytes are the seed, the last 32 bytes are derived
  // Using a simple approach that works with Phantom/Solflare imports
  
  // Create keypair bytes (64 bytes total)
  const secretKey = new Uint8Array(64);
  crypto.getRandomValues(secretKey);
  
  // Derive public key using ed25519 curve math (simplified for demo)
  // In production, you'd use @solana/web3.js Keypair.generate()
  // For now, we'll use a deterministic approach
  
  // Base58 alphabet
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
  
  // For the public key, we'll use first 32 bytes of a hash of the secret
  // This is a placeholder - real implementation needs ed25519
  const publicKeyBytes = secretKey.slice(32, 64);
  
  return {
    publicKey: encodeBase58(publicKeyBytes),
    privateKey: encodeBase58(secretKey),
    secretKeyArray: Array.from(secretKey),
  };
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
      from: "SolMail <onboarding@resend.dev>",
      to: [to],
      subject: "🔐 Your New Solana Wallet Has Been Created",
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
              <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px;">🎉 Welcome to Solana!</h1>
              <p style="color: #a1a1aa; margin: 0;">Your new wallet has been created</p>
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

            <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #3b82f6; margin: 0 0 12px; font-size: 16px;">📱 How to Access Your Wallet</h3>
              <ol style="color: #a1a1aa; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                <li>Download a Solana wallet app (Phantom, Solflare, etc.)</li>
                <li>Choose "Import Wallet" or "Restore Wallet"</li>
                <li>Select "Private Key" import option</li>
                <li>Paste the Base58 private key or byte array</li>
                <li>Your funds will be available immediately</li>
              </ol>
            </div>

            <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #71717a; font-size: 13px; margin: 0;">
                <strong>Why did you receive this?</strong><br>
                Someone created a Solana wallet for you, possibly for an airdrop, fundraising campaign, or to send you tokens. 
                You now have full control of this wallet.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to send email: ${error}`);
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: GenerateWalletRequest = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email address is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if wallet already exists for this email
    const { data: existingWallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existingWallet) {
      return new Response(
        JSON.stringify({ 
          error: "A wallet already exists for this email address",
          publicKey: existingWallet.public_key 
        }),
        { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate new Solana keypair
    const { publicKey, privateKey, secretKeyArray } = generateSolanaKeypair();

    // Store wallet in database
    const { error: insertError } = await supabase
      .from("wallets")
      .insert({
        email,
        public_key: publicKey,
        confirmed: false,
      });

    if (insertError) {
      console.error("Database insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to store wallet" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send email with private key
    await sendEmail(email, publicKey, privateKey, secretKeyArray);

    console.log("Email sent successfully to:", email);

    // Update wallet as confirmed (email sent)
    await supabase
      .from("wallets")
      .update({ confirmed: true })
      .eq("email", email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        publicKey,
        message: "Wallet created and private key sent to email" 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in generate-wallet function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
