import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LanguageSummary } from "@/lib/content/catalog";

const themes: Record<string, string> = { python: "python-card", javascript: "javascript-card" };

export function LanguageCard({ language }: { language: LanguageSummary }) {
  const lessons = language.units.reduce((sum, unit) => sum + unit.lessons.length, 0);
  return (
    <Link href={`/learn/${language.slug}`} className={`language-card ${themes[language.slug] ?? "default-card"}`}>
      <div className="language-card-top">
        <span className="language-emoji" aria-hidden="true">{language.icon}</span>
        <span className="card-arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
      </div>
      <div>
        <h3>{language.name}</h3>
        <p>{language.description}</p>
      </div>
      <div className="language-card-bottom">
        <span>{language.units.length} worlds</span>
        <span>{lessons} bite-size lessons</span>
      </div>
    </Link>
  );
}
