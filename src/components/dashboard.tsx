"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, BookOpen, Heart, Sparkles, Star, Trophy, Zap } from "lucide-react";
import type { LanguageSummary } from "@/lib/content/catalog";
import { getLevelFromXp, totalXpForLevel } from "@/lib/gamification/levels";
import { DailyQuestList } from "@/components/daily-quest-list";
import { useGameStore } from "@/store/use-game-store";

export function Dashboard({ languages }: { languages: LanguageSummary[] }) {
  const xp = useGameStore((state) => state.totalXp);
  const streak = useGameStore((state) => state.streak);
  const longestStreak = useGameStore((state) => state.longestStreak);
  const hearts = useGameStore((state) => state.hearts);
  const records = useGameStore((state) => state.lessonRecords);
  const stats = useGameStore((state) => state.dailyStats);
  const settings = useGameStore((state) => state.settings);
  const hydrated = useGameStore((state) => state.hydrated);
  const shownRecords = useMemo(() => hydrated ? records : {}, [hydrated, records]);
  const bosses = useGameStore((state) => state.completedBosses);
  const shownBosses = useMemo(() => hydrated ? bosses : [], [hydrated, bosses]);
  const shownStats = hydrated ? stats : { ...stats, lessonsCompleted: 0, xpEarned: 0, challengeLessonIds: [] };
  const shownXp = hydrated ? xp : 0;
  const shownStreak = hydrated ? streak : 0;
  const shownHearts = hydrated ? hearts : 5;
  const shownCompleted = Object.keys(shownRecords).length;
  const levelInfo = getLevelFromXp(shownXp);
  const nextLevelXp = totalXpForLevel(levelInfo.level + 1);
  const shownSettings = hydrated ? settings : { ...settings, dailyGoal: 2 };
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayLessons = shownStats.day === todayKey ? shownStats.lessonsCompleted : 0;
  const nextQuest = useMemo(() => {
    for (const language of languages) {
      let priorWorldCleared = true;
      for (const unit of language.units) {
        if (priorWorldCleared) {
          for (const lesson of unit.lessons) {
            if (!shownRecords[lesson.slug]) return { kind: "lesson" as const, language, lesson };
          }
          const bossId = `${language.slug}-unit-${unit.order}-boss`;
          if (!shownBosses.includes(bossId)) return { kind: "boss" as const, language, unit };
        }
        const bossId = `${language.slug}-unit-${unit.order}-boss`;
        priorWorldCleared = unit.lessons.every((lesson) => Boolean(shownRecords[lesson.slug])) && shownBosses.includes(bossId);
      }
    }
    return null;
  }, [languages, shownRecords, shownBosses]);
  const nextHref = nextQuest?.kind === "lesson"
    ? `/learn/${nextQuest.language.slug}/${nextQuest.lesson.slug}`
    : nextQuest?.kind === "boss" ? `/learn/${nextQuest.language.slug}/boss/${nextQuest.unit.order}` : null;

  return <main className="page-shell app-page dashboard-page">
    <section className="dashboard-welcome"><div><div className="eyebrow"><Sparkles size={14} /> YOUR ADVENTURE, YOUR PACE</div><h1>Hey, <span className="text-gradient">Quest learner.</span></h1><p>Every tiny step is a big deal. Here’s your world today.</p></div><div className="welcome-sticker">🦊<span>you’ve got this</span></div></section>
    <section className="player-hud" aria-label="Your player stats">
      <article className="player-level-card"><div className="level-orb">{levelInfo.level}</div><div className="player-level-copy"><span className="hud-label">PLAYER LEVEL</span><div className="xp-line"><strong>{shownXp.toLocaleString()} XP</strong><span>{nextLevelXp.toLocaleString()} XP next</span></div><div className="level-meter"><i style={{ width: `${levelInfo.progress}%` }} /></div><small>Level up by completing quests and boss challenges.</small></div></article>
      <article className="player-stat-card streak-card"><div className="stat-icon">🔥</div><span className="hud-label">CURRENT STREAK</span><strong>{shownStreak} <small>days</small></strong><p>Best: {hydrated ? longestStreak : 0} days</p></article>
      <article className="player-stat-card heart-card"><div className="stat-icon"><Heart size={20} fill="currentColor" /></div><span className="hud-label">HEARTS</span><strong>{shownHearts}<small> / 5</small></strong><p>Lessons restore a heart.</p></article>
      <article className="player-stat-card lesson-stat-card"><div className="stat-icon"><BookOpen size={20} /></div><span className="hud-label">QUESTS DONE</span><strong>{shownCompleted}<small> / 24</small></strong><p>Your skills are stacking up.</p></article>
    </section>
    <section className="dashboard-columns">
      <div className="dashboard-main-column">
        <article className="continue-card">
          <div className="continue-card-content"><div className="eyebrow"><Zap size={14} fill="currentColor" /> PICK UP YOUR SWORD</div><h2>{nextQuest?.kind === "lesson" ? nextQuest.lesson.title : nextQuest?.kind === "boss" ? `${nextQuest.unit.title} boss` : "You cleared the whole map!"}</h2><p>{nextQuest ? `Continue your ${nextQuest.language.name} adventure. One focused quest is all it takes.` : "Take a victory lap through your completed lessons, or explore another language."}</p>
            {nextHref ? <Link className="button button-primary button-large" href={nextHref}>Continue quest <ArrowRight size={17} /></Link> : <Link className="button button-primary button-large" href="/learn">Explore languages <ArrowRight size={17} /></Link>}
          </div><div className="continue-illustration">{nextQuest?.language.icon ?? "🏆"}<span>✦</span></div>
        </article>
        <DailyQuestList />
      </div>
      <aside className="dashboard-side-column">
        <article className="daily-goal-card"><div className="side-card-heading"><div><div className="eyebrow"><Star size={13} /> DAILY GOAL</div><h2>Keep the streak glowing</h2></div><span className="goal-emoji">🎯</span></div><div className="goal-count"><strong>{todayLessons}</strong><span> / {shownSettings.dailyGoal} lessons</span></div><div className="goal-meter"><i style={{ width: `${Math.min(100, Math.round(todayLessons / shownSettings.dailyGoal * 100))}%` }} /></div><p>{todayLessons >= shownSettings.dailyGoal ? "You hit today’s goal. Amazing work!" : `${Math.max(0, shownSettings.dailyGoal - todayLessons)} more to hit your goal.`}</p></article>
        <article className="language-progress-card"><div className="side-card-heading"><div><div className="eyebrow"><Trophy size={13} /> YOUR WORLDS</div><h2>Pick a path</h2></div></div>{languages.map((language) => { const done = language.units.reduce((sum, unit) => sum + unit.lessons.filter((lesson) => shownRecords[lesson.slug]).length, 0); const count = language.units.reduce((sum, unit) => sum + unit.lessons.length, 0); return <Link href={`/learn/${language.slug}`} className="language-progress-row" key={language.slug}><span className="language-progress-icon">{language.icon}</span><span className="language-progress-info"><strong>{language.name}</strong><small>{done} of {count} quests</small><i><b style={{ width: `${Math.round(done / count * 100)}%` }} /></i></span><ArrowRight size={15} /></Link>; })}<Link className="browse-languages" href="/learn">Browse all worlds <ArrowRight size={15} /></Link></article>
        <div className="dash-encouragement"><span>🌈</span><p>Progress isn’t a race. It’s a collection of small wins that belong to you.</p></div>
      </aside>
    </section>
  </main>;
}
