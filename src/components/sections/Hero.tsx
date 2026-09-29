import Image from "next/image";

const technologies = ["Next.js", "TypeScript", "Tailwind CSS", "Express"];

export default function Hero() {
    return (
        <section
            id="home"
            aria-labelledby="hero-heading"
            className="relative isolate overflow-hidden"
        >
            {/* Background glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-0 top-20 -z-10 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl"
            />

            <div
                className="mx-auto grid max-w-6xl items-center gap-14 px-5 pt-40 pb-16 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:gap-16"
            >
                {/* Introduction */}
                <div className="hero-enter">
                    <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/5 px-4 py-2 text-xs font-medium tracking-wide text-violet-200">
                        <span className="h-2 w-2 rounded-full bg-violet-400" />
                        LEARNING. BUILDING. IMPROVING.
                    </p>

                    <h1
                        id="hero-heading"
                        className="text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl"
                    >
                        Hi, I’m
                        <span className="mt-2 block text-violet-400">
                            Rohit Singh.
                        </span>
                    </h1>

                    <p className="mt-6 text-xl font-medium text-slate-200 sm:text-2xl">
                        Turning ideas into web experiences.
                    </p>

                    <p className="mt-5 max-w-lg text-base leading-8 text-slate-400">
                        I’m an Information Technology graduate building responsive
                        interfaces and developing my full-stack skills through hands-on
                        projects.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <a
                            href="#projects"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
                        >
                            View my projects
                            <span aria-hidden="true">↗</span>
                        </a>

                        <a
                            href="resumes/Rohit-Singh-Resume.pdf"
                            download="Rohit-Singh-Resume.pdf"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-violet-400/40 px-5 py-3 text-sm font-medium text-violet-200 transition-colors hover:border-violet-400 hover:bg-violet-500/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
                        >
                            Download Resume
                            <span aria-hidden="true">↓</span>
                        </a>

                        <a
                            href="#contact"
                            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-violet-400/50 hover:bg-violet-400/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
                        >
                            Let’s connect
                        </a>
                    </div>

                    <div className="mt-10">
                        <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                            Building with
                        </p>

                        <ul className="mt-3 flex flex-wrap gap-2">
                            {technologies.map((technology) => (
                                <li
                                    key={technology}
                                    className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300"
                                >
                                    {technology}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Developer card */}
                {/* Floating profile card */}
                <div className="hero-float mx-auto w-full max-w-sm lg:ml-auto lg:mr-0">
                    <div className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-[#1a2436] px-6 py-8 shadow-2xl shadow-violet-950/20 sm:px-8">
                        {/* Background accent */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -right-16 bottom-0 -z-10 h-56 w-56 rounded-full bg-violet-600/10 blur-3xl"
                        />

                        {/* Portrait */}
                        <div className="relative mx-auto h-36 w-36 sm:h-40 sm:w-40">
                            <div
                                aria-hidden="true"
                                className="absolute -inset-4 rounded-full bg-violet-500/30 blur-2xl"
                            />

                            <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-violet-300/80">
                                <Image
                                    src="/images/profile/rohit-profile.png"
                                    alt="Rohit Singh"
                                    fill
                                    sizes="(min-width: 640px) 160px, 144px"
                                    className="object-cover object-top"
                                    loading="eager"
                                />
                            </div>
                        </div>

                        <h2 className="mt-7 text-center text-xl font-bold tracking-tight text-white">
                            Profile Overview
                        </h2>

                        {/* Background and current focus */}
                        <dl className="mt-6 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-5 text-center">
                                <dt className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                                    Education
                                </dt>
                                <dd className="mt-2 text-xl font-bold text-white">
                                    B.Tech
                                    <span className="mt-1 block text-xs font-normal text-slate-400">
                                        Information Technology
                                    </span>
                                </dd>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-5 text-center">
                                <dt className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                                    Building
                                </dt>
                                <dd className="mt-2 text-xl font-bold text-white">
                                    Valoura
                                    <span className="mt-1 block text-xs font-normal text-slate-400">
                                        Wedding marketplace
                                    </span>
                                </dd>
                            </div>
                        </dl>

                        <div className="mt-7 text-center">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                                Main stack
                            </p>

                            <p className="mt-3 text-sm font-semibold leading-7 text-teal-200">
                                Next.js · TypeScript
                                <br />
                                Tailwind CSS · Express
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}