import type { Metadata } from "next";
import Link from "next/link";
import DocumentCard, { type DocumentSummary } from "../../components/docs/DocumentCard";

export const metadata: Metadata = {
  title: "Docs | Rohit Singh",
  description: "A preview of project documentation, development guides, and learning notes from Rohit Singh.",
};

// Preview content only. Replace with published documents when storage is added.
const documents: DocumentSummary[] = [
  {
    id: "valoura",
    name: "Valoura project overview",
    category: "Project documentation",
    description: "An introduction to the wedding services marketplace, its core features, and the journey from discovery to booking.",
  },
  {
    id: "xome-technologies",
    name: "Xome Technologies workflow",
    category: "Development guide",
    description: "A look at how the company website is planned and built, from requirements and GitHub issues to reviews and delivery.",
  },
  {
    id: "portfolio",
    name: "Building my portfolio",
    category: "Learning notes",
    description: "Notes on organizing a Next.js portfolio, creating reusable components, and bringing a responsive interface to life.",
  },
];

export default function DocsPage() {
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
        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
          Explore the thinking behind my projects — the plans, development process, and lessons learned along the way.
        </p>
      </div>

      <section aria-labelledby="documents-heading" className="mt-14 sm:mt-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="documents-heading" className="text-xl font-semibold text-white sm:text-2xl">Project documents</h2>
          <span className="text-sm text-slate-400">{documents.length} sample documents</span>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          A preview of what is coming. These sample cards do not contain downloadable files yet. Uploading and sharing documents will be available in a future update.
        </p>
        <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <li key={document.id}><DocumentCard document={document} /></li>
          ))}
        </ul>
      </section>
    </main>
  );
}
