"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getLevelFromXp } from "@/lib/gamification/levels";

export type LessonRecord = {
  completedAt: string;
  score: number;
  hintsUsed: number;
  replayCount: number;
};

export type GameSettings = {
  theme: "light" | "dark" | "system";
  ttsEnabled: boolean;
  autoNarrate: boolean;
  ttsRate: number;
  soundEnabled: boolean;
  reducedMotion: boolean;
  dailyGoal: number;
};

export type DailyStats = { day: string; lessonsCompleted: number; xpEarned: number; challengeLessonIds: string[]; claimedQuestKeys: string[] };
export type LocalXpEvent = { id: string; amount: number; reason: string; createdAt: string };

type Completion = { xpGained: number; leveledUp: boolean; level: number; newBadges: string[] };

type GameState = {
  totalXp: number;
  xpEvents: LocalXpEvent[];
  streak: number;
  longestStreak: number;
  lastActiveDay: string | null;
  hearts: number;
  lessonRecords: Record<string, LessonRecord>;
  earnedBadges: string[];
  completedBosses: string[];
  claimedWeeklyQuestKeys: string[];
  dailyStats: DailyStats;
  settings: GameSettings;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  completeLesson: (input: { lessonId: string; baseXp: number; score: number; hintsUsed: number; challengePassed: boolean }) => Completion;
  recordMistake: () => void;
  practiceHeart: () => void;
  recordChallengePass: (lessonId: string) => void;
  completeBoss: (bossId: string, xpReward: number) => Completion;
  claimQuest: (questKey: string, xpReward: number) => void;
  claimWeeklyQuest: (weekKey: string, xpReward: number) => void;
  setSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  resetProgress: () => void;
};

const initialSettings: GameSettings = {
  theme: "system",
  ttsEnabled: true,
  autoNarrate: false,
  ttsRate: 1,
  soundEnabled: true,
  reducedMotion: false,
  dailyGoal: 2,
};

function localDayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function previousDay(day: string) {
  const date = new Date(`${day}T12:00:00`);
  date.setDate(date.getDate() - 1);
  return localDayKey(date);
}

