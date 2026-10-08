"use client";

import { useActionState } from "react";
import { signOut } from "../../app/login/actions";

export default function SignOutButton() {
  const [state, action, pending] = useActionState(signOut, { error: "" });

  return (
    <form action={action} aria-busy={pending}>
      <button type="submit" disabled={pending} className="min-h-11 rounded-xl border border-white/15 px-5 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 disabled:opacity-60">
        {pending ? "Signing out…" : "Sign out"}
      </button>
      <div aria-live="polite" aria-atomic="true">
        {state.error && <p className="mt-3 max-w-sm text-sm text-rose-200">{state.error}</p>}
      </div>
    </form>
  );
}
