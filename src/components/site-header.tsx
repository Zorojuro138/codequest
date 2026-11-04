import Link from "next/link";
import { Code2, Sparkles } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="CodeQuest home">
        <span className="brand-mark"><Code2 size={19} strokeWidth={2.8} /></span>
        <span>codequest<span className="brand-period">.</span></span>
        <Sparkles className="brand-spark" size={15} aria-hidden="true" />
      </Link>
      <nav className="header-nav" aria-label="Main navigation">
        <Link href="/learn">Explore</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/leaderboard">Leaderboard</Link>
        <Link href="/profile">Profile</Link>
        <Link href="/settings">Settings</Link>
        <Link href="/login" className="button button-quiet">Log in</Link>
        <Link href="/signup" className="button button-dark">Join for free <span aria-hidden="true">↗</span></Link>
      </nav>
    </header>
  );
}
