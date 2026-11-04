import { catalog, type LanguageSummary, type LessonStep } from "@/lib/content/catalog";
import { getPrisma } from "@/lib/db";

export async function getCatalog(): Promise<LanguageSummary[]> {
  if (!process.env.DATABASE_URL) return catalog;

  try {
    const rows = await getPrisma().language.findMany({
      orderBy: { name: "asc" },
      include: { units: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } },
    });
    if (rows.length === 0) return catalog;

    return rows.map((language) => {
      const fallback = catalog.find((entry) => entry.slug === language.slug);
      return {
        slug: language.slug,
        name: language.name,
        icon: fallback?.icon ?? "💻",
        runnerType: language.runnerType === "PYODIDE" ? "PYODIDE" : "JS_WORKER",
        description: language.description,
        sourceName: fallback?.sourceName ?? "Trusted documentation",
        sourceUrl: fallback?.sourceUrl ?? "https://developer.mozilla.org/",
        units: language.units.map((unit) => ({
          order: unit.order,
          title: unit.title,
          summary: unit.summary,
          lessons: unit.lessons.map((lesson) => ({
            slug: lesson.slug,
            title: lesson.title,
            order: lesson.order,
            xpReward: lesson.xpReward,
            difficulty: lesson.difficulty,
            steps: lesson.steps as unknown as LessonStep[],
          })),
        })),
      };
    });
  } catch {
    return catalog;
  }
}
