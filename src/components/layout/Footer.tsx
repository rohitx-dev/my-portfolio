export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#080b14]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-8 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
        <div>
          <a
            href="#home"
            aria-label="Rohit Singh — Home"
            className="rounded text-lg font-bold tracking-tight text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
          >
            ROHIT SINGH<span className="text-violet-400">.</span>
          </a>

          <p className="mt-2 text-xs leading-6 text-slate-400">
            © {new Date().getFullYear()} Rohit Singh. Built with Next.js
            and Tailwind CSS.
          </p>
        </div>

        <a
          href="#home"
          className="group inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-violet-400/40 hover:bg-violet-400/5 hover:text-violet-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
        >
          Back to top
          <span
            aria-hidden="true"
            className="motion-safe:transition-transform motion-safe:group-hover:-translate-y-1"
          >
            ↑
          </span>
        </a>
      </div>
    </footer>
  );
}