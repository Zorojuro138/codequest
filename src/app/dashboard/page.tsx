import { SiteHeader } from "@/components/site-header";
import { Dashboard } from "@/components/dashboard";
import { getCatalog } from "@/lib/content/get-catalog";

export default async function DashboardPage() {
  const languages = await getCatalog();
  return <><SiteHeader /><Dashboard languages={languages} /></>;
}
