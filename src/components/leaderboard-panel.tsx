"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Crown, Sparkles, Trophy } from "lucide-react";
import { useGameStore } from "@/store/use-game-store";

export function LeaderboardPanel() {
  const [scope, setScope] = useState<"weekly" | "alltime">("weekly");
  const xp = useGameStore((state) => state.totalXp);
  const events = useGameStore((state) => state.xpEvents);
  const hydrated = useGameStore((state) => state.hydrated);
  const weeklyXp = useMemo(() => {
    const now = new Date();
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return events.filter((event) => new Date(event.createdAt) >= monday).reduce((sum, event) => sum + event.amount, 0);
  }, [events]);
  const displayedXp = !hydrated ? 0 : scope === "weekly" ? weeklyXp : xp;

  return <main className="page-shell app-page leaderboard-page">
    <section className="leaderboard-hero"><div className="leaderboard-trophy"><Trophy size={35} /></div><div className="eyebrow"><Sparkles size={14} /> FRIENDLY COMPETITION</div><h1>XP goes <span className="text-gradient">brrr.</span></h1><p>Every quest counts. Check your score and keep climbing.</p><div className="leaderboard-tabs"><button className={scope === "weekly" ? "active" : ""} onClick={() => setScope("weekly")}>This week</button><button className={scope === "alltime" ? "active" : ""} onClick={() => setScope("alltime")}>All time</button></div></section>
    <section className="leaderboard-content"><div className="leaderboard-board-heading"><div><div className="eyebrow">{scope === "weekly" ? "WEEKLY RANKINGS" : "ALL-TIME RANKINGS"}</div><h2>Your climb</h2></div><span className="board-reset">{scope === "weekly" ? "Resets Monday" : "Lifetime XP"}</span></div>
      <div className="your-rank-card"><div className="your-rank-burst"><Crown size={18} fill="currentColor" /></div><div className="rank-number">—</div><div className="rank-avatar">🧑‍🚀</div><div className="rank-copy"><strong>You · Quest learner</strong><small>{scope === "weekly" ? "Your XP earned this week" : "Your all-time XP"}</small></div><strong className="rank-xp">{displayedXp.toLocaleString()} <small>XP</small></strong></div>
      <div className="leaderboard-empty"><div>🌎</div><h3>Your community is loading in</h3><p>Live rankings appear when CodeQuest accounts are connected. For now, your XP is safely saved on this device.</p><Link href="/settings">Set up your account <ArrowRight size={15} /></Link></div>
    </section>
  </main>;
}
