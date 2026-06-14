import {
  BASE_DROP_MS,
  LEVEL_LINES,
  LINE_SCORES,
  MIN_DROP_MS,
  TOTAL_ROWS,
} from "./constants";
import {
  createEmptyBoard,
  getGhostPiece,
  isValidPosition,
  mergePiece,
} from "./board";
import { ALL_PIECES, SPAWN_X } from "./pieces";
import type {
  ActivePiece,
  GameAction,
  GameState,
  PieceType,
} from "./types";

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function refillBag(bag: PieceType[]): PieceType[] {
  return bag.length === 0 ? shuffle(ALL_PIECES) : bag;
}

function takeNextPiece(bag: PieceType[]): { next: PieceType; bag: PieceType[] } {
  const filled = refillBag(bag);
  const [next, ...rest] = filled;
  return { next, bag: rest };
}

function spawnPiece(type: PieceType): ActivePiece {
  return {
    type,
    rotation: 0,
    x: SPAWN_X[type],
    y: 0,
  };
}

function clearCompletedLines(board: GameState["board"]): {
  board: GameState["board"];
  cleared: number;
} {
  const remaining = board.filter((row) => row.some((cell) => cell === null));
  const cleared = board.length - remaining.length;

  if (cleared === 0) {
    return { board, cleared: 0 };
  }

  const emptyRows = Array.from({ length: cleared }, () =>
    Array.from<string | null>({ length: board[0].length }).fill(null),
  );

  return {
    board: [...emptyRows, ...remaining],
    cleared,
  };
}

function lockActivePiece(state: GameState): GameState {
  if (!state.active) return state;

  const merged = mergePiece(state.board, state.active);
  const { board, cleared } = clearCompletedLines(merged);
  const lines = state.lines + cleared;
  const level = Math.floor(lines / LEVEL_LINES) + 1;
  const score = state.score + LINE_SCORES[cleared] * level;

  const { next, bag } = takeNextPiece(state.bag);
  const active = spawnPiece(next);
  const { next: upcoming, bag: nextBag } = takeNextPiece(bag);

  if (!isValidPosition(board, active)) {
    return {
      ...state,
      board,
      active: null,
      next: upcoming,
      bag: nextBag,
      score,
      lines,
      level,
      status: "gameover",
    };
  }

  return {
    ...state,
    board,
    active,
    next: upcoming,
    bag: nextBag,
    score,
    lines,
    level,
    status: "playing",
  };
}

function tryMove(state: GameState, dx: number, dy: number): GameState {
  if (!state.active || state.status !== "playing") return state;

  if (isValidPosition(state.board, state.active, dx, dy)) {
    return {
      ...state,
      active: { ...state.active, x: state.active.x + dx, y: state.active.y + dy },
    };
  }

  if (dy > 0) {
    return lockActivePiece(state);
  }

  return state;
}

function tryRotate(state: GameState, direction: 1 | -1): GameState {
  if (!state.active || state.status !== "playing") return state;

  const rotation = (state.active.rotation + direction + 4) % 4;
  const kicks = [0, -1, 1, -2, 2];

  for (const kick of kicks) {
    if (isValidPosition(state.board, state.active, kick, 0, rotation)) {
      return {
        ...state,
        active: {
          ...state.active,
          rotation,
          x: state.active.x + kick,
        },
      };
    }
  }

  return state;
}

function hardDrop(state: GameState): GameState {
  if (!state.active || state.status !== "playing") return state;

  const ghost = getGhostPiece(state.board, state.active);
  const distance = ghost.y - state.active.y;
  const dropped = {
    ...state,
    active: ghost,
    score: state.score + distance * 2,
  };

  return lockActivePiece(dropped);
}

export function createInitialState(): GameState {
  return {
    board: createEmptyBoard(),
    active: null,
    next: "T",
    bag: [],
    score: 0,
    lines: 0,
    level: 1,
    status: "idle",
  };
}

export function startGame(state: GameState): GameState {
  const bag = shuffle(ALL_PIECES);
  const { next, bag: rest } = takeNextPiece(bag);
  const active = spawnPiece(next);
  const { next: upcoming, bag: nextBag } = takeNextPiece(rest);

  return {
    board: createEmptyBoard(),
    active,
    next: upcoming,
    bag: nextBag,
    score: 0,
    lines: 0,
    level: 1,
    status: "playing",
  };
}

export function getDropIntervalMs(level: number): number {
  return Math.max(MIN_DROP_MS, BASE_DROP_MS - (level - 1) * 80);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "start":
      return startGame(state);

    case "pause":
      return state.status === "playing" ? { ...state, status: "paused" } : state;

    case "resume":
      return state.status === "paused" ? { ...state, status: "playing" } : state;

    case "move":
      return tryMove(state, action.dx, action.dy);

    case "rotate":
      return tryRotate(state, action.direction);

    case "softDrop":
      return tryMove(state, 0, 1);

    case "hardDrop":
      return hardDrop(state);

    case "tick":
      return state.status === "playing" ? tryMove(state, 0, 1) : state;

    default:
      return state;
  }
}

export function getVisibleBoard(state: GameState) {
  return state.board.slice(TOTAL_ROWS - 20);
}
