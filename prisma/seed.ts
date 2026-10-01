import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORY_GROUPS: Record<string, string[]> = {
  "Technology & IT": [
    "Web Development",
    "Mobile App Development",
    "Software Development",
    "UI/UX Design",
    "Frontend Development",
    "Backend Development",
    "Data Analysis",
    "Database Management",
    "AI & Machine Learning",
    "IT Support and Troubleshooting",
    "Cybersecurity",
    "Computer Networking",
    "WordPress Development",
    "No-Code Development",
  ],

  "Graphics & Creative Design": [
    "Logo Design",
    "Brand Identity Design",
    "Flyer and Poster Design",
    "Social Media Graphics",
    "Business Card Design",
    "Presentation Design",
    "Illustration",
    "Infographics",
    "Packaging Design",
    "3D Design and Modelling",
    "Motion Graphics",
    "Print Design",
  ],

  "Writing & Communication": [
    "Content Writing",
    "Copywriting",
    "Blog and Article Writing",
    "Technical Writing",
    "Proofreading and Editing",
    "CV and Résumé Writing",
    "Proposal Writing",
    "Speech Writing",
    "Scriptwriting",
    "Transcription",
    "Translation",
    "Research Assistance",
  ],

  "Video, Photography & Media": [
    "Photography",
    "Event Photography",
    "Videography",
    "Video Editing",
    "Reels and Short-Form Video Editing",
    "Documentary Production",
    "Animation",
    "Voice-over",
    "Podcast Production",
    "Audio Editing",
    "Content Creation",
  ],

  "Education & Tutoring": [
    "Secondary School Tutoring",
    "University-Level Tutoring",
    "JAMB/UTME Preparation",
    "WAEC/NECO Preparation",
    "Post-UTME Preparation",
    "Mathematics Tutoring",
    "Science Tutoring",
    "Language Tutoring",
    "Music Lessons",
    "Coding Lessons",
    "Academic Skills Coaching",
  ],

  "Digital Marketing & Social Media": [
    "Social Media Management",
    "Digital Marketing",
    "Search Engine Optimisation (SEO)",
    "Social Media Advertising",
    "Email Marketing",
    "Content Strategy",
    "Influencer Campaign Support",
    "Community Management",
    "Marketing Research",
    "Analytics and Reporting",
  ],

  "Business & Professional Services": [
    "Virtual Assistance",
    "Data Entry",
    "Internet Research",
    "Administrative Support",
    "Customer Support",
    "Business Plan Preparation",
    "Market Research",
    "Bookkeeping",
    "Spreadsheet Management",
    "Project Coordination",
    "Presentation Preparation",
  ],

  "Engineering & Technical Services": [
    "CAD Drafting",
    "3D Modelling",
    "Architectural Visualisation",
    "Engineering Drawings",
    "Electronics Projects",
    "Robotics and Prototyping",
    "Technical Documentation",
    "Computer Hardware Repair",
    "Phone Repair",
    "Electrical Installation and Repairs",
    "Solar Installation Support",
  ],

  "Skilled Trades & Repairs": [
    "Plumbing",
    "Carpentry",
    "Furniture Making and Repairs",
    "Painting",
    "Tiling",
    "Welding and Metalwork",
    "Appliance Repairs",
    "Phone and Gadget Repairs",
    "Shoe Making and Repairs",
    "Tailoring and Clothing Repairs",
    "Interior Decoration",
    "General Handyman Services",
  ],

  "Fashion, Beauty & Personal Care": [
    "Fashion Design",
    "Clothing Alterations",
    "Makeup Artistry",
    "Hair Styling",
    "Barbing",
    "Nail Technology",
    "Fashion Illustration",
    "Fashion Photography",
    "Personal Styling",
  ],

  "Events & Hospitality": [
    "Event Planning",
    "Event Decoration",
    "Catering",
    "Baking",
    "Small-Chops Preparation",
    "MC and Hosting",
    "DJ Services",
    "Event Ushering",
    "Event Equipment Support",
  ],

  "Cleaning & Household Services": [
    "Home Cleaning",
    "Office Cleaning",
    "Laundry and Ironing",
    "Home Organisation",
    "Furniture Assembly",
    "Moving Assistance",
    "Basic Household Maintenance",
  ],

  "Research & Data Services": [
    "Survey Design",
    "Questionnaire Administration",
    "Data Collection",
    "Data Cleaning",
    "Statistical Analysis",
    "Excel and Spreadsheet Analysis",
    "Research Transcription",
    "Interview Transcription",
    "Report Formatting",
    "Data Visualisation",
  ],

  "Translation & Languages": [
    "English Editing",
    "French Translation",
    "Yoruba Translation",
    "Igbo Translation",
    "Hausa Translation",
    "Other Nigerian Language Translation",
    "Interpretation",
  ],

  "Other Student Services": [
    "CV Review",
    "Career Support",
    "Portfolio Development",
    "Presentation Coaching",
    "Personal Branding",
    "Computer Literacy Training",
    "Digital Skills Training",
  ],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Starting SkilVer database seed...\n");

  let categoryCount = 0;
  let skillCount = 0;

  for (const [categoryName, skills] of Object.entries(CATEGORY_GROUPS)) {
    const categorySlug = slugify(categoryName);

    const category = await prisma.category.upsert({
      where: {
        slug: categorySlug,
      },
      update: {
        name: categoryName,
        isActive: true,
        sortOrder: categoryCount + 1,
      },
      create: {
        name: categoryName,
        slug: categorySlug,
        isActive: true,
        sortOrder: categoryCount + 1,
      },
    });

    categoryCount++;

    console.log(`✓ Category: ${categoryName}`);

    for (const skillName of skills) {
      const skillSlug = slugify(skillName);

      await prisma.skill.upsert({
        where: {
          slug: skillSlug,
        },
        update: {
          name: skillName,
          categoryId: category.id,
          isActive: true,
        },
        create: {
          name: skillName,
          slug: skillSlug,
          categoryId: category.id,
          isActive: true,
        },
      });

      skillCount++;
    }
  }

  console.log("\n-----------------------------------");
  console.log("SkilVer database seed completed!");
  console.log(`Categories processed: ${categoryCount}`);
  console.log(`Skills processed: ${skillCount}`);
  console.log("-----------------------------------\n");
}

main()
  .catch((error) => {
    console.error("Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });