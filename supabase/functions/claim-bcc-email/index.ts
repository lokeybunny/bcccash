import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClaimEmailRequest {
  publicKey: string;
}

// Generate username from public key (first 8 lowercase alphanumeric chars)
function generateUsername(publicKey: string): string {
  // Remove non-alphanumeric chars and take first 8
  return publicKey.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toLowerCase();
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { publicKey }: ClaimEmailRequest = await req.json();

    if (!publicKey) {
      return new Response(
        JSON.stringify({ error: "Public key is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify wallet exists and is a BCC wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id, email, public_key")
      .eq("public_key", publicKey)
      .maybeSingle();

    if (walletError || !wallet) {
      return new Response(
        JSON.stringify({ error: "Wallet not found or not a BCC wallet" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from("bcc_accounts")
      .select("id, bcc_username")
      .eq("wallet_id", wallet.id)
      .maybeSingle();

    if (existingAccount) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "BCC email already claimed",
          bccEmail: `${existingAccount.bcc_username}@bcc.cash`,
          alreadyExists: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate username from public key
    const bccUsername = generateUsername(publicKey);

    // Check if username is taken (unlikely but possible)
    const { data: usernameTaken } = await supabase
      .from("bcc_accounts")
      .select("id")
      .eq("bcc_username", bccUsername)
      .maybeSingle();

    if (usernameTaken) {
      // Add random suffix if taken
      const suffix = Math.random().toString(36).substring(2, 4);
      const newUsername = (bccUsername.slice(0, 6) + suffix).toLowerCase();
      
      // Create account with modified username
      const { data: newAccount, error: createError } = await supabase
        .from("bcc_accounts")
        .insert({
          wallet_id: wallet.id,
          bcc_username: newUsername,
          forward_to_email: wallet.email,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating BCC account:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create BCC email account" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "BCC email claimed successfully",
          bccEmail: `${newUsername}@bcc.cash`,
          forwardTo: wallet.email,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create BCC account
    const { data: newAccount, error: createError } = await supabase
      .from("bcc_accounts")
      .insert({
        wallet_id: wallet.id,
        bcc_username: bccUsername,
        forward_to_email: wallet.email,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating BCC account:", createError);
      return new Response(
        JSON.stringify({ error: "Failed to create BCC email account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "BCC email claimed successfully",
        bccEmail: `${bccUsername}@bcc.cash`,
        forwardTo: wallet.email,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in claim-bcc-email:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
