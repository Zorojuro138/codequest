import allowlist from "../content/sources.allowlist.json";
import { catalog } from "../src/lib/content/catalog";

const allowed = new Set(allowlist.sources.map((source) => source.name));
const errors: string[] = [];

for (const language of catalog) {
  if (!allowed.has(language.sourceName)) errors.push(`${language.slug}: source is not in the allowlist`);
  if (!language.sourceUrl.startsWith("https://")) errors.push(`${language.slug}: source URL must use HTTPS`);
  for (const unit of language.units) {
    if (unit.lessons.length !== 4) errors.push(`${language.slug}/${unit.order}: expected four lessons`);
    for (const lesson of unit.lessons) {
      if (!lesson.title.trim() || !lesson.slug.trim()) errors.push(`${language.slug}/${unit.order}: lesson is missing a title or slug`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${catalog.length} languages and ${catalog.reduce((count, language) => count + language.units.reduce((total, unit) => total + unit.lessons.length, 0), 0)} lessons.`);
}
