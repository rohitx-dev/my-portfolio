"use client";
import { useRef } from "react";
import Image from "next/image";

type Project = {
    number: string;
    image: string;
    imageAlt: string;
    title: string;
    category: string;
    technologies: string[];
    previewClass: string;
    githubUrl?: string;
    liveUrl?: string;
};

const projects: Project[] = [
    {
        number: "01",
        title: "Valoura",
        category: "Wedding services marketplace",
        image: "/images/projects/project1.png",
        imageAlt: "Valoura wedding services marketplace homepage",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Express"],
        previewClass: "from-rose-950 via-purple-950 to-[#101522]",
        // Add your repository URL when ready:
        // githubUrl: "https://github.com/YOUR_USERNAME/Valoura",
    },
    {
        number: "02",
        title: "Personal Portfolio",
        category: "Developer portfolio",
        image: "/images/projects/project2.png",
        imageAlt: "Rohit Singh developer portfolio homepage",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
        previewClass: "from-indigo-950 via-violet-950 to-[#101522]",
        // Add your repository and published website URLs when ready:
        // githubUrl: "https://github.com/YOUR_USERNAME/portfolio-fresh",
        // liveUrl: "https://your-portfolio-domain.com",
    },
    {
        number: "03",
        title: "Your third project",
        category: "Project category",
        image: "/images/projects/project3.png",
        imageAlt: "Rohit Singh developer portfolio homepage",
        technologies: ["Technology 1", "Technology 2"],
        previewClass: "from-cyan-950 via-indigo-950 to-[#101522]",
        // githubUrl: "https://github.com/YOUR_USERNAME/REPOSITORY",
        // liveUrl: "https://your-project.com",
    },
];

const projectLinkClass =
    "inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-violet-400/40 hover:bg-violet-400/10 hover:text-violet-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400";

export default function Projects() {
    const carouselRef = useRef<HTMLDivElement>(null);

    function slideProjects(direction: -1 | 1) {
        const carousel = carouselRef.current;
        if (!carousel) return;

        const card = carousel.querySelector<HTMLElement>("[data-project-card]");
        if (!card) return;

        const gap = parseFloat(getComputedStyle(carousel).columnGap) || 0;
        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        carousel.scrollBy({
            left: direction * (card.getBoundingClientRect().width + gap),
            behavior: reduceMotion ? "instant" : "smooth",
        });
    }
    return (
        <section
            id="projects"
            aria-labelledby="projects-heading"
            className="border-t border-white/5 py-20 sm:py-24"
        >
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                    Selected projects
                </p>

                <h2
                    id="projects-heading"
                    className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl"
                >
                    Putting learning into practice.
                </h2>

                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400">
                    Projects I’m building to explore ideas, strengthen my skills,
                    and solve practical development challenges.
                </p>

                <div className="mt-8 flex items-center justify-between gap-4">
                    <p id="projects-hint" className="text-xs text-slate-400">
                        Swipe or use the arrows to explore.
                    </p>

                    <div className="flex shrink-0 gap-2">
                        <button
                            type="button"
                            onClick={() => slideProjects(-1)}
                            aria-label="Scroll to previous projects"
                            aria-controls="projects-carousel"
                            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-xl text-slate-200 transition-colors hover:border-violet-400/50 hover:bg-violet-400/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
                        >
                            <span aria-hidden="true">←</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => slideProjects(1)}
                            aria-label="Scroll to next projects"
                            aria-controls="projects-carousel"
                            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-xl text-slate-200 transition-colors hover:border-violet-400/50 hover:bg-violet-400/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
                        >
                            <span aria-hidden="true">→</span>
                        </button>
                    </div>
                </div>

                <div
                    id="projects-carousel"
                    ref={carouselRef}
                    role="region"
                    aria-label="Project carousel"
                    aria-describedby="projects-hint"
                    tabIndex={0}
                    className="project-carousel mt-4 flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain rounded-2xl pt-2 pb-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
                >
                    {projects.map((project) => (
                        <article
                            key={project.number}
                            data-project-card
                            className="group flex w-full min-w-0 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101522] transition-colors duration-300 hover:border-violet-400/50 motion-safe:transition-[transform,border-color] motion-safe:hover:-translate-y-1 md:w-[calc((100%_-_1.5rem)/2)] lg:w-[calc((100%_-_3rem)/3)]"
                        >
                            {/* Decorative cover; replace with a screenshot later */}
                            {/* Project screenshot */}
                            <div className="relative aspect-video overflow-hidden border-b border-white/10 bg-slate-900">
                                <Image
                                    src={project.image}
                                    alt={project.imageAlt}
                                    fill
                                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 350px"
                                    className="object-cover object-top motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                                />
                            </div>

                            <div className="flex flex-1 flex-col p-6 sm:p-7">
                                <p className="text-xs font-medium uppercase tracking-wider text-violet-300">
                                    {project.category}
                                </p>

                                <h3 className="mt-3 text-2xl font-semibold text-white">
                                    {project.title}
                                </h3>


                                <ul
                                    aria-label={`${project.title} technologies`}
                                    className="mt-5 flex flex-wrap gap-2"
                                >
                                    {project.technologies.map((technology) => (
                                        <li
                                            key={technology}
                                            className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-300"
                                        >
                                            {technology}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto pt-6">
                                    {project.githubUrl || project.liveUrl ? (
                                        <div className="flex flex-wrap gap-3">
                                            {project.githubUrl && (
                                                <a
                                                    href={project.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={`View ${project.title} code on GitHub (opens in a new tab)`}
                                                    className={projectLinkClass}
                                                >
                                                    GitHub
                                                    <span aria-hidden="true">↗</span>
                                                </a>
                                            )}

                                            {project.liveUrl && (
                                                <a
                                                    href={project.liveUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={`Visit ${project.title} website (opens in a new tab)`}
                                                    className={projectLinkClass}
                                                >
                                                    Live website
                                                    <span aria-hidden="true">↗</span>
                                                </a>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500">
                                            Project links coming soon.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}