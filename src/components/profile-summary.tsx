"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Flame, Heart, Star, Trophy, Zap } from "lucide-react";
import type { LanguageSummary } from "@/lib/content/catalog";
import { getLevelFromXp } from "@/lib/gamification/levels";
import { useGameStore } from "@/store/use-game-store";

const badges = [
  { key: "first_lesson", icon: "🌱", name: "First Steps", detail: "Finish your first lesson" },
  { key: "five_lessons", icon: "🧩", name: "Puzzle Picker", detail: "Finish five lessons" },
  { key: "seven_day_streak", icon: "🔥", name: "On a Roll", detail: "Keep a 7 day streak" },
  { key: "boss_slayer", icon: "👑", name: "Boss Slayer", detail: "Defeat a unit boss" },
];

function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }

export function ProfileSummary({ languages }: { languages: LanguageSummary[] }) {
  const xp = useGameStore((state) => state.totalXp);
  const streak = useGameStore((state) => state.streak);
  const longestStreak = useGameStore((state) => state.longestStreak);
  const records = useGameStore((state) => state.lessonRecords);
  const earned = useGameStore((state) => state.earnedBadges);
  const bosses = useGameStore((state) => state.completedBosses);
  const hydrated = useGameStore((state) => state.hydrated);
  const shownRecords = useMemo(() => hydrated ? records : {}, [hydrated, records]);
  const shownEarned = hydrated ? earned : [];
  const shownBosses = hydrated ? bosses : [];
  const level = getLevelFromXp(hydrated ? xp : 0).level;
  const activeDays = useMemo(() => new Set(Object.values(shownRecords).map((record) => dateKey(new Date(record.completedAt)))), [shownRecords]);
  const heatmap = Array.from({ length: 90 }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - (89 - index));
    return { date, active: activeDays.has(dateKey(date)) };
  });

  return <main className="page-shell app-page profile-page">
    <section className="profile-hero"><div className="profile-avatar">🧑‍🚀<span>✦</span></div><div className="profile-intro"><div className="eyebrow">YOUR PLAYER CARD</div><h1>Quest learner <span className="profile-level-tag">LVL {level}</span></h1><p>Curious mind. Growing coder. Collecting wins one quest at a time.</p></div><Link className="button button-soft profile-edit" href="/settings">Edit settings <ArrowRight size={15} /></Link></section>
    <section className="profile-stats"><article><Zap size={19} /><span>TOTAL XP</span><strong>{(hydrated ? xp : 0).toLocaleString()}</strong></article><article><Flame size={19} /><span>BEST STREAK</span><strong>{hydrated ? longestStreak : 0} days</strong><small>Current: {hydrated ? streak : 0} days</small></article><article><Trophy size={19} /><span>BOSSES DEFEATED</span><strong>{shownBosses.length}</strong></article><article><Star size={19} /><span>LESSONS DONE</span><strong>{Object.keys(shownRecords).length}</strong></article></section>
    <section className="profile-section heatmap-section"><div className="profile-section-heading"><div><div className="eyebrow">SHOWING UP ADDS UP</div><h2>Your last 90 days</h2></div><span className="heatmap-legend">Less <i /> <i /> <i className="heat-active" /> More</span></div><div className="heatmap-grid" role="img" aria-label={`${activeDays.size} active learning days in the last 90 days`}>{heatmap.map(({ date, active }, index) => <i key={index} className={active ? "heat-active" : ""} title={`${date.toLocaleDateString()}: ${active ? "quest completed" : "no lesson recorded"}`} />)}</div></section>
    <section className="profile-columns"><div className="profile-section badges-section"><div className="eyebrow">TROPHY SHELF</div><h2>Badges & milestones</h2><div className="badge-grid">{badges.map((badge) => { const unlocked = shownEarned.includes(badge.key) || (badge.key === "boss_slayer" && shownBosses.length > 0); return <article className={`badge-card ${unlocked ? "badge-earned" : "badge-locked"}`} key={badge.key}><span>{badge.icon}</span><div><strong>{badge.name}</strong><small>{badge.detail}</small></div>{unlocked && <i>UNLOCKED</i>}</article>; })}</div></div><div className="profile-section studied-section"><div className="eyebrow">YOUR TRAINING GROUNDS</div><h2>World progress</h2>{languages.map((language) => { const total = language.units.reduce((sum, unit) => sum + unit.lessons.length, 0); const done = language.units.reduce((sum, unit) => sum + unit.lessons.filter((lesson) => shownRecords[lesson.slug]).length, 0); return <Link href={`/learn/${language.slug}`} className="studied-row" key={language.slug}><span>{language.icon}</span><div><strong>{language.name}</strong><small>{done} of {total} quests</small><i><b style={{ width: `${Math.round(done / total * 100)}%` }} /></i></div><ArrowRight size={14} /></Link>; })}<p className="hearts-footnote"><Heart size={13} /> Hearts refill when you finish a lesson.</p></div></section>
  </main>;
}
