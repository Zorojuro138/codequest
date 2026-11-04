import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { RunnerType } from "../src/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";
import { catalog } from "../src/lib/content/catalog";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DATABASE_URL in .env before seeding.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const sources = [
    { id: "python-docs", name: "Python Documentation", baseUrl: "https://docs.python.org/3/tutorial/", license: "Official documentation; lessons are original paraphrases" },
    { id: "mdn-javascript", name: "MDN Web Docs", baseUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", license: "CC BY-SA 2.5 or later; lessons are original paraphrases" },
  ];

  for (const source of sources) {
    await prisma.source.upsert({ where: { id: source.id }, update: source, create: source });
  }

  for (const language of catalog) {
    const languageId = `lang-${language.slug}`;
    await prisma.language.upsert({
      where: { slug: language.slug },
      update: { name: language.name, description: language.description, runnerType: language.runnerType as RunnerType },
      create: {
        id: languageId,
        slug: language.slug,
        name: language.name,
        description: language.description,
        runnerType: language.runnerType as RunnerType,
        units: {
          create: language.units.map((unit) => ({
            order: unit.order,
            title: unit.title,
            summary: unit.summary,
            lessons: {
              create: unit.lessons.map((lesson) => ({
                slug: lesson.slug,
                order: lesson.order,
                title: lesson.title,
                xpReward: lesson.xpReward,
                difficulty: lesson.difficulty,
                sourceId: language.slug === "python" ? "python-docs" : "mdn-javascript",
                steps: lesson.steps,
              })),
            },
          })),
        },
      },
    });

    for (const unit of language.units) {
      await prisma.unit.upsert({
        where: { languageId_order: { languageId, order: unit.order } },
        update: { title: unit.title, summary: unit.summary },
        create: { languageId, order: unit.order, title: unit.title, summary: unit.summary },
      });
      const unitRecord = await prisma.unit.findUniqueOrThrow({ where: { languageId_order: { languageId, order: unit.order } } });
      for (const lesson of unit.lessons) {
        await prisma.lesson.upsert({
          where: { slug: lesson.slug },
          update: { title: lesson.title, order: lesson.order, xpReward: lesson.xpReward, steps: lesson.steps, sourceId: language.slug === "python" ? "python-docs" : "mdn-javascript" },
          create: {
            unitId: unitRecord.id,
            slug: lesson.slug,
            order: lesson.order,
            title: lesson.title,
            xpReward: lesson.xpReward,
            difficulty: lesson.difficulty,
            sourceId: language.slug === "python" ? "python-docs" : "mdn-javascript",
            steps: lesson.steps,
          },
        });
      }
    }
  }

  await prisma.badge.upsert({ where: { key: "first_lesson" }, update: {}, create: { key: "first_lesson", name: "First Steps", description: "Complete your first lesson.", iconUrl: "🌱", rule: { lessonsCompleted: 1 } } });
  console.log(`Seeded ${catalog.length} languages, ${catalog.reduce((sum, item) => sum + item.units.length, 0)} units, and ${catalog.reduce((sum, item) => sum + item.units.reduce((unitSum, unit) => unitSum + unit.lessons.length, 0), 0)} lessons.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
