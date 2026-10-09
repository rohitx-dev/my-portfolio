import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

// No session or elevated key. Use for public records and signed uploads only.
export function createPublicClient() {
  const { url, key } = getSupabaseConfig();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}
