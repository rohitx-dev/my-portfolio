export type DocumentSummary = {
  id: string;
  name: string;
  category: string;
  description: string;
};

export default function DocumentCard({ document }: { document: DocumentSummary }) {
  return (
    <article
      aria-labelledby={`document-${document.id}`}
      className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#101729]/80 p-6 sm:p-7"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
            <path d="M14 2v6h6M8 13h8M8 17h5" />
          </svg>
        </span>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">Sample</span>
      </div>
      <p className="mt-6 text-xs font-medium uppercase tracking-widest text-violet-300">{document.category}</p>
      <h3 id={`document-${document.id}`} className="mt-3 text-xl font-semibold tracking-tight text-white">{document.name}</h3>
      <p className="mt-3 flex-1 text-sm leading-7 text-slate-400">{document.description}</p>
      <p className="mt-6 border-t border-white/10 pt-4 text-xs text-slate-400">Document coming soon</p>
    </article>
  );
}
