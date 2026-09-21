import { SearchBar } from "@/components/ui/old/search-bar";
import { LinkButton } from "@/components/ui/old/button";
import { VerifiedBadge } from "@/components/ui/old/badge";
import { Star, BadgeCheck, ArrowUpRight } from "lucide-react";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16">
      <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <h1 className="max-w-[15ch] text-4xl leading-[1.08] text-ink sm:text-5xl sm:leading-[1.08]">
            Need a skilled person?
            <br />
            Find <em className="not-italic text-primary">verified</em> talent.
          </h1>

          <p className="mt-5 max-w-[46ch] text-lg text-ink-soft">
            Graphic designers, tutors, programmers, electricians, shoemakers,
            photographers, plumbers — hired from a pool of students and
            providers we've actually verified.
          </p>

          <SearchBar className="mt-8 max-w-xl" />

          <div className="mt-5 flex flex-wrap gap-3">
            <LinkButton href="/search" size="lg">
              Find a Service
            </LinkButton>
            <LinkButton href="/register?type=provider" variant="outline" size="lg">
              Become a Provider
            </LinkButton>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:mx-0">
          <div className="absolute -inset-x-4 -inset-y-4 -z-10 rounded-card bg-primary/5 sm:-inset-x-8 sm:-inset-y-8" />
          <div className="rotate-[-3deg] rounded-card border border-line bg-white p-6 shadow-[0_18px_40px_-16px_rgba(20,26,23,0.28)]">
            <div className="flex items-center justify-between">
              <span className="text-[0.7rem] font-medium uppercase tracking-wide text-ink-faint">
                Provider profile
              </span>
              <BadgeCheck className="h-4 w-4 text-gold" strokeWidth={2.5} />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-display text-base text-primary">
                JA
              </div>
              <div>
                <p className="font-medium text-ink">John Ade</p>
                <VerifiedBadge />
              </div>
            </div>

            <div className="mt-4 border-t border-line pt-4 text-sm text-ink-soft">
              <p>University of Lagos</p>
              <p>Computer Science — 300L</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {["Graphic Design", "UI/UX", "Photography"].map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-surface px-2.5 py-1 text-xs text-ink-soft"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              <div className="flex items-center gap-1 text-sm text-ink">
                <Star className="h-4 w-4 fill-gold text-gold" />
                <span className="font-medium">4.8</span>
                <span className="text-ink-faint">· 24 jobs</span>
              </div>
              <span className="inline-flex items-center gap-0.5 text-sm font-medium text-primary">
                Hire
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
