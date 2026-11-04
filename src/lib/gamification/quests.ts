import type { DailyStats } from "@/store/use-game-store";

export type QuestDefinition = { key: string; title: string; detail: string; target: number; xpReward: number; getProgress: (stats: DailyStats, streak: number) => number };

export const dailyQuests: QuestDefinition[] = [
  { key: "daily-two-lessons", title: "A little learning goes far", detail: "Complete 2 lessons", target: 2, xpReward: 25, getProgress: (stats) => stats.lessonsCompleted },
  { key: "daily-fifty-xp", title: "XP collector", detail: "Earn 50 XP", target: 50, xpReward: 20, getProgress: (stats) => stats.xpEarned },
  { key: "daily-code-two", title: "Code explorer", detail: "Pass 2 code challenges", target: 2, xpReward: 25, getProgress: (stats) => stats.challengeLessonIds.length },
];

export const weeklyQuests: QuestDefinition[] = [
  { key: "weekly-five-streak", title: "Show up for yourself", detail: "Reach a 5 day streak", target: 5, xpReward: 100, getProgress: (_stats, streak) => streak },
];
