import memoizeOne from 'memoize-one';
import { Cursor, CluesData } from './shared/types';
import { Square } from './types';

export const getLayout = memoizeOne(
  ({ width, height, across, down }: CluesData): (number | boolean)[][] => {
    const layout: (number | boolean)[][] = [];
    for (let i = 0; i < height; i++) {
      layout[i] = [];
      for (let j = 0; j < width; j++) {
        layout[i][j] = false;
      }
    }
    for (const number of across.order) {
      const { size, row, col } = across.byNumber[number];
      layout[row][col] = number;
      for (let offset = 0; offset < size; offset++) {
        layout[row][col + offset] = layout[row][col + offset] || true;
      }
    }
    for (const number of down.order) {
      const { size, row, col } = down.byNumber[number];
      layout[row][col] = number;
      for (let offset = 0; offset < size; offset++) {
        layout[row + offset][col] = layout[row + offset][col] || true;
      }
    }
    return layout;
  },
);

export function getCursorSquare(clues: CluesData, cursor: Cursor): Square {
  if (!cursor) return [-1, -1];
  const { clueNumber, char, direction } = cursor;
  const clue = clues[direction].byNumber[clueNumber];
  if (!clue) return [-1, -1];
  const { row, col } = clue;
  return direction === 'across' ? [row, col + char] : [row + char, col];
}
