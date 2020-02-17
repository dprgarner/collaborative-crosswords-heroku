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

type CursorStyle = null | 'myClue' | 'mySquare' | 'otherClue' | 'otherSquare';

export function getCursorSquares(
  clues: CluesData,
  cursors: { [uuid: string]: Cursor },
  playerId: string,
): CursorStyle[][] {
  const squares: CursorStyle[][] = _.range(clues.height).map(() =>
    _.range(clues.width).map(() => null),
  );

  _.each(cursors, (cursor, uuid) => {
    const myCursor = uuid === playerId;

    function setSquare(i: number, j: number, type: 'clue' | 'square') {
      if (squares[i][j] === 'mySquare' && !myCursor) return;
      if (squares[i][j] === 'myClue' && !myCursor) return;

      if (type === 'clue') {
        squares[i][j] = myCursor ? 'myClue' : 'otherClue';
      } else if (type === 'square') {
        squares[i][j] = myCursor ? 'mySquare' : 'otherSquare';
      }
    }

    if (!cursor) return;
    const { clueNumber, char, direction } = cursor;
    const clue = clues[direction].byNumber[clueNumber];
    if (!clue) return;
    const { row, col, size } = clue;
    if (direction === 'across') {
      for (let j = col; j < col + size; j++) {
        setSquare(row, j, 'clue');
      }
      setSquare(row, col + char, 'square');
    } else {
      for (let i = row; i < row + size; i++) {
        setSquare(i, col, 'clue');
      }
      setSquare(row + char, col, 'square');
    }
  });
  return squares;
}
