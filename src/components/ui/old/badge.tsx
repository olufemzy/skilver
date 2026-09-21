import { cn } from "@/lib/utils";
import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-medium text-gold-dark",
        className
      )}
    >
      <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
      Verified Student
    </span>
  );
}

const toneClasses = {
  neutral: "bg-ink/5 text-ink-soft",
  pending: "bg-gold/15 text-gold-dark",
  success: "bg-primary/10 text-primary",
  danger: "bg-danger/10 text-danger",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneClasses;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
