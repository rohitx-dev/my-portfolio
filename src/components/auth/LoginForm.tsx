"use client";

import { useActionState } from "react";
import { signIn } from "../../app/login/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(signIn, { error: "" });
  const inputClass = "mt-2 w-full rounded-xl border border-white/15 bg-[#080b14] px-4 py-3 text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20";

  return (
    <form action={action} className="mt-8 space-y-5" aria-busy={pending}>
      <div>
        <label htmlFor="owner-email" className="text-sm font-medium text-slate-200">Email address</label>
        <input id="owner-email" name="email" type="email" autoComplete="username" required maxLength={254} className={inputClass} />
      </div>
      <div>
        <label htmlFor="owner-password" className="text-sm font-medium text-slate-200">Password</label>
        <input id="owner-password" name="password" type="password" autoComplete="current-password" required maxLength={1024} className={inputClass} />
      </div>
      <div aria-live="polite" aria-atomic="true">
        {state.error && <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm leading-6 text-rose-200">{state.error}</p>}
      </div>
      <button type="submit" disabled={pending} className="min-h-12 w-full rounded-xl bg-violet-500 px-5 py-3 font-medium text-white transition-colors hover:bg-violet-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 disabled:cursor-wait disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
