import { ShieldCheck, MessageSquare, Wallet, Star } from "lucide-react";
import { calculateCommission, formatNaira } from "@/lib/utils";

const forCustomers = [
  {
    icon: ShieldCheck,
    title: "Verification, not self-reported claims",
    body: "Student status is checked by our team before a profile shows the verified badge.",
  },
  {
    icon: Wallet,
    title: "You approve before money moves",
    body: "Payment is held until you sign off on the submitted work.",
  },
  {
    icon: Star,
    title: "Ratings that follow the provider",
    body: "Every completed job adds to a public track record — jobs done, on-time rate, reviews.",
  },
];

const forProviders = [
  {
    title: "Get found for what you're actually good at",
    body: "Skills and portfolio surface you in the searches that match.",
  },
  {
    title: "Build a work history while you're still in school",
    body: "Completed jobs, ratings, and earnings accumulate into a record you can show later.",
  },
  {
    title: "Keep 90% of what you earn",
    body: "We take a flat 10% on completed jobs. No listing fees, no subscription.",
  },
];

export function TrustSection() {
  const example = calculateCommission(50000);

  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="text-3xl text-ink sm:text-4xl">Why customers trust it</h2>
            <div className="mt-8 space-y-6">
              {forCustomers.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} />
                  <div>
                    <h3 className="font-medium text-ink">{f.title}</h3>
                    <p className="mt-1 text-sm text-ink-soft">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl text-ink sm:text-4xl">Why providers join</h2>
            <div className="mt-8 space-y-6">
              {forProviders.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" strokeWidth={1.75} />
                  <div>
                    <h3 className="font-medium text-ink">{f.title}</h3>
                    <p className="mt-1 text-sm text-ink-soft">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-lg border border-line bg-surface p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                Example, on a {formatNaira(example.jobValue)} job
              </p>
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-soft">Job value</span>
                  <span className="text-ink">{formatNaira(example.jobValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft">Platform fee ({example.commissionPercent}%)</span>
                  <span className="text-ink">−{formatNaira(example.commissionAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-line pt-1.5 font-medium">
                  <span className="text-ink">Provider receives</span>
                  <span className="text-primary">{formatNaira(example.providerEarnings)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
