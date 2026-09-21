import { LinkButton } from "@/components/ui/old/button";

export function CtaSection() {
  return (
    <section className="border-t border-line bg-primary">
      <div className="mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 sm:py-20">
        <h2 className="mx-auto max-w-[22ch] text-3xl text-paper sm:text-4xl">
          Whichever side you're on, it starts with one sign-up.
        </h2>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <LinkButton href="/search" variant="secondary" size="lg">
            Find a Service
          </LinkButton>
          <LinkButton
            href="/register?type=provider"
            variant="outline"
            size="lg"
            className="border-paper/30 text-paper hover:border-paper/60"
          >
            Become a Provider
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
