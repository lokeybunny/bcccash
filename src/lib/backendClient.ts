import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

let client: SupabaseClient<Database> | null = null;

// Known project configuration (fallback when env vars aren't loaded)
const FALLBACK_URL = "https://wvmwuaodzxndimecfezg.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2bXd1YW9kenhuZGltZWNmZXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTE1NjQsImV4cCI6MjA4Mzg2NzU2NH0.wvEt2ZSCBQrlOv7MqoWr-Rrl_-AlCDafNy7NMCInqvA";

function resolveBackendUrl(): string {
  const explicit = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (explicit && explicit.length > 0) return explicit;

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
  if (projectId && projectId.length > 0) {
    return `https://${projectId}.supabase.co`;
  }

  return FALLBACK_URL;
}

function resolveBackendKey(): string {
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  if (key && key.length > 0) return key;
  return FALLBACK_KEY;
}

export function getBackendClient(): SupabaseClient<Database> {
  if (client) return client;

  const url = resolveBackendUrl();
  const key = resolveBackendKey();

  client = createClient<Database>(url, key, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return client;
}
