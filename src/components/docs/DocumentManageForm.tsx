"use client";

import { useActionState, useState } from "react";
import { deleteDocument, editDocument } from "../../app/admin/documents/manage-actions";

const button = "min-h-11 rounded-xl border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60";
const input = "mt-2 w-full rounded-xl border border-white/15 bg-[#080b14] px-3 py-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-violet-400";

type Props = { id: string; name: string; description: string; deletionPending: boolean };

function EditForm({ id, name, description }: Pick<Props, "id" | "name" | "description">) {
  const [state, action, pending] = useActionState(editDocument, {});
  return (
    <form action={action} aria-busy={pending} className="mt-4">
      <input type="hidden" name="id" value={id} />
      <fieldset disabled={pending} className="space-y-4">
        <label className="block text-sm text-slate-300">Document name
          <input className={input} name="name" required maxLength={160} defaultValue={name} />
        </label>
        <label className="block text-sm text-slate-300">Description
          <textarea className={input} name="description" maxLength={2000} rows={4} defaultValue={description} />
        </label>
        <button className={`${button} border-violet-400/30 text-violet-200 hover:bg-violet-400/10`} type="submit">{pending ? "Saving…" : "Save details"}</button>
      </fieldset>
      <div aria-live="polite" aria-atomic="true" className="mt-3 text-sm leading-6">
        {state.error && <p className="text-rose-200">{state.error}</p>}
        {state.success && <p className="text-emerald-200">{state.success}</p>}
      </div>
    </form>
  );
}

export default function DocumentManageForm({ id, name, description, deletionPending }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(deleteDocument, {});
  return (
    <div className="mt-5 border-t border-white/10 pt-4">
      {deletionPending ? (
        <p role="status" className="mb-3 text-sm leading-6 text-amber-200">Deletion pending. This document is hidden from visitors. Retry to finish removing it.</p>
      ) : (
        <>
          <button type="button" disabled={pending || confirming} aria-expanded={editing} aria-controls={`edit-${id}`} className={`${button} border-white/15 text-slate-200 hover:bg-white/5`} onClick={() => setEditing(!editing)}>{editing ? "Cancel editing" : "Edit details"}</button>
          {editing && <div id={`edit-${id}`}><EditForm id={id} name={name} description={description} /></div>}
        </>
      )}
      {!confirming && !deletionPending ? (
        <button type="button" disabled={editing} className={`${button} mt-3 border-rose-400/30 text-rose-200 hover:bg-rose-400/10`} onClick={() => setConfirming(true)}>Delete document</button>
      ) : (
        <form action={action} aria-busy={pending} className="mt-4">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="confirm" value="delete" />
          {!deletionPending && <p className="mb-3 break-words text-sm leading-6 text-slate-300">Permanently delete “{name}” and its file? This cannot be undone.</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={pending} className={`${button} border-rose-400/30 bg-rose-400/10 text-rose-200 hover:bg-rose-400/20`}>{pending ? "Deleting…" : deletionPending ? "Retry deletion" : "Confirm deletion"}</button>
            {!deletionPending && <button type="button" disabled={pending} className={`${button} border-white/15 text-slate-200`} onClick={() => setConfirming(false)}>Cancel</button>}
          </div>
        </form>
      )}
      <div aria-live="polite" aria-atomic="true" className="mt-3 text-sm leading-6">
        {state.error && <p className="text-rose-200">{state.error}</p>}
        {state.success && <p className="text-emerald-200">{state.success}</p>}
      </div>
    </div>
  );
}
