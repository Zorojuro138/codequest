import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { UnitBoss } from "@/components/unit-boss";
import { getCatalog } from "@/lib/content/get-catalog";

export default async function UnitBossPage({ params }: { params: Promise<{ language: string; unit: string }> }) {
  const { language: slug, unit: rawUnit } = await params;
  const language = (await getCatalog()).find((item) => item.slug === slug);
  const unitOrder = Number(rawUnit);
  if (!language || !Number.isInteger(unitOrder) || !language.units.some((item) => item.order === unitOrder)) notFound();
  return <main className="page-shell"><SiteHeader /><UnitBoss language={language} unitOrder={unitOrder} /></main>;
}
