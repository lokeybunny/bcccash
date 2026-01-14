import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyWalletRequest {
  email?: string;
  publicKey?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, publicKey }: VerifyWalletRequest = await req.json();

    if (!email && !publicKey) {
      return new Response(
        JSON.stringify({ error: "Email address or public key is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Look up wallet by email or public key
    let query = supabase
      .from("wallets")
      .select("email, public_key, confirmed, created_at");
    
    if (publicKey) {
      query = query.eq("public_key", publicKey);
    } else if (email) {
      query = query.eq("email", email);
    }

    const { data: wallet, error } = await query.maybeSingle();

    if (error) {
      console.error("Database query error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to query database" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!wallet) {
      const searchType = publicKey ? "public key" : "email";
      return new Response(
        JSON.stringify({ 
          found: false, 
          message: `No wallet found for this ${searchType}`,
          searchedBy: publicKey ? "publicKey" : "email"
        }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({
        found: true,
        email: wallet.email,
        publicKey: wallet.public_key,
        confirmed: wallet.confirmed,
        createdAt: wallet.created_at,
        searchedBy: publicKey ? "publicKey" : "email"
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in verify-wallet function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
