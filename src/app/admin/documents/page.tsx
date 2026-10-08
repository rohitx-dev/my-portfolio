import type { Metadata } from "next";
import Link from "next/link";
import SignOutButton from "../../../components/auth/SignOutButton";
import { requireOwner } from "../../../lib/auth/owner";

export const metadata: Metadata = {
  title: "Document workspace | Rohit Singh",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OwnerDocumentsPage() {
  const { supabase, user } = await requireOwner();
  const { data: documents, error } = await supabase
    .from("documents")
    .select("id, name, description, visibility, original_filename")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="mx-auto min-h-[80svh] max-w-6xl px-5 pb-20 pt-36 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">Owner workspace</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Your documents</h1>
          <p className="mt-4 break-all text-sm text-slate-400">Signed in as {user.email}</p>
        </div>
        <SignOutButton />
      </div>
      <p className="mt-8 max-w-2xl text-sm leading-7 text-slate-400">Your document workspace is ready. Uploading, changing visibility, and downloading from this page will arrive in the next implementation step.</p>

      <section aria-labelledby="saved-documents-heading" className="mt-10">
        <h2 id="saved-documents-heading" className="text-xl font-semibold text-white">Saved documents</h2>
        {error ? (
          <p role="alert" className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/5 p-6 text-sm leading-7 text-rose-200">We could not load your documents. Please try refreshing the page. If this continues, check the database setup.</p>
        ) : !documents?.length ? (
          <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-[#101729]/60 p-8 text-center">
            <h3 className="text-lg font-medium text-white">No documents yet</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">Documents you add will appear here. New documents are private by default.</p>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm text-slate-400">Showing up to 50 most recent documents.</p>
            <ul className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((document) => (
                <li key={document.id} className="min-w-0 rounded-2xl border border-white/10 bg-[#101729]/80 p-6">
                  <span className="rounded-full border border-violet-400/20 px-3 py-1 text-xs text-violet-200">{document.visibility === "public" ? "Public" : "Private"}</span>
                  <h3 className="mt-5 break-words text-lg font-semibold text-white">{document.name}</h3>
                  <p className="mt-3 break-words text-sm leading-7 text-slate-400">{document.description || "No description added."}</p>
                  <p className="mt-4 break-all text-xs text-slate-400">{document.original_filename}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
      <Link href="/docs" className="mt-8 inline-flex min-h-11 items-center rounded text-sm text-violet-300 hover:text-violet-200 focus-visible:outline-2 focus-visible:outline-violet-400">View public Docs →</Link>
    </main>
  );
}