export const useGameStore = create<GameState>()(persist((set, get) => ({
  totalXp: 0,
  xpEvents: [],
  streak: 0,
  longestStreak: 0,
  lastActiveDay: null,
  hearts: 5,
  lessonRecords: {},
  earnedBadges: [],
  completedBosses: [],
  claimedWeeklyQuestKeys: [],
  dailyStats: { day: localDayKey(), lessonsCompleted: 0, xpEarned: 0, challengeLessonIds: [], claimedQuestKeys: [] },
  settings: initialSettings,
  hydrated: false,
  setHydrated: (hydrated) => set({ hydrated }),
  completeLesson: ({ lessonId, baseXp, score, hintsUsed, challengePassed }) => {
    const before = get();
    const oldLevel = getLevelFromXp(before.totalXp).level;
    const existing = before.lessonRecords[lessonId];
    const firstTime = !existing;
    let xpGained = baseXp + (challengePassed ? 10 : 0) + (challengePassed && hintsUsed === 0 ? 5 : 0) + (score === 100 && hintsUsed === 0 ? 10 : 0);
    if (!firstTime) xpGained = Math.floor(xpGained * 0.25);
    const today = localDayKey();
    const streak = before.lastActiveDay === today ? before.streak : before.lastActiveDay === previousDay(today) ? before.streak + 1 : 1;
    const badgeCandidates: string[] = [];
    if (firstTime && Object.keys(before.lessonRecords).length === 0) badgeCandidates.push("first_lesson");
    if (firstTime && Object.keys(before.lessonRecords).length === 4) badgeCandidates.push("five_lessons");
    if (streak >= 7 && before.streak < 7) badgeCandidates.push("seven_day_streak");
    const newBadges = badgeCandidates.filter((badge) => !before.earnedBadges.includes(badge));
    const daily = before.dailyStats.day === today ? before.dailyStats : { day: today, lessonsCompleted: 0, xpEarned: 0, challengeLessonIds: [], claimedQuestKeys: [] };
    const lessonRecords = {
      ...before.lessonRecords,
      [lessonId]: {
        completedAt: existing?.completedAt ?? new Date().toISOString(),
        score: Math.max(existing?.score ?? 0, score),
        hintsUsed,
        replayCount: (existing?.replayCount ?? 0) + (firstTime ? 0 : 1),
      },
    };
    const totalXp = before.totalXp + xpGained;
    const level = getLevelFromXp(totalXp).level;
    set({
      totalXp,
      xpEvents: [...before.xpEvents, { id: `${Date.now()}-${lessonId}`, amount: xpGained, reason: firstTime ? "lesson_complete" : "lesson_replay", createdAt: new Date().toISOString() }],
      streak,
      longestStreak: Math.max(before.longestStreak, streak),
      lastActiveDay: today,
      hearts: Math.min(5, before.hearts + 1),
      lessonRecords,
      earnedBadges: [...before.earnedBadges, ...newBadges],
      dailyStats: { ...daily, lessonsCompleted: daily.lessonsCompleted + (firstTime ? 1 : 0), xpEarned: daily.xpEarned + xpGained },
    });
    return { xpGained, level, leveledUp: level > oldLevel, newBadges };
  },
  recordMistake: () => set((state) => ({ hearts: Math.max(0, state.hearts - 1) })),
  practiceHeart: () => set((state) => ({ hearts: Math.min(5, state.hearts + 1) })),
  recordChallengePass: (lessonId) => set((state) => {
    const today = localDayKey();
    const daily = state.dailyStats.day === today ? state.dailyStats : { day: today, lessonsCompleted: 0, xpEarned: 0, challengeLessonIds: [], claimedQuestKeys: [] };
    if (daily.challengeLessonIds.includes(lessonId)) return { dailyStats: daily };
    return { dailyStats: { ...daily, challengeLessonIds: [...daily.challengeLessonIds, lessonId] } };
  }),
  completeBoss: (bossId, xpReward) => {
    const before = get();
    const oldLevel = getLevelFromXp(before.totalXp).level;
    const firstTime = !before.completedBosses.includes(bossId);
    const xpGained = firstTime ? xpReward : Math.floor(xpReward * 0.25);
    const today = localDayKey();
    const daily = before.dailyStats.day === today ? before.dailyStats : { day: today, lessonsCompleted: 0, xpEarned: 0, challengeLessonIds: [], claimedQuestKeys: [] };
    const totalXp = before.totalXp + xpGained;
    const level = getLevelFromXp(totalXp).level;
    set({ totalXp, xpEvents: [...before.xpEvents, { id: `${Date.now()}-${bossId}`, amount: xpGained, reason: firstTime ? "boss_complete" : "boss_replay", createdAt: new Date().toISOString() }], completedBosses: firstTime ? [...before.completedBosses, bossId] : before.completedBosses, dailyStats: { ...daily, xpEarned: daily.xpEarned + xpGained } });
    return { xpGained, level, leveledUp: level > oldLevel, newBadges: [] };
  },
  claimQuest: (questKey, xpReward) => set((state) => {
    const today = localDayKey();
    const daily = state.dailyStats.day === today ? state.dailyStats : { day: today, lessonsCompleted: 0, xpEarned: 0, challengeLessonIds: [], claimedQuestKeys: [] };
    if (daily.claimedQuestKeys.includes(questKey)) return { dailyStats: daily };
    return { totalXp: state.totalXp + xpReward, xpEvents: [...state.xpEvents, { id: `${Date.now()}-${questKey}`, amount: xpReward, reason: "quest_reward", createdAt: new Date().toISOString() }], dailyStats: { ...daily, xpEarned: daily.xpEarned + xpReward, claimedQuestKeys: [...daily.claimedQuestKeys, questKey] } };
  }),
  claimWeeklyQuest: (weekKey, xpReward) => set((state) => {
    if (state.claimedWeeklyQuestKeys.includes(weekKey)) return {};
    return { totalXp: state.totalXp + xpReward, xpEvents: [...state.xpEvents, { id: `${Date.now()}-weekly-${weekKey}`, amount: xpReward, reason: "weekly_quest_reward", createdAt: new Date().toISOString() }], claimedWeeklyQuestKeys: [...state.claimedWeeklyQuestKeys, weekKey] };
  }),
  setSetting: (key, value) => set((state) => ({ settings: { ...state.settings, [key]: value } })),
  resetProgress: () => set({ totalXp: 0, xpEvents: [], streak: 0, longestStreak: 0, lastActiveDay: null, hearts: 5, lessonRecords: {}, earnedBadges: [], completedBosses: [], claimedWeeklyQuestKeys: [], dailyStats: { day: localDayKey(), lessonsCompleted: 0, xpEarned: 0, challengeLessonIds: [], claimedQuestKeys: [] } }),
}), {
  name: "codequest-game-state",
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ totalXp: state.totalXp, xpEvents: state.xpEvents, streak: state.streak, longestStreak: state.longestStreak, lastActiveDay: state.lastActiveDay, hearts: state.hearts, lessonRecords: state.lessonRecords, earnedBadges: state.earnedBadges, completedBosses: state.completedBosses, claimedWeeklyQuestKeys: state.claimedWeeklyQuestKeys, dailyStats: state.dailyStats, settings: state.settings }) as GameState,
  onRehydrateStorage: () => (state) => state?.setHydrated(true),
}));

export function getLocalDayKey(date?: Date) {
  return localDayKey(date);
}

export function getLocalWeekKey(date = new Date()) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return localDayKey(monday);
}
