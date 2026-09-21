import Link from "next/link";
import { db } from "@/lib/db";
import {
  Code2,
  GraduationCap,
  PenTool,
  Hammer,
  PartyPopper,
} from "lucide-react";

const GROUP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Digital & Technology": Code2,
  Education: GraduationCap,
  Professional: PenTool,
  "Skilled Trades": Hammer,
  "Events & Lifestyle": PartyPopper,
};

async function getCategoryGroups() {
  const categories = await db.category.findMany({
    include: { _count: { select: { skills: true } } },
  });

  const groups = new Map<string, { slug: string; skillCount: number }[]>();
  for (const c of categories) {
    const list = groups.get(c.group) ?? [];
    list.push({ slug: c.slug, skillCount: c._count.skills });
    groups.set(c.group, list);
  }
  return Array.from(groups.entries()).map(([group, cats]) => ({
    group,
    totalSkills: cats.reduce((sum, c) => sum + c.skillCount, 0),
  }));
}

export async function CategoryGrid() {
  let groups: { group: string; totalSkills: number }[] = [];
  try {
    groups = await getCategoryGroups();
  } catch {
    // DB not yet migrated/seeded — render nothing rather than crash the page.
    return null;
  }
  if (groups.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <h2 className="max-w-[20ch] text-3xl text-ink sm:text-4xl">
        Popular service categories
      </h2>
      <p className="mt-2 max-w-[50ch] text-ink-soft">
        From logo design to electrical repairs — search by what you need
        done.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {groups.map(({ group, totalSkills }) => {
          const Icon = GROUP_ICONS[group] ?? Code2;
          return (
            <Link
              key={group}
              href={`/search?group=${encodeURIComponent(group)}`}
              className="group rounded-lg border border-line bg-white p-4 transition-colors hover:border-primary/40"
            >
              <Icon className="h-5 w-5 text-primary"  />
              <p className="mt-3 text-sm font-medium text-ink">{group}</p>
              <p className="mt-0.5 text-xs text-ink-faint">
                {totalSkills} skills
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
