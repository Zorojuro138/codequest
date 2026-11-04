"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Crown, Flame, Heart, LockKeyhole, Sparkles, Star } from "lucide-react";
import type { LanguageSummary } from "@/lib/content/catalog";
import { getLevelFromXp, totalXpForLevel } from "@/lib/gamification/levels";
import { useGameStore } from "@/store/use-game-store";

export function LanguageMap({ language }: { language: LanguageSummary }) {
  const xp = useGameStore((state) => state.totalXp);
  const records = useGameStore((state) => state.lessonRecords);
  const bosses = useGameStore((state) => state.completedBosses);
  const hearts = useGameStore((state) => state.hearts);
  const streak = useGameStore((state) => state.streak);
  const hydrated = useGameStore((state) => state.hydrated);
  const shownRecords = hydrated ? records : {};
  const shownBosses = hydrated ? bosses : [];
  const shownXp = hydrated ? xp : 0;
  const shownHearts = hydrated ? hearts : 5;
  const shownStreak = hydrated ? streak : 0;
  const levelInfo = getLevelFromXp(hydrated ? xp : 0);
  const nextXp = totalXpForLevel(levelInfo.level + 1);
  let previousUnitComplete = true;

  return (
    <div className="map-content">
      <div className="map-hero-hud">
        <div className="map-level-card"><div className="level-orb">{levelInfo.level}</div><div className="level-copy"><span>LEVEL {String(levelInfo.level).padStart(2, "0")}</span><strong>{shownXp.toLocaleString()} XP</strong><div className="level-meter"><i style={{ width: `${levelInfo.progress}%` }} /></div><small>{Math.max(0, nextXp - shownXp)} XP to next level</small></div></div>
        <div className="map-mini-stat"><Flame size={19} fill="currentColor" /><div><strong>{shownStreak}</strong><small>day streak</small></div></div>
        <div className="map-mini-stat hearts-stat"><Heart size={18} fill="currentColor" /><div><strong>{shownHearts}/5</strong><small>hearts</small></div></div>
      </div>
      <div className="map-intro map-intro-inner">
        <Link href="/learn" className="back-link"><ArrowLeft size={16} /> All languages</Link>
        <div className="map-title-row">
          <div className={`map-language-icon ${language.slug}`}>{language.icon}</div>
          <div><div className="eyebrow"><Sparkles size={14} /> YOUR LEARNING WORLD</div><h1>{language.name} <span className="text-gradient">adventure</span></h1><p>{language.description}</p></div>
        </div>
        <div className="map-stats"><span>🗺️ {language.units.length} worlds</span><span>⚡ {language.units.reduce((sum, unit) => sum + unit.lessons.length, 0)} quests</span><span>🌱 Beginner friendly</span></div>
      </div>

      <section className="world-path" aria-label={`${language.name} learning path`}>
        {language.units.map((unit) => {
          const unitDone = unit.lessons.every((lesson) => shownRecords[lesson.slug]);
          const bossId = `${language.slug}-unit-${unit.order}-boss`;
          const bossDone = shownBosses.includes(bossId);
          const unitUnlocked = previousUnitComplete;
          let previousLessonComplete = true;
          const lessonCards = unit.lessons.map((lesson) => {
            const record = shownRecords[lesson.slug];
            const unlocked = unitUnlocked && previousLessonComplete;
            previousLessonComplete = Boolean(record);
            return { lesson, record, unlocked };
          });
          previousUnitComplete = unitDone && bossDone;

          return (
            <article className={`world-section ${unitUnlocked ? "world-open" : "world-locked"}`} key={unit.order}>
              <div className="world-heading"><div className={`world-number world-number-${unit.order}`}>{String(unit.order).padStart(2, "0")}</div><div><p className="world-kicker">WORLD {unit.order}</p><h2>{unit.title}</h2><p>{unit.summary}</p></div><span className="world-count">{Object.keys(shownRecords).filter((slug) => unit.lessons.some((lesson) => lesson.slug === slug)).length}/{unit.lessons.length} quests</span></div>
              <div className={`quest-list quest-list-${unit.order}`}>
                {lessonCards.map(({ lesson, record, unlocked }) => {
                  const mastered = Boolean(record && record.score >= 90 && record.hintsUsed === 0);
                  const done = Boolean(record);
                  return <div className={`quest-node ${done ? "quest-done" : unlocked ? "quest-ready" : "quest-locked"}`} key={lesson.slug}>
                    <div className={`quest-node-icon ${mastered ? "quest-mastered-icon" : ""}`} aria-hidden="true">{done ? mastered ? <Star size={17} fill="currentColor" /> : <Check size={17} /> : unlocked ? <Sparkles size={16} /> : <LockKeyhole size={15} />}</div>
                    <div className="quest-copy"><h3>{lesson.title}</h3><p>{lesson.xpReward} XP <span>·</span> {mastered ? "Mastered" : done ? "Completed" : lesson.difficulty === 1 ? "Easy" : "Getting warmer"}</p></div>
                    {unlocked && <Link href={`/learn/${language.slug}/${lesson.slug}`} aria-label={`${done ? "Replay" : "Start"} ${lesson.title}`} className="quest-go">{done ? <Check size={15} /> : <ArrowRight size={16} />}</Link>}
                    {!unlocked && <span className="quest-lock-label">UP NEXT</span>}
                  </div>;
                })}
                <Link href={unitDone && unitUnlocked ? `/learn/${language.slug}/boss/${unit.order}` : "#"} onClick={(event) => { if (!unitDone || !unitUnlocked) event.preventDefault(); }} aria-disabled={!unitDone || !unitUnlocked} tabIndex={unitDone && unitUnlocked ? 0 : -1} className={`boss-node ${bossDone ? "boss-done" : ""} ${unitDone && unitUnlocked ? "boss-ready" : "boss-locked"}`}>
                  <span className="boss-icon">{bossDone ? <Check size={18} /> : unitDone && unitUnlocked ? <Crown size={18} /> : <LockKeyhole size={16} />}</span><span className="boss-copy"><strong>{bossDone ? "Boss defeated" : "Unit boss"}</strong><small>{bossDone ? "A new world awaits" : "Mixed challenge · 3× XP"}</small></span><span className="boss-reward">{bossDone ? "DONE" : "+60 XP"}</span>
                </Link>
              </div>
            </article>
          );
        })}
      </section>
      <div className="source-note">Lesson topics follow the <a href={language.sourceUrl} target="_blank" rel="noreferrer">{language.sourceName}</a>. Each lesson includes a linked source, original explanation, quiz, and browser challenge.</div>
    </div>
  );
}
