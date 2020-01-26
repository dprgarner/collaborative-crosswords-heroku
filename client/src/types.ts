export type Direction = 'across' | 'down';
export type Square = [number, number];

export type ClueSetData = {
  order: number[];
  byNumber: {
    [number: string]: ClueData;
  };
};

type ClueData = {
  clue: string;
  size: number;
  row: number;
  col: number;
};

export type CluesData = {
  width: number;
  height: number;
  across: ClueSetData;
  down: ClueSetData;
};

export type Active = {
  clueNumber: number;
  char: number;
  direction: Direction;
} | null;

export type UIAction =
  | { type: 'BLUR' }
  | { type: 'KEY_PRESS'; keyCode: number; key: string }
  | { type: 'CLICK_CELL'; i: number; j: number };

export type State = {
  readonly active: Active;
  readonly letters: string[][];
  readonly clues: CluesData;
};
