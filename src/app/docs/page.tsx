import type { Metadata } from "next";
import Link from "next/link";
import DocumentCard from "../../components/docs/DocumentCard";
import { createPublicClient } from "../../lib/supabase/public";

export const metadata: Metadata = {
  title: "Docs | Rohit Singh",
  description: "Explore and download project documentation, development guides, and notes shared by Rohit Singh.",
};

// Visibility changes must be reflected on the next request, not a static build.
export const dynamic = "force-dynamic";

export default async function DocsPage() {
  const { data: documents, error } = await createPublicClient()
    .from("documents")
    .select("id, name, description, original_filename, size_bytes, visibility")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="mx-auto min-h-[80svh] max-w-6xl px-5 pb-20 pt-32 sm:px-8 sm:pb-24 sm:pt-40">
      <div className="hero-enter max-w-3xl">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400">
          <span aria-hidden="true">←</span> Back to portfolio
        </Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Behind the projects</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Ideas, decisions,<br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">and documentation.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">Explore project plans, development guides, and learning notes. Download any document shared here without signing in.</p>
      </div>

      <section aria-labelledby="documents-heading" className="mt-14 sm:mt-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="documents-heading" className="text-xl font-semibold text-white sm:text-2xl">Shared documents</h2>
          <Link href="/login" className="inline-flex min-h-11 items-center rounded text-sm text-violet-300 hover:text-violet-200 focus-visible:outline-2 focus-visible:outline-violet-400">Owner login →</Link>
        </div>
        {error ? (
          <p role="alert" className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/5 p-6 text-sm leading-7 text-rose-200">Documents are temporarily unavailable. Please try again shortly.</p>
        ) : !documents?.length ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-[#101729]/60 p-8">
            <h3 className="text-lg font-medium text-white">No public documents yet</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">New resources will appear here when they are shared. Check back soon.</p>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm text-slate-400">Showing {documents.length} shared {documents.length === 1 ? "document" : "documents"}{documents.length === 50 ? " (50 most recent)" : ""}.</p>
            <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((document) => <li key={document.id} className="min-w-0"><DocumentCard document={document} /></li>)}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}
