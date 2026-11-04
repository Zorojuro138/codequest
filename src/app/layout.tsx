import type { Metadata } from "next";
import "./globals.css";
import { ThemeSync } from "@/components/theme-sync";

export const metadata: Metadata = {
  title: "CodeQuest — Code a little. Glow a lot.",
  description: "Learn to code through colorful, bite-size quests. No experience needed.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ThemeSync />{children}</body></html>;
}
