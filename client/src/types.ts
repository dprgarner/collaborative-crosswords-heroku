import { Active, CluesData } from './shared/types';

export type Square = [number, number];

export type UIAction =
  | { type: 'BLUR' }
  | { type: 'KEY_PRESS'; keyCode: number; key: string }
  | { type: 'CLICK_CELL'; i: number; j: number };

export type State = {
  readonly active: Active;
  readonly letters: string[][];
  readonly clues: CluesData | null;
};
