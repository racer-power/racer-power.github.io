import { COLS, TOTAL_ROWS } from "./constants";
import { PIECE_COLORS, SHAPES } from "./pieces";
import type { ActivePiece, Board, Cell } from "./types";

export function createEmptyBoard(): Board {
  return Array.from({ length: TOTAL_ROWS }, () =>
    Array.from<Cell>({ length: COLS }).fill(null),
  );
}

export function getPieceCells(piece: ActivePiece): [number, number][] {
  const shape = SHAPES[piece.type][piece.rotation % 4];
  return shape.map(([row, col]) => [piece.y + row, piece.x + col]);
}

export function isValidPosition(
  board: Board,
  piece: ActivePiece,
  offsetX = 0,
  offsetY = 0,
  rotation = piece.rotation,
): boolean {
  const testPiece = { ...piece, rotation, x: piece.x + offsetX, y: piece.y + offsetY };
  const cells = getPieceCells(testPiece);

  return cells.every(([row, col]) => {
    if (col < 0 || col >= COLS || row >= TOTAL_ROWS) return false;
    if (row < 0) return true;
    return board[row][col] === null;
  });
}

export function mergePiece(board: Board, piece: ActivePiece): Board {
  const next = board.map((row) => [...row]);
  const color = PIECE_COLORS[piece.type];

  for (const [row, col] of getPieceCells(piece)) {
    if (row >= 0 && row < TOTAL_ROWS && col >= 0 && col < COLS) {
      next[row][col] = color;
    }
  }

  return next;
}

export function getGhostPiece(board: Board, piece: ActivePiece): ActivePiece {
  let ghost = { ...piece };

  while (isValidPosition(board, ghost, 0, 1)) {
    ghost = { ...ghost, y: ghost.y + 1 };
  }

  return ghost;
}

export function buildDisplayBoard(
  board: Board,
  active: ActivePiece | null,
  showGhost = true,
): Board {
  if (!active) return board;

  const display = board.map((row) => [...row]);
  const ghost = showGhost ? getGhostPiece(board, active) : null;

  if (ghost) {
    for (const [row, col] of getPieceCells(ghost)) {
      if (row >= 0 && row < TOTAL_ROWS && col >= 0 && col < COLS && display[row][col] === null) {
        display[row][col] = `${PIECE_COLORS[active.type]}33`;
      }
    }
  }

  for (const [row, col] of getPieceCells(active)) {
    if (row >= 0 && row < TOTAL_ROWS && col >= 0 && col < COLS) {
      display[row][col] = PIECE_COLORS[active.type];
    }
  }

  return display;
}
