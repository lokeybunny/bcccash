import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

let client: SupabaseClient<Database> | null = null;

function resolveBackendUrl(): string | undefined {
  const explicit = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (explicit && explicit.length > 0) return explicit;

  // Fallback: some environments only provide the project id.
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
  if (!projectId) return undefined;

  return `https://${projectId}.supabase.co`;
}

export function getBackendClient(): SupabaseClient<Database> | null {
  if (client) return client;

  const url = resolveBackendUrl();
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

  if (!url || !key) return null;

  client = createClient<Database>(url, key, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return client;
}
