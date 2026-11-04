export function totalXpForLevel(level: number) {
  return Math.round(100 * Math.pow(Math.max(1, level), 1.4));
}

export function getLevelFromXp(xp: number) {
  let level = 1;
  while (xp >= totalXpForLevel(level + 1)) level += 1;
  const currentFloor = level === 1 ? 0 : totalXpForLevel(level);
  const nextFloor = totalXpForLevel(level + 1);
  return { level, currentFloor, nextFloor, progress: Math.min(100, Math.round(((xp - currentFloor) / (nextFloor - currentFloor)) * 100)) };
}
