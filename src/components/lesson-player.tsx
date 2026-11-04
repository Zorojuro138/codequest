"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, Heart, PartyPopper, Volume2, X } from "lucide-react";
import type { LanguageSummary, LessonSummary, QuizStep } from "@/lib/content/catalog";
import { speakText, stopSpeech } from "@/lib/voice/web-speech-tts";
import { getLevelFromXp } from "@/lib/gamification/levels";
import { useGameStore } from "@/store/use-game-store";
import { CodeChallenge } from "@/components/code-challenge";
import { playQuestChime } from "@/lib/audio/sounds";

function QuizStepView({ step, selected, onSelect, onWrong }: { step: QuizStep; selected: number | null; onSelect: (value: number) => void; onWrong: () => void }) {
  function choose(index: number) {
    if (selected === step.answer) return;
    onSelect(index);
    if (index !== step.answer) onWrong();
  }

  return (
    <div className="quiz-step">
      <div className="step-icon step-icon-quiz">✦</div>
      <div className="eyebrow">QUICK CHECK</div>
      <h2>{step.question}</h2>
      <div className="answer-list">
        {step.options.map((option, index) => <button key={option} type="button" className={`answer-option ${selected === index ? (index === step.answer ? "answer-correct" : "answer-wrong") : ""}`} onClick={() => choose(index)} disabled={selected === step.answer}>
          <span className="answer-letter">{String.fromCharCode(65 + index)}</span>{option}
          {selected === index && index === step.answer && <Check size={17} className="answer-check" />}
        </button>)}
      </div>
      {selected !== null && <div className={`quiz-feedback ${selected === step.answer ? "quiz-feedback-correct" : "quiz-feedback-wrong"}`} role="status">
        <strong>{selected === step.answer ? "You got it!" : "Not quite — give it another try."}</strong>
        {selected === step.answer && <p>{step.explanation}</p>}
      </div>}
    </div>
  );
}

