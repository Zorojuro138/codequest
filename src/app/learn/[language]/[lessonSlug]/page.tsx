import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { LessonPlayer } from "@/components/lesson-player";
import { getCatalog } from "@/lib/content/get-catalog";

export default async function LessonPreviewPage({ params }: { params: Promise<{ language: string; lessonSlug: string }> }) {
  const { language: slug, lessonSlug } = await params;
  const language = (await getCatalog()).find((item) => item.slug === slug);
  const lesson = language?.units.flatMap((unit) => unit.lessons).find((item) => item.slug === lessonSlug);
  if (!language || !lesson) notFound();

  return <main className="page-shell"><SiteHeader /><LessonPlayer language={language} lesson={lesson} /></main>;
}
