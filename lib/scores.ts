export interface TopScoreEntry {
  id: number;
  player: string;
  score: number;
  lines: number;
  level: number;
}

const STORAGE_KEY = "tetris-top-scores";

function readScores(): TopScoreEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TopScoreEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeScores(scores: TopScoreEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

export function getTopScores(limit = 5): TopScoreEntry[] {
  return readScores()
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function saveHighScore(data: {
  player: string;
  score: number;
  lines: number;
  level: number;
}): TopScoreEntry[] {
  const player = data.player.trim().slice(0, 20) || "Player";
  const entry: TopScoreEntry = {
    id: Date.now(),
    player,
    score: data.score,
    lines: data.lines,
    level: data.level,
  };

  const next = [...readScores(), entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  writeScores(next);
  return next;
}
