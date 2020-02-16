import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { Cursor, CluesData } from './shared/types';

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

type CursorStyle = null | 'cursorClue' | 'cursorSquare';

export function getCursorSquares(
  clues: CluesData,
  cursor: Cursor,
): CursorStyle[][] {
  const squares: CursorStyle[][] = _.range(clues.height).map(() =>
    _.range(clues.width).map(() => null),
  );
  if (!cursor) return squares;
  const { clueNumber, char, direction } = cursor;
  const clue = clues[direction].byNumber[clueNumber];
  if (!clue) return squares;
  const { row, col, size } = clue;
  if (direction === 'across') {
    for (let j = col; j < col + size; j++) {
      squares[row][j] = 'cursorClue';
    }
    squares[row][col + char] = 'cursorSquare';
  } else {
    for (let i = row; i < row + size; i++) {
      squares[i][col] = 'cursorClue';
    }
    squares[row + char][col] = 'cursorSquare';
  }
  return squares;
}
