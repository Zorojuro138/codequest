import { SiteHeader } from "@/components/site-header";
import { ProfileSummary } from "@/components/profile-summary";
import { getCatalog } from "@/lib/content/get-catalog";

export default async function ProfilePage() {
  const languages = await getCatalog();
  return <><SiteHeader /><ProfileSummary languages={languages} /></>;
}
