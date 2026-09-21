const steps = [
  {
    n: "1",
    title: "Search or post a job",
    body: "Look for a service directly, or describe what you need and let providers apply.",
  },
  {
    n: "2",
    title: "Review verified profiles and hire",
    body: "Check verification status, portfolio, ratings, and past work before you commit.",
  },
  {
    n: "3",
    title: "Pay securely, get it done",
    body: "Funds are held until you approve the work. We take a 10% fee — the provider keeps the rest.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <h2 className="max-w-[20ch] text-3xl text-ink sm:text-4xl">How it works</h2>

        <div className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {steps.map((s) => (
            <div key={s.n} className="border-t-2 border-primary pt-5">
              <span className="font-display text-2xl text-primary">{s.n}</span>
              <h3 className="mt-2 text-lg font-medium text-ink">{s.title}</h3>
              <p className="mt-2 text-[0.95rem] text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
