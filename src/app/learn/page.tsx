import type { Metadata } from "next";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { LanguageCard } from "@/components/language-card";
import { SiteHeader } from "@/components/site-header";
import { getCatalog } from "@/lib/content/get-catalog";

export const metadata: Metadata = { title: "Choose a language | CodeQuest" };

export default async function LearnPage() {
  const languages = await getCatalog();
  return (
    <main className="page-shell">
      <SiteHeader />
      <section className="learn-intro">
        <Link href="/" className="back-link"><ArrowLeft size={16} /> Back home</Link>
        <div className="eyebrow"><Sparkles size={14} /> PICK YOUR FIRST WORLD</div>
        <h1>What do you want<br />to <span className="text-gradient">make today?</span></h1>
        <p>Every expert started with one tiny step. Pick a path and let’s make yours.</p>
      </section>
      <section className="language-grid" aria-label="Available programming languages">
        {languages.map((language) => <LanguageCard key={language.slug} language={language} />)}
      </section>
      <p className="catalog-note">More worlds are being mapped out. Your next favorite language is on its way.</p>
    </main>
  );
}
