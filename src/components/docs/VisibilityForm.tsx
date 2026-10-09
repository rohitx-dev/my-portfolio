"use client";

import { useActionState } from "react";
import { changeVisibility } from "../../app/admin/documents/actions";

export default function VisibilityForm({ id, visibility }: { id: string; visibility: "public" | "private" }) {
  const [state, action, pending] = useActionState(changeVisibility, {});
  const nextVisibility = visibility === "public" ? "private" : "public";

  return (
    <form action={action} aria-busy={pending} onSubmit={(event) => {
      if (nextVisibility === "public" && !window.confirm("Publish this document? Anyone visiting your portfolio will be able to download it.")) event.preventDefault();
    }}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="visibility" value={nextVisibility} />
      <button type="submit" disabled={pending} className="min-h-11 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-violet-400 disabled:opacity-60">
        {pending ? "Updating…" : nextVisibility === "public" ? "Make public" : "Make private"}
      </button>
      <div aria-live="polite" aria-atomic="true" className="mt-2 text-xs leading-6">
        {state.error && <p className="text-rose-200">{state.error}</p>}
        {state.success && <p className="text-emerald-200">{state.success}</p>}
      </div>
    </form>
  );
}
