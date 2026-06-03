export function skipsAllowed(attended: number, total: number, target = 0.75) {
  // max x such that attended / (total + x) >= target
  return Math.max(0, Math.floor(attended / target - total));
}

export function classesNeeded(attended: number, total: number, target = 0.8) {
  // min y such that (attended + y) / (total + y) >= target
  if (total === 0) return 0;
  const cur = attended / total;
  if (cur >= target) return 0;
  return Math.ceil((target * total - attended) / (1 - target));
}

export function status(pct: number): 'safe' | 'warn' | 'risk' {
  if (pct >= 80) return 'safe';
  if (pct >= 75) return 'warn';
  return 'risk';
}
