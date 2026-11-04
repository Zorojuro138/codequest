import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Sign up | CodeQuest" };

export default function SignupPage() {
  return (
    <main className="page-shell auth-shell">
      <SiteHeader />
      <div className="auth-wrap">
        <div className="auth-art auth-art-pink"><span className="auth-art-star">✦</span><span className="auth-art-code">{`{ code: fun }`}</span><span className="auth-art-orbit">✷</span></div>
        <section className="auth-panel">
          <Link href="/" className="back-link"><ArrowLeft size={16} /> Back home</Link>
          <div className="eyebrow"><Sparkles size={14} /> YOUR NEXT CHAPTER STARTS HERE</div>
          <h1>Small steps.<br /><span className="text-gradient">Big brain energy.</span></h1>
          <p className="auth-lede">Make an account and turn “I should learn to code” into “look what I made.”</p>
          <AuthForm mode="signup" />
        </section>
      </div>
    </main>
  );
}
