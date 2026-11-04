import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { LanguageMap } from "@/components/language-map";
import { getCatalog } from "@/lib/content/get-catalog";

export async function generateMetadata({ params }: { params: Promise<{ language: string }> }): Promise<Metadata> {
  const { language: slug } = await params;
  const language = (await getCatalog()).find((item) => item.slug === slug);
  return { title: language ? `${language.name} world | CodeQuest` : "Learn | CodeQuest" };
}

export default async function LanguagePage({ params }: { params: Promise<{ language: string }> }) {
  const { language: slug } = await params;
  const language = (await getCatalog()).find((item) => item.slug === slug);
  if (!language) notFound();

  return (
    <main className="page-shell map-shell">
      <SiteHeader />
      <LanguageMap language={language} />
    </main>
  );
}
