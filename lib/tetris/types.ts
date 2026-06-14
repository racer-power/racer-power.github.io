export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type GameStatus = "idle" | "playing" | "paused" | "gameover";

export type Cell = string | null;

export type Board = Cell[][];

export interface ActivePiece {
  type: PieceType;
  rotation: number;
  x: number;
  y: number;
}

export interface GameState {
  board: Board;
  active: ActivePiece | null;
  next: PieceType;
  bag: PieceType[];
  score: number;
  lines: number;
  level: number;
  status: GameStatus;
}

export type GameAction =
  | { type: "start" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "move"; dx: number; dy: number }
  | { type: "rotate"; direction: 1 | -1 }
  | { type: "softDrop" }
  | { type: "hardDrop" }
  | { type: "tick" };
