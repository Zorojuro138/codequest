"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Crown, Heart, LockKeyhole, Sparkles, Trophy } from "lucide-react";
import type { LanguageSummary, QuizStep } from "@/lib/content/catalog";
import { CodeChallenge } from "@/components/code-challenge";
import { useGameStore } from "@/store/use-game-store";
import { playQuestChime } from "@/lib/audio/sounds";
import { speakText } from "@/lib/voice/web-speech-tts";

export function UnitBoss({ language, unitOrder }: { language: LanguageSummary; unitOrder: number }) {
  const unit = language.units.find((item) => item.order === unitOrder);
  const records = useGameStore((state) => state.lessonRecords);
  const bosses = useGameStore((state) => state.completedBosses);
  const hearts = useGameStore((state) => state.hearts);
  const recordMistake = useGameStore((state) => state.recordMistake);
  const completeBoss = useGameStore((state) => state.completeBoss);
  const settings = useGameStore((state) => state.settings);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [quizMistakes, setQuizMistakes] = useState(0);
  const [codePassed, setCodePassed] = useState(false);
  const [finished, setFinished] = useState<{ xpGained: number; leveledUp: boolean; level: number; newBadges: string[] } | null>(null);

  if (!unit) return <div className="boss-locked-screen">That boss is not on this map.</div>;

  const bossId = `${language.slug}-unit-${unit.order}-boss`;
  const unitComplete = unit.lessons.every((lesson) => records[lesson.slug]);
  const previousBossComplete = unit.order === 1 || bosses.includes(`${language.slug}-unit-${unit.order - 1}-boss`);
  const unlocked = unitComplete && previousBossComplete;
  const quizzes = unit.lessons.map((lesson) => lesson.steps.find((step): step is QuizStep => step.type === "quiz")).filter((step): step is QuizStep => Boolean(step)).slice(0, 3);
  const finalCode = unit.lessons[unit.lessons.length - 1].steps.find((step) => step.type === "code");

  if (!unlocked) return <section className="boss-locked-screen"><div className="boss-lock-art"><LockKeyhole size={34} /></div><div className="eyebrow">THIS GATE IS STILL CLOSED</div><h1>Clear the quests first.</h1><p>Finish every lesson in {unit.title}{unit.order > 1 ? " and defeat the previous world boss" : ""} to unlock this challenge.</p><Link className="button button-primary button-large" href={`/learn/${language.slug}`}><ArrowLeft size={17} /> Back to world map</Link></section>;

  if (finished) return <section className="lesson-complete boss-complete"><div className="complete-mascot">🏆</div><div className="eyebrow"><Trophy size={15} /> WORLD BOSS DEFEATED</div><h1>That’s a legendary win!</h1><p>You cleared the {unit.title} boss. The next world is ready when you are.</p><div className="reward-row"><span className="reward-chip">⚡ +{finished.xpGained} XP</span><span className="reward-chip">🔥 {useGameStore.getState().streak} day streak</span><span className="reward-chip">👑 Unit {unit.order} complete</span></div><div className="complete-actions"><Link href={`/learn/${language.slug}`} className="button button-soft button-large"><ArrowLeft size={16} /> View map</Link>{unit.order < language.units.length && <Link href={`/learn/${language.slug}`} className="button button-primary button-large">Enter next world <ArrowRight size={17} /></Link>}</div></section>;

  const quiz = quizzes[quizIndex];
  const isCodePhase = quizIndex >= quizzes.length;

  function advance() {
    if (!isCodePhase && selected === quiz.answer) {
      setQuizIndex((index) => index + 1);
      setSelected(null);
      return;
    }
    if (isCodePhase && codePassed && finalCode?.type === "code") {
      setFinished(completeBoss(bossId, 60));
      if (settings.soundEnabled) playQuestChime();
    }
  }

  function choose(index: number) {
    if (selected === quiz?.answer) return;
    setSelected(index);
    if (index !== quiz?.answer) { setQuizMistakes((count) => count + 1); recordMistake(); if (settings.ttsEnabled) speakText("Not quite. Try another answer.", settings.ttsRate); }
  }

  return (
    <section className="boss-page">
      <div className="boss-topline"><Link href={`/learn/${language.slug}`} className="back-link"><ArrowLeft size={16} /> Leave boss</Link><span className="boss-heart-count"><Heart size={15} fill="currentColor" /> {hearts}</span></div>
      <div className="boss-banner"><div className="boss-crown"><Crown size={27} /></div><div className="eyebrow"><Sparkles size={13} /> FINAL TRIAL · WORLD {unit.order}</div><h1>{unit.title} <span>Boss</span></h1><p>Three quick checks and one final code challenge. Clear them all to earn triple XP.</p><div className="boss-reward-large"><span>⚡</span><strong>+60 XP</strong><small>Legendary reward</small></div></div>
      <div className="boss-progress-dots" aria-label={`Challenge ${Math.min(quizIndex + 1, 4)} of 4`}>{[0, 1, 2, 3].map((index) => <span className={index < quizIndex ? "boss-dot-done" : index === quizIndex ? "boss-dot-current" : ""} key={index}>{index < quizIndex ? <Check size={13} /> : index + 1}</span>)}</div>
      <div className="boss-task-card">
        {!isCodePhase && quiz && <><div className="eyebrow">BOSS CHECK {quizIndex + 1} OF {quizzes.length}</div><h2>{quiz.question}</h2><div className="answer-list">{quiz.options.map((option, index) => <button type="button" className={`answer-option ${selected === index ? index === quiz.answer ? "answer-correct" : "answer-wrong" : ""}`} onClick={() => choose(index)} key={option} disabled={selected === quiz.answer}><span className="answer-letter">{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>{selected !== null && selected === quiz.answer && <div className="quiz-feedback quiz-feedback-correct"><strong>Correct — keep going!</strong><p>{quiz.explanation}</p></div>}</>}
        {isCodePhase && finalCode?.type === "code" && <><div className="eyebrow">FINAL CODE CHECK</div><h2>Bring the whole world together.</h2><p className="boss-code-copy">Complete one last challenge to claim your reward.</p><CodeChallenge step={finalCode} lessonId={bossId} voiceEnabled={settings.ttsEnabled} voiceRate={settings.ttsRate} language={language.slug === "python" ? "python" : "javascript"} onPass={(count) => setCodePassed(count !== null)} /></>}
      </div>
      <div className="boss-actions"><span>{quizMistakes ? `${quizMistakes} wrong attempt${quizMistakes === 1 ? "" : "s"} — you can still finish.` : "No timer. Take your time."}</span><button type="button" className="button button-primary button-large" disabled={isCodePhase ? !codePassed : selected !== quiz?.answer} onClick={advance}>{isCodePhase ? "Claim boss reward" : quizIndex === quizzes.length - 1 ? "Final code challenge" : "Next check"} <ArrowRight size={17} /></button></div>
    </section>
  );
}
