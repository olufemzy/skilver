import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORY_GROUPS: Record<string, string[]> = {
  "Digital & Technology": [
    "Web Development",
    "App Development",
    "Programming",
    "Graphic Design",
    "UI/UX Design",
    "Video Editing",
    "Animation",
    "Data Analysis",
    "Data Entry",
    "Virtual Assistance",
    "Digital Marketing",
  ],

  Education: [
    "Tutoring",
    "Assignment & Research Assistance",
    "Exam Preparation",
    "Language Lessons",
  ],

  Professional: [
    "Writing",
    "Copywriting",
    "Research",
    "Photography",
    "Social Media Management",
    "Accounting & Bookkeeping",
  ],

  "Skilled Trades": [
    "Electrical Work",
    "Plumbing",
    "Carpentry",
    "Welding",
    "Painting",
    "Tiling",
    "Furniture Making",
    "Phone Repairs",
    "Appliance Repairs",
    "Shoemaking",
    "Tailoring",
    "Fashion Design",
    "Barbing",
    "Makeup Artistry",
  ],

  "Events & Lifestyle": [
    "Catering",
    "Event Decoration",
    "Event Photography",
    "Videography",
    "MC & DJ Services",
    "Event Planning",
  ],
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  // Seed categories and skills
  for (const [group, skills] of Object.entries(CATEGORY_GROUPS)) {
    const category = await prisma.category.upsert({
      where: {
        slug: slugify(group),
      },
      update: {},
      create: {
        name: group,
        slug: slugify(group),
      },
    });

    for (const skillName of skills) {
      await prisma.skill.upsert({
        where: {
          name: skillName,
        },
        update: {},
        create: {
          name: skillName,
          slug: slugify(skillName),
          categoryId: category.id,
        },
      });
    }
  }

  console.log("Seed complete: categories and skills.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });