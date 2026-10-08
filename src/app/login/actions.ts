"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";
import { OWNER_ID } from "../../lib/auth/owner";

export type AuthState = { error: string };

export async function signIn(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const emailValue = formData.get("email");
  const password = formData.get("password");
  const email = typeof emailValue === "string" ? emailValue.trim() : "";

  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || typeof password !== "string" || !password || password.length > 1024) {
    return { error: "Enter your email address and password." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: error.status === 429
        ? "Too many attempts. Please wait a few minutes and try again."
        : "Could not sign in. Check your owner email and password, then try again." };
    }

    if (!data.user || data.user.id !== OWNER_ID) {
      await supabase.auth.signOut({ scope: "local" });
      return { error: "This account does not have access to the owner dashboard." };
    }
  } catch {
    return { error: "Sign-in is temporarily unavailable. Please try again shortly." };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin/documents");
}

export async function signOut(): Promise<AuthState> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) return { error: "Could not sign out. Please try again." };
  } catch {
    return { error: "Could not sign out. Check your connection and try again." };
  }

  revalidatePath("/admin", "layout");
  redirect("/login");
}
