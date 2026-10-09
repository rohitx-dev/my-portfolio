import { formatFileSize, type DocumentSummary } from "../../lib/documents/validation";

export default function DocumentCard({ document }: { document: DocumentSummary }) {
  return (
    <article aria-labelledby={`document-${document.id}`} className="flex h-full min-w-0 flex-col rounded-2xl border border-white/10 bg-[#101729]/80 p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3 text-xs text-violet-300">
        <span className="uppercase tracking-widest">{document.original_filename.split(".").pop()}</span>
        <span className="text-slate-400">{formatFileSize(document.size_bytes)}</span>
      </div>
      <h3 id={`document-${document.id}`} className="mt-5 break-words text-xl font-semibold tracking-tight text-white">{document.name}</h3>
      <p className="mt-3 flex-1 break-words text-sm leading-7 text-slate-400">{document.description || "A document shared by Rohit Singh."}</p>
      <p className="mt-4 break-all text-xs text-slate-400">{document.original_filename}</p>
      <a href={`/docs/${document.id}/download`} aria-label={`Download ${document.name}`} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-200 hover:bg-violet-500/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400">
        Download <span aria-hidden="true" className="ml-2">↓</span>
      </a>
    </article>
  );
}
