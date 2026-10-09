"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { finishUpload, prepareUpload } from "../../app/admin/documents/actions";
import { createPublicClient } from "../../lib/supabase/public";
import { DOCUMENT_BUCKET, FILE_ACCEPT, parseUploadDetails, type UploadDetails } from "../../lib/documents/validation";

export default function UploadForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploaded, setUploaded] = useState<{ id: string; details: UploadDetails } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current) return;
    const values = new FormData(event.currentTarget);
    busyRef.current = true;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      let receipt = uploaded;
      if (!receipt) {
        const file = values.get("file");
        if (!(file instanceof File)) { setError("Choose a file to upload."); return; }
        const parsed = parseUploadDetails({ name: values.get("name"), description: values.get("description"), filename: file.name, mimeType: file.type, size: file.size });
        if (parsed.error || !parsed.data) { setError(parsed.error ?? "Check your document details."); return; }
        setPhase("Preparing upload…");
        const result = await prepareUpload(parsed.data);
        if (!result.ticket) { setError(result.error ?? "Could not start the upload."); return; }
        setPhase("Uploading file…");
        const normalizedFile = new File([file], file.name, { type: parsed.data.mimeType });
        const { error: uploadError } = await createPublicClient().storage.from(DOCUMENT_BUCKET)
          .uploadToSignedUrl(result.ticket.path, result.ticket.token, normalizedFile, { contentType: parsed.data.mimeType, cacheControl: "0" });
        if (uploadError) { setError("Upload failed. Check your connection, file type, and 10 MB limit, then try again."); return; }
        receipt = { id: result.ticket.id, details: parsed.data };
        setUploaded(receipt);
      }
      setPhase("Saving document…");
      const result = await finishUpload(receipt.id, receipt.details);
      if (result.error) { setError(result.error); return; }
      setUploaded(null);
      formRef.current?.reset();
      setSuccess(result.success ?? "Document saved privately.");
      router.refresh();
    } catch {
      setError("Could not complete the request. Check your connection and try again. If your session expired, sign in again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
      setPhase("");
    }
  }

  const inputClass = "mt-2 w-full rounded-xl border border-white/15 bg-[#080b14] px-4 py-3 text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20";
  return (
    <section aria-labelledby="upload-heading" className="mt-10 rounded-2xl border border-white/10 bg-[#101729]/80 p-6 sm:p-8">
      <h2 id="upload-heading" className="text-xl font-semibold text-white">Upload a document</h2>
      <p id="upload-help" className="mt-3 text-sm leading-7 text-slate-400">PDF, TXT, DOCX, JPG, or PNG. Maximum 10 MB. Every new upload is private until you publish it.</p>
      <form ref={formRef} onSubmit={submit} className="mt-6" aria-busy={busy}>
        <fieldset disabled={busy || !!uploaded} className="grid gap-5 md:grid-cols-2 disabled:opacity-60">
          <div>
            <label htmlFor="document-name" className="text-sm font-medium">Document name</label>
            <input id="document-name" name="name" required maxLength={160} className={inputClass} />
          </div>
          <div>
            <label htmlFor="document-file" className="text-sm font-medium">File</label>
            <input id="document-file" name="file" type="file" required accept={FILE_ACCEPT} aria-describedby="upload-help" className={`${inputClass} min-w-0 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-violet-500/20 file:px-3 file:py-1 file:text-violet-200`} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="document-description" className="text-sm font-medium">Description <span className="text-slate-400">(optional)</span></label>
            <textarea id="document-description" name="description" maxLength={2000} rows={3} className={inputClass} />
          </div>
        </fieldset>
        <div aria-live="polite" aria-atomic="true" className="mt-4 text-sm leading-7">
          {error && <p className="text-rose-200">{error}</p>}
          {success && <p className="text-emerald-200">{success}</p>}
          {uploaded && !busy && <p className="text-slate-300">Your file is uploaded but not listed yet. Retry saving before leaving this page.</p>}
          {busy && <p className="text-slate-300">{phase}</p>}
        </div>
        <button type="submit" disabled={busy} className="mt-4 min-h-12 rounded-xl bg-violet-500 px-6 py-3 font-medium text-white hover:bg-violet-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 disabled:cursor-wait disabled:opacity-60">
          {busy ? "Please wait…" : uploaded ? "Retry saving" : "Upload privately"}
        </button>
      </form>
    </section>
  );
}
