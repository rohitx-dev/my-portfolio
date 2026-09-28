const highlights = [
  {
    number: "01",
    title: "Frontend development",
    description:
      "Building responsive interfaces with Next.js, TypeScript, and Tailwind CSS.",
  },
  {
    number: "02",
    title: "Backend & databases",
    description:
      "Learning to connect interfaces with Express APIs and practicing SQL for real projects.",
  },
  {
    number: "03",
    title: "Learning through projects",
    description:
      "Developing Valoura while practicing reusable components and GitHub workflows.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="border-t border-white/5 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
          About me
        </p>

        <h2
          id="about-heading"
          className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Learning by building.
          <span className="block text-slate-400">
            Improving with every project.
          </span>
        </h2>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Background */}
          <div>
            <p className="text-base leading-8 text-slate-300">
              I’m Rohit Singh, a B.Tech graduate in Information Technology
              with an interest in full-stack web development. I enjoy
              turning ideas into interfaces and understanding how the
              systems behind them work.
            </p>

            <p className="mt-5 text-base leading-8 text-slate-400">
              I’m currently building Valoura, a wedding services
              marketplace. Through this project, I’m practicing frontend
              development, backend APIs, and a structured GitHub workflow,
              one feature at a time.
            </p>

            <p className="mt-5 text-base leading-8 text-slate-400">
              My goal is to write clear, maintainable code and build
              useful applications while strengthening my development
              fundamentals.
            </p>

            <div className="mt-8 rounded-xl border border-violet-400/15 bg-violet-400/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
                Education
              </p>

              <p className="mt-2 text-sm font-medium text-white">
                B.Tech in Information Technology
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Class of 2026
              </p>
            </div>
          </div>

          {/* Current focus */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-200">
              What I’m focused on
            </h3>

            <ul className="space-y-4">
              {highlights.map((item) => (
                <li
                  key={item.number}
                  className="group flex gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-colors duration-300 hover:border-violet-400/30 hover:bg-violet-400/5"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-400/10 font-mono text-sm text-violet-300"
                  >
                    {item.number}
                  </span>

                  <div>
                    <h4 className="text-base font-semibold text-white">
                      {item.title}
                    </h4>

                    <p className="mt-2 text-sm leading-7 text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}