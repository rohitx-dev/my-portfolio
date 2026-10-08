import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

// This must match the owner in supabase/migrations/001_document_storage.sql.
// A user ID is an identifier, not a password. Never accept it from form input.
export const OWNER_ID = "ba4aa406-c726-4ed8-9e14-d886ffbda33e";

export async function requireOwner() {
  const supabase = await createClient();
  // getUser verifies the session with Supabase. Do not trust getSession alone.
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user || data.user.id !== OWNER_ID) {
    redirect("/login");
  }

  return { supabase, user: data.user };
}
