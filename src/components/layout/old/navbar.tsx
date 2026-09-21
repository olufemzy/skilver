"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShieldCheck } from "lucide-react";
import { LinkButton } from "@/components/ui/old/button";

const links = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/categories", label: "Categories" },
  { href: "/become-a-provider", label: "Become a provider" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-1.5">
          <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={2.25} />
          <span className="font-display text-lg font-medium tracking-tight text-ink">
            VeriHire
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LinkButton href="/login" variant="ghost" size="sm">
            Log in
          </LinkButton>
          <LinkButton href="/register" variant="primary" size="sm">
            Sign up
          </LinkButton>
        </div>

        <button
          className="p-1 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line px-5 pb-5 pt-2 md:hidden">
          <nav className="flex flex-col gap-4 py-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-ink-soft"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex gap-3">
            <LinkButton href="/login" variant="outline" size="sm" className="flex-1">
              Log in
            </LinkButton>
            <LinkButton href="/register" variant="primary" size="sm" className="flex-1">
              Sign up
            </LinkButton>
          </div>
        </div>
      )}
    </header>
  );
}
