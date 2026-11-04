import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Log in | CodeQuest" };

export default function LoginPage() {
  return (
    <main className="page-shell auth-shell">
      <SiteHeader />
      <div className="auth-wrap">
        <div className="auth-art auth-art-blue"><span className="auth-art-star">✦</span><span className="auth-art-code">&lt;hello/&gt;</span><span className="auth-art-orbit">⚡</span></div>
        <section className="auth-panel">
          <Link href="/" className="back-link"><ArrowLeft size={16} /> Back home</Link>
          <div className="eyebrow"><Sparkles size={14} /> WELCOME BACK, QUESTer</div>
          <h1>Pick up where<br />your <span className="text-gradient">curiosity left off.</span></h1>
          <p className="auth-lede">Your next little win is just around the corner.</p>
          <AuthForm mode="login" />
        </section>
      </div>
    </main>
  );
}
