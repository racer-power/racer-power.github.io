import { BOARD_EMPTY_COLOR, COLS, ROWS, TOTAL_ROWS } from "@/lib/tetris/constants";
import { buildDisplayBoard } from "@/lib/tetris/board";
import { PIECE_COLORS, SHAPES } from "@/lib/tetris/pieces";
import type { GameState, PieceType } from "@/lib/tetris/types";
import type { CSSProperties } from "react";

const CELL_SIZE = 24;
const MINI_CELL_SIZE = 16;

function getCellStyle(cell: string | null): CSSProperties {
  if (!cell) {
    return {
      backgroundColor: BOARD_EMPTY_COLOR,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
    };
  }

  const isGhost = cell.length === 9;
  const color = isGhost ? cell.slice(0, 7) : cell;

  if (isGhost) {
    return {
      backgroundColor: BOARD_EMPTY_COLOR,
      boxShadow: `inset 0 0 0 2px ${color}`,
      opacity: 0.85,
    };
  }

  return {
    backgroundColor: color,
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.25)",
    outline: "1px solid rgba(255,255,255,0.15)",
  };
}

interface GameBoardProps {
  state: GameState;
}

export function GameBoard({ state }: GameBoardProps) {
  const fullDisplay = buildDisplayBoard(state.board, state.active);
  const visible = fullDisplay.slice(TOTAL_ROWS - ROWS);

  return (
    <div
      className="inline-grid border-2 border-[#3d4f97] bg-[#21242e] p-1 shadow-[inset_0_0_0_1px_#5a5f8c]"
      style={{
        gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
      }}
    >
      {visible.flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="border border-[#5a5f8c]/40"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              ...getCellStyle(cell),
            }}
          />
        )),
      )}
    </div>
  );
}

export function MiniBoard({ type, label }: { type: PieceType; label: string }) {
  const cells = SHAPES[type][0];
  const minRow = Math.min(...cells.map(([r]) => r));
  const maxRow = Math.max(...cells.map(([r]) => r));
  const minCol = Math.min(...cells.map(([, c]) => c));
  const maxCol = Math.max(...cells.map(([, c]) => c));
  const rows = maxRow - minRow + 1;
  const cols = maxCol - minCol + 1;
  const color = PIECE_COLORS[type];

  const filled = new Set(
    cells.map(([r, c]) => `${r - minRow}-${c - minCol}`),
  );

  return (
    <div className="border border-[#60619c] bg-[#21242e] p-2">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#9fbee7]">
        {label}
      </p>
      <div
        className="inline-grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${MINI_CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${rows}, ${MINI_CELL_SIZE}px)`,
        }}
      >
        {Array.from({ length: rows * cols }, (_, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          const active = filled.has(`${row}-${col}`);

          return (
            <div
              key={index}
              style={{
                width: MINI_CELL_SIZE,
                height: MINI_CELL_SIZE,
                backgroundColor: active ? color : BOARD_EMPTY_COLOR,
                boxShadow: active
                  ? "inset 0 1px 0 rgba(255,255,255,0.35)"
                  : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
