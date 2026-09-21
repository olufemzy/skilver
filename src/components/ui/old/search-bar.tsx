"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({
  placeholder = "Electrician, graphic designer, physics tutor…",
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-3 shadow-[0_1px_0_rgba(20,26,23,0.04)] ${className ?? ""}`}
    >
      <Search className="h-5 w-5 shrink-0 text-ink-faint" strokeWidth={2} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[0.95rem] text-ink placeholder:text-ink-faint focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded bg-primary px-4 py-2 text-sm font-medium text-paper hover:bg-primary-light"
      >
        Search
      </button>
    </form>
  );
}
