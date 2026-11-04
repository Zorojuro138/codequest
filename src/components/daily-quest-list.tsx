"use client";

import { Check, Flame, Sparkles, Target } from "lucide-react";
import { dailyQuests, weeklyQuests, type QuestDefinition } from "@/lib/gamification/quests";
import { getLocalDayKey, getLocalWeekKey, useGameStore } from "@/store/use-game-store";

function QuestRow({ quest, progress, claimed, onClaim }: { quest: QuestDefinition; progress: number; claimed: boolean; onClaim: () => void }) {
  const value = Math.min(quest.target, progress);
  const complete = value >= quest.target;
  return <article className={`daily-quest-row ${complete ? "daily-quest-done" : ""}`}>
    <div className="daily-quest-icon">{complete ? <Check size={16} /> : <Target size={16} />}</div>
    <div className="daily-quest-copy"><strong>{quest.title}</strong><small>{quest.detail}</small><div className="daily-quest-progress"><i style={{ width: `${Math.round((value / quest.target) * 100)}%` }} /></div><span className="quest-progress-count">{value}/{quest.target}</span></div>
    <div className="daily-quest-reward">⚡ {quest.xpReward}</div>
    {complete && !claimed && <button className="quest-claim" onClick={onClaim} type="button">Claim</button>}
    {claimed && <span className="quest-claimed">CLAIMED</span>}
  </article>;
}

export function DailyQuestList() {
  const stats = useGameStore((state) => state.dailyStats);
  const streak = useGameStore((state) => state.streak);
  const hydrated = useGameStore((state) => state.hydrated);
  const claimQuest = useGameStore((state) => state.claimQuest);
  const claimWeeklyQuest = useGameStore((state) => state.claimWeeklyQuest);
  const claimedWeekly = useGameStore((state) => state.claimedWeeklyQuestKeys);
  const currentDay = getLocalDayKey();
  const currentWeek = getLocalWeekKey();
  const todayStats = hydrated && stats.day === currentDay ? stats : { ...stats, lessonsCompleted: 0, xpEarned: 0, challengeLessonIds: [], claimedQuestKeys: [] };
  const weeklyQuest = weeklyQuests[0];
  const weeklyProgress = weeklyQuest.getProgress(todayStats, hydrated ? streak : 0);
  const weeklyComplete = weeklyProgress >= weeklyQuest.target;
  const weeklyClaimed = hydrated && claimedWeekly.includes(currentWeek);
  return <section className="quest-board">
    <div className="quest-board-heading"><div><div className="eyebrow"><Sparkles size={13} /> TODAY’S QUESTS</div><h2>Small wins, big magic.</h2></div><span className="quest-reset">Resets every day</span></div>
    <div className="daily-quest-list">{dailyQuests.map((quest) => <QuestRow key={quest.key} quest={quest} progress={quest.getProgress(todayStats, streak)} claimed={todayStats.claimedQuestKeys.includes(quest.key)} onClaim={() => claimQuest(quest.key, quest.xpReward)} />)}</div>
    <div className="weekly-quest-banner"><span><Flame size={17} fill="currentColor" /></span><div><strong>{weeklyQuest.title}</strong><small>{weeklyQuest.detail} · {weeklyQuest.xpReward} bonus XP</small></div><span className="weekly-progress">{Math.min(weeklyQuest.target, weeklyProgress)}/{weeklyQuest.target} days</span>{weeklyComplete && !weeklyClaimed && <button type="button" className="quest-claim weekly-claim" onClick={() => claimWeeklyQuest(currentWeek, weeklyQuest.xpReward)}>Claim</button>}{weeklyClaimed && <span className="quest-claimed">CLAIMED</span>}</div>
  </section>;
}
