export const COLS = 10;
export const ROWS = 20;
export const HIDDEN_ROWS = 2;
export const TOTAL_ROWS = ROWS + HIDDEN_ROWS;

export const BASE_DROP_MS = 1000;
export const MIN_DROP_MS = 80;

export const LINE_SCORES = [0, 100, 300, 500, 800] as const;

export const LEVEL_LINES = 10;

/** Empty grid cell — must not match any piece color in PIECE_COLORS */
export const BOARD_EMPTY_COLOR = "#1a1f2e";
export const BOARD_CELL_BORDER = "#5a5f8c";
