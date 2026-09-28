const skillGroups = [
  {
    number: "01",
    title: "Frontend",
    description: "Creating responsive layouts and reusable interfaces.",
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
    ],
  },
  {
    number: "02",
    title: "Backend & Data",
    description: "Developing API skills and practicing database queries.",
    skills: ["Node.js", "Express", "SQL", "Zod"],
  },
  {
    number: "03",
    title: "Tools & Workflow",
    description: "Organizing code and working through features step by step.",
    skills: ["Git", "GitHub", "VS Code", "npm", "GitHub Actions"],
  },
];

export default function Skills() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="border-t border-white/5 bg-white/[0.01] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
          My toolkit
        </p>

        <h2
          id="skills-heading"
          className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Technologies I’m working with.
        </h2>

        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400">
          Tools and technologies I’m using and strengthening through
          projects, practice, and continuous learning.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group) => (
            <article
              key={group.title}
              className="rounded-2xl border border-white/10 bg-[#101522] p-6 transition-colors duration-300 hover:border-violet-400/40 hover:bg-[#141a2b] motion-safe:transition-[transform,background-color,border-color] motion-safe:hover:-translate-y-1"
            >
              <span
                aria-hidden="true"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/10 font-mono text-sm text-violet-300"
              >
                {group.number}
              </span>

              <h3 className="mt-5 text-xl font-semibold text-white">
                {group.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {group.description}
              </p>

              <ul
                aria-label={`${group.title} technologies`}
                className="mt-6 flex flex-wrap gap-2"
              >
                {group.skills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}