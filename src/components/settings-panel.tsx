"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Moon, RotateCcw, Settings2, Sun, Volume2, VolumeX } from "lucide-react";
import { useGameStore, type GameSettings } from "@/store/use-game-store";

function Toggle({ label, detail, value, onChange }: { label: string; detail: string; value: boolean; onChange: (value: boolean) => void }) {
  return <div className="setting-row"><div><strong>{label}</strong><small>{detail}</small></div><button type="button" role="switch" aria-checked={value} aria-label={label} className={`setting-switch ${value ? "switch-on" : ""}`} onClick={() => onChange(!value)}><i /></button></div>;
}

export function SettingsPanel() {
  const settings = useGameStore((state) => state.settings);
  const setSetting = useGameStore((state) => state.setSetting);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const hydrated = useGameStore((state) => state.hydrated);
  const [resetMessage, setResetMessage] = useState("");
  const shownSettings = hydrated ? settings : { theme: "system" as const, ttsEnabled: true, autoNarrate: false, ttsRate: 1, soundEnabled: true, reducedMotion: false, dailyGoal: 2 };
  function update<K extends keyof GameSettings>(key: K, value: GameSettings[K]) { setSetting(key, value); }

  function reset() {
    if (window.confirm("Reset all CodeQuest progress saved on this device? This clears XP, lessons, streaks, and badges.")) {
      resetProgress();
      setResetMessage("Your local progress has been reset.");
    }
  }

  return <main className="page-shell app-page settings-page">
    <section className="settings-intro"><div className="eyebrow"><Settings2 size={14} /> MAKE IT YOURS</div><h1>Your quest,<br /><span className="text-gradient">your settings.</span></h1><p>Set up your learning space to feel just right.</p></section>
    <div className="settings-grid">
      <section className="settings-card"><div className="settings-card-heading"><span className="settings-card-icon settings-theme-icon"><Sun size={18} /></span><div><h2>Look & feel</h2><p>Pick a theme and choose how much motion you see.</p></div></div><div className="theme-choices" role="group" aria-label="Color theme">{(["light", "dark", "system"] as const).map((theme) => <button key={theme} type="button" className={shownSettings.theme === theme ? "theme-choice selected" : "theme-choice"} onClick={() => update("theme", theme)}>{theme === "light" ? <Sun size={17} /> : theme === "dark" ? <Moon size={17} /> : <span>◐</span>}<span>{theme[0].toUpperCase() + theme.slice(1)}</span>{shownSettings.theme === theme && <Check size={15} />}</button>)}</div><Toggle label="Reduced motion" detail="Keep transitions calm and subtle." value={shownSettings.reducedMotion} onChange={(value) => update("reducedMotion", value)} /></section>
      <section className="settings-card"><div className="settings-card-heading"><span className="settings-card-icon settings-voice-icon"><Volume2 size={18} /></span><div><h2>Voice guide</h2><p>Listen to lessons and gentle feedback.</p></div></div><Toggle label="Text-to-speech" detail="Read explanations aloud with your browser voice." value={shownSettings.ttsEnabled} onChange={(value) => update("ttsEnabled", value)} /><Toggle label="Auto-narrate lessons" detail="Start reading each lesson step automatically." value={shownSettings.autoNarrate} onChange={(value) => update("autoNarrate", value)} /><div className="setting-row rate-setting"><div><strong>Reading speed</strong><small>{shownSettings.ttsRate.toFixed(1)}× speed</small></div><input type="range" min="0.5" max="2" step="0.1" value={shownSettings.ttsRate} onChange={(event) => update("ttsRate", Number(event.target.value))} aria-label="Speech speed" /></div></section>
      <section className="settings-card"><div className="settings-card-heading"><span className="settings-card-icon settings-goal-icon">🎯</span><div><h2>Your daily goal</h2><p>Pick a goal that fits the way you learn.</p></div></div><div className="goal-choice-row">{[1, 2, 3, 5].map((goal) => <button key={goal} type="button" className={shownSettings.dailyGoal === goal ? "goal-choice selected" : "goal-choice"} onClick={() => update("dailyGoal", goal)}><strong>{goal}</strong><small>{goal === 1 ? "quest" : "quests"}</small></button>)}</div></section>
      <section className="settings-card"><div className="settings-card-heading"><span className="settings-card-icon settings-sound-icon">{shownSettings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}</span><div><h2>Game sounds</h2><p>Keep little celebration sounds on or off.</p></div></div><Toggle label="Sound effects" detail="Play a soft chime when you complete a quest." value={shownSettings.soundEnabled} onChange={(value) => update("soundEnabled", value)} /></section>
      <section className="settings-card account-settings-card"><div className="settings-card-heading"><span className="settings-card-icon settings-account-icon">🧑‍🚀</span><div><h2>Account & sync</h2><p>Your current progress is stored in this browser.</p></div></div><div className="account-status"><span className="status-dot" /> Local profile active</div><p className="account-help">Create an account when Supabase is configured to sync progress across devices.</p><Link href="/signup" className="settings-account-link">Create a free account <ArrowRight size={15} /></Link></section>
      <section className="settings-card reset-card"><div className="settings-card-heading"><span className="settings-card-icon settings-reset-icon"><RotateCcw size={18} /></span><div><h2>Reset progress</h2><p>Clear the XP, quests, streak, and badges saved here.</p></div></div><button className="reset-button" type="button" onClick={reset}>Reset local progress</button>{resetMessage && <p className="reset-message" role="status">{resetMessage}</p>}</section>
    </div>
  </main>;
}
