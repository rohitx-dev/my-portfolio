"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Skills", href: "/#skills" },
  { label: "Projects", href: "/#projects" },
  { label: "Docs", href: "/docs" },
  { label: "Contact", href: "/#contact" },
];

const resumePath = "/resumes/Rohit-Singh-Resume.pdf";

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 16v4h14v-4" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <header
      className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6"
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          menuButtonRef.current?.focus();
        }
      }}
    >
      <div className="relative mx-auto max-w-6xl">
        <div className="flex h-16 items-center justify-between gap-3 rounded-full border border-white/10 bg-[#101729]/90 px-5 shadow-lg shadow-black/15 backdrop-blur-xl lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4 lg:px-7">
          {/* Left: Logo */}
          <Link
            href="/#home"
            onClick={() => setMenuOpen(false)}
            aria-label="Rohit Singh — Home"
            className="shrink-0 justify-self-start whitespace-nowrap rounded text-lg font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 sm:text-xl"
          >
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ROHITSINGH.DEV
            </span>
          </Link>

          {/* Center: Desktop navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden lg:block"
          >
            <ul className="flex items-center gap-1 text-sm font-medium text-slate-400">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="group relative inline-flex min-h-11 items-center rounded px-3 text-sm font-medium text-slate-400 transition-colors hover:text-white aria-[current=page]:text-violet-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
                  >
                    {item.label}

                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right: Desktop resume button */}
          <a
            href={resumePath}
            download="Rohit-Singh-Resume.pdf"
            className="hidden min-h-11 items-center justify-center gap-2 justify-self-end whitespace-nowrap rounded-full border border-violet-400/40 bg-violet-500/5 px-4 text-sm font-medium text-violet-200 transition-colors hover:border-violet-400 hover:bg-violet-500/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 lg:inline-flex"
          >
            Download Resume
            <DownloadIcon />
          </a>

          {/* Mobile toggle */}
          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMenuOpen((open) => !open)}
            className="ml-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-200 transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-violet-400 lg:hidden"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path
                d={
                  menuOpen
                    ? "M6 6l12 12M6 18L18 6"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          hidden={!menuOpen}
          className="absolute inset-x-0 top-full mt-3 rounded-2xl border border-white/10 bg-[#101729]/95 p-3 shadow-xl backdrop-blur-xl lg:hidden"
        >
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-violet-400/10 hover:text-white aria-[current=page]:text-violet-200 focus-visible:outline-2 focus-visible:outline-violet-400"
                >
                  {item.label}
                </Link>
              </li>
            ))}

            <li className="mt-2 border-t border-white/10 pt-3">
              <a
                href={resumePath}
                download="Rohit-Singh-Resume.pdf"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-violet-400/40 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-200 transition-colors hover:bg-violet-500/20 focus-visible:outline-2 focus-visible:outline-violet-400"
              >
                Download Resume
                <DownloadIcon />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