export function LessonPlayer({ language, lesson }: { language: LanguageSummary; lesson: LessonSummary }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizMistakes, setQuizMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [codePassed, setCodePassed] = useState(false);
  const [completion, setCompletion] = useState<{ xpGained: number; leveledUp: boolean; level: number; newBadges: string[] } | null>(null);
  const hearts = useGameStore((state) => state.hearts);
  const recordMistake = useGameStore((state) => state.recordMistake);
  const finishLesson = useGameStore((state) => state.completeLesson);
  const settings = useGameStore((state) => state.settings);
  const currentStep = lesson.steps[stepIndex];
  const progressPercent = Math.round(((stepIndex + 1) / lesson.steps.length) * 100);
  const languageKey = language.slug === "python" ? "python" : "javascript";
  const stepNarration = useMemo(() => {
    if (currentStep.type === "read") return currentStep.narration;
    if (currentStep.type === "quiz") return currentStep.question;
    return currentStep.spokenSummary;
  }, [currentStep]);

  useEffect(() => {
    if (settings.autoNarrate && settings.ttsEnabled) speakText(stepNarration, settings.ttsRate);
    return () => stopSpeech();
  }, [settings.autoNarrate, settings.ttsEnabled, settings.ttsRate, stepNarration]);

  function continueLesson() {
    if (currentStep.type === "code") {
      if (!codePassed) return;
      const score = quizMistakes === 0 && hintsUsed === 0 ? 100 : quizMistakes === 0 ? 90 : 80;
      setCompletion(finishLesson({ lessonId: lesson.slug, baseXp: lesson.xpReward, score, hintsUsed, challengePassed: true }));
      if (settings.soundEnabled) playQuestChime();
      stopSpeech();
      return;
    }
    setStepIndex((index) => Math.min(lesson.steps.length - 1, index + 1));
    setSelectedAnswer(null);
    setCodePassed(false);
  }

  if (completion) {
    const levelInfo = getLevelFromXp(useGameStore.getState().totalXp);
    return (
      <section className="lesson-complete" aria-live="polite">
        <div className="complete-confetti" aria-hidden="true">✦　✧　✦</div>
        <div className="complete-mascot">🎉</div>
        <div className="eyebrow"><PartyPopper size={15} /> QUEST COMPLETE</div>
        <h1>{completion.leveledUp ? "Level up!" : "You did it!"}</h1>
        <p>You finished <strong>{lesson.title}</strong>. That’s one more real coding skill in your toolkit.</p>
        <div className="reward-row"><span className="reward-chip">⚡ +{completion.xpGained} XP</span><span className="reward-chip">🔥 {useGameStore.getState().streak} day streak</span><span className="reward-chip">⭐ Level {levelInfo.level}</span></div>
        {completion.newBadges.length > 0 && <div className="new-badge">🏅 New badge unlocked: {completion.newBadges[0].replaceAll("_", " ")}</div>}
        <div className="complete-actions"><Link href={`/learn/${language.slug}`} className="button button-soft button-large"><ArrowLeft size={16} /> Back to map</Link><Link href="/dashboard" className="button button-primary button-large">See my progress <ArrowRight size={17} /></Link></div>
        {completion.leveledUp && <span className="level-up-note">You reached level {completion.level}!</span>}
      </section>
    );
  }

  return (
    <section className="lesson-layout">
      <div className="lesson-topline">
        <Link className="lesson-close" href={`/learn/${language.slug}`} aria-label="Close lesson"><X size={19} /></Link>
        <div className="lesson-progress-track" aria-label={`Lesson ${progressPercent}% complete`}><span style={{ width: `${progressPercent}%` }} /></div>
        <div className="lesson-hearts" aria-label={`${hearts} hearts`}><Heart size={17} fill="currentColor" /> {hearts}</div>
      </div>
      <div className="lesson-main-card">
        <div className="lesson-meta"><span>{language.icon} {language.name}</span><span>QUEST {lesson.order}</span></div>
        <h1 className="lesson-title">{lesson.title}</h1>
        <div className="lesson-step-count">STEP {stepIndex + 1} OF {lesson.steps.length}</div>
        {currentStep.type === "read" && <div className="read-step">
          <div className="read-icon"><BookOpen size={20} /></div>
          <div className="eyebrow">THE QUICK GUIDE</div>
          <h2>{currentStep.heading}</h2>
          <p>{currentStep.markdown}</p>
          <div className="example-block"><span>EXAMPLE</span><pre>{currentStep.example}</pre></div>
          <a className="lesson-source" href={language.sourceUrl} target="_blank" rel="noreferrer">Source: {language.sourceName} ↗</a>
        </div>}
        {currentStep.type === "quiz" && <QuizStepView step={currentStep} selected={selectedAnswer} onSelect={setSelectedAnswer} onWrong={() => { setQuizMistakes((count) => count + 1); recordMistake(); }} />}
        {currentStep.type === "code" && <div className="code-step"><div className="eyebrow">CODE LAB</div><p className="code-step-copy">Write your solution, run it, and see what happens. Your code stays in this browser.</p><CodeChallenge step={currentStep} language={languageKey} lessonId={lesson.slug} voiceEnabled={settings.ttsEnabled} voiceRate={settings.ttsRate} onPass={(count) => { if (count === null) setCodePassed(false); else { setCodePassed(true); setHintsUsed(count); } }} /></div>}
      </div>
      <div className="lesson-footer">
        <button className="voice-button" type="button" onClick={() => settings.ttsEnabled ? speakText(stepNarration, settings.ttsRate) : undefined} disabled={!settings.ttsEnabled}><Volume2 size={17} /> Read aloud</button>
        <button className="button button-primary button-large lesson-continue" type="button" disabled={(currentStep.type === "quiz" && selectedAnswer !== currentStep.answer) || (currentStep.type === "code" && !codePassed)} onClick={continueLesson}>
          {currentStep.type === "code" ? "Finish quest" : "Continue"} <ArrowRight size={17} />
        </button>
      </div>
      {hearts === 0 && <p className="heart-note"><Heart size={13} /> Out of hearts? Keep learning anyway — finishing a lesson restores one.</p>}
      <div className="lesson-mascot" aria-hidden="true">🦊</div>
    </section>
  );
}
