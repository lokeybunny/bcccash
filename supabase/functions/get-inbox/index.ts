import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GetInboxRequest {
  publicKey: string;
  page?: number;
  limit?: number;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { publicKey, page = 1, limit = 20 }: GetInboxRequest = await req.json();

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

    // Get wallet by public key
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id")
      .eq("public_key", publicKey)
      .maybeSingle();

    if (walletError || !wallet) {
      return new Response(
        JSON.stringify({ error: "Wallet not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get BCC account
    const { data: bccAccount, error: bccError } = await supabase
      .from("bcc_accounts")
      .select("id, bcc_username, forward_to_email, is_active")
      .eq("wallet_id", wallet.id)
      .maybeSingle();

    if (bccError || !bccAccount) {
      return new Response(
        JSON.stringify({ error: "BCC account not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get emails with pagination
    const offset = (page - 1) * limit;
    const { data: emails, error: emailsError, count } = await supabase
      .from("bcc_emails")
      .select("*", { count: "exact" })
      .eq("bcc_account_id", bccAccount.id)
      .order("received_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (emailsError) {
      console.error("Error fetching emails:", emailsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch emails" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        bccEmail: `${bccAccount.bcc_username}@bcc.cash`,
        forwardTo: bccAccount.forward_to_email,
        isActive: bccAccount.is_active,
        emails: emails || [],
        totalCount: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-inbox:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
