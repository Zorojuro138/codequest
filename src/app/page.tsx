import Link from "next/link";
import { ArrowRight, Check, Code2, Flame, Gamepad2, Play, Sparkles, Star, Trophy, Zap } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const features = [
  { icon: Gamepad2, title: "Learn by doing", copy: "Tiny interactive challenges turn ‘I get it’ into ‘I can do it.’", color: "feature-lime" },
  { icon: Flame, title: "Keep your streak alive", copy: "Little wins stack up. Your daily quest makes showing up feel good.", color: "feature-orange" },
  { icon: Trophy, title: "Collect your wins", copy: "Earn XP, grab badges, and watch your confidence level up.", color: "feature-blue" },
];

export default function Home() {
  return (
    <main className="page-shell landing-shell">
      <SiteHeader />
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEW FAVORITE WAY TO CODE</div>
          <h1>Code a little.<br /><span className="text-gradient">Glow a lot.</span></h1>
          <p className="hero-lede">Learning to code shouldn’t feel like homework. Take tiny quests, build real skills, and celebrate every “wait, I made that!” moment.</p>
          <div className="hero-actions">
            <Link href="/learn" className="button button-primary button-large">Start your first quest <ArrowRight size={18} /></Link>
            <Link href="#how-it-works" className="button button-soft button-large"><Play size={15} fill="currentColor" /> See how it works</Link>
          </div>
          <div className="social-proof"><div className="avatar-stack"><span>🦊</span><span>🐸</span><span>🐼</span><span>🐻</span></div><div><div className="stars" aria-label="Five star rating">★★★★★</div><p>Made for curious minds, zero experience needed</p></div></div>
        </div>
        <div className="hero-art" aria-label="A preview of the CodeQuest learning world">
          <div className="hero-spark hero-spark-one">✦</div><div className="hero-spark hero-spark-two">✳</div>
          <div className="float-pill xp-pill"><Zap size={15} fill="currentColor" /> +20 XP</div>
          <div className="map-card">
            <div className="map-card-top"><div><span className="map-small-label">YOUR FIRST WORLD</span><h2>Python basics</h2></div><div className="python-orb">🐍</div></div>
            <div className="map-progress"><div className="map-progress-line"><span /></div><div className="map-progress-label"><span>1 of 12 quests</span><span>8%</span></div></div>
            <div className="mini-path">
              <div className="path-line" />
              <div className="mini-node mini-node-done"><Check size={17} /></div>
              <div className="mini-node mini-node-current"><Code2 size={17} /></div>
              <div className="mini-node mini-node-next">✦</div>
              <div className="mini-node mini-node-last">···</div>
            </div>
            <div className="lesson-pop"><div className="lesson-pop-icon">👋</div><div><strong>Say hello to Python</strong><span>5 min · Beginner</span></div><span className="lesson-play"><Play size={13} fill="currentColor" /></span></div>
          </div>
          <div className="float-pill streak-pill"><span>🔥</span><div><strong>3 day streak!</strong><small>You’re on fire</small></div></div>
          <div className="mascot"><div className="mascot-ear ear-left"/><div className="mascot-ear ear-right"/><div className="mascot-face"><span className="mascot-eye eye-left"/><span className="mascot-eye eye-right"/><span className="mascot-smile"/></div><span className="mascot-shine">✦</span></div>
        </div>
      </section>
      <section className="quick-proof" aria-label="CodeQuest learning benefits">
        <span><Sparkles size={16} /> 5-minute lessons</span><span><Code2 size={16} /> Real code practice</span><span><Star size={16} /> Always free to start</span>
      </section>
      <section className="how-section" id="how-it-works">
        <div className="section-heading"><div className="eyebrow"><Sparkles size={14} /> THE QUEST IS SIMPLE</div><h2>Three tiny steps.<br /><span className="text-gradient">One giant skill.</span></h2></div>
        <div className="feature-grid">{features.map(({ icon: Icon, title, copy, color }, index) => <article className="feature-card" key={title}><div className={`feature-icon ${color}`}><Icon size={22} /></div><span className="feature-step">0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>
      <section className="cta-band"><div><p className="eyebrow"><Sparkles size={14} /> YOUR FUTURE SELF SAYS THANKS</p><h2>Ready when <span>you are.</span></h2><p>No pressure. No experience needed. Just you, a keyboard, and a pretty cool new skill.</p></div><Link href="/learn" className="button button-white button-large">Pick a language <ArrowRight size={18} /></Link><span className="cta-spark">✦</span></section>
      <footer className="site-footer"><Link href="/" className="brand"><span className="brand-mark"><Code2 size={18} strokeWidth={2.8} /></span><span>codequest<span className="brand-period">.</span></span></Link><span>Curiosity looks good on you.</span><span>© 2026 CodeQuest</span></footer>
    </main>
  );
}
