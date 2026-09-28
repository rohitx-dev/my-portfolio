export default function Home() {
  return (
    <main id="main-content">
      <section
        id="home"
        aria-labelledby="home-heading"
        className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-24"
      >
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-violet-400">
            Rohit Singh
          </p>

          <h1
            id="home-heading"
            className="text-4xl font-bold leading-tight text-white sm:text-6xl"
          >
            Building thoughtful experiences for the web.
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-slate-400">
            I’m an Information Technology graduate developing my skills
            through practical web projects.
          </p>
        </div>
      </section>
    </main>
  );
}