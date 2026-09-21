import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const columns = [
  {
    title: "Find talent",
    links: [
      { href: "/search", label: "Search services" },
      { href: "/post-a-job", label: "Post a job" },
      { href: "/categories", label: "Browse categories" },
    ],
  },
  {
    title: "Provide a skill",
    links: [
      { href: "/register?type=provider", label: "Become a provider" },
      { href: "/verification", label: "Get verified" },
      { href: "/how-it-works", label: "How payouts work" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/trust-safety", label: "Trust & safety" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={2.25} />
              <span className="font-display text-lg font-medium text-ink">VeriHire</span>
            </div>
            <p className="mt-3 max-w-[26ch] text-sm text-ink-faint">
              Verified skilled talent, starting with university students.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-medium text-ink">{col.title}</h4>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-ink-faint hover:text-ink-soft"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-line pt-6 text-xs text-ink-faint sm:flex-row">
          <p>© {new Date().getFullYear()} VeriHire. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
