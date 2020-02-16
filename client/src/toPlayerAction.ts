import { Square, UIAction } from './types';
import { Cursor, CluesData, PlayerAction, State } from './shared/types';
import { getLayout } from './gridSelectors';

function getAcrossCursor(clues: CluesData, i: number, j: number): Cursor {
  for (const clueNumber of clues.across.order) {
    const { row, col, size } = clues.across.byNumber[clueNumber];
    if (i === row && j >= col && j < col + size) {
      return { clueNumber, char: j - col, direction: 'across' };
    }
  }
  return null;
}

function getDownCursor(clues: CluesData, i: number, j: number): Cursor {
  for (const clueNumber of clues.down.order) {
    const { row, col, size } = clues.down.byNumber[clueNumber];
    if (j === col && i >= row && i < row + size) {
      return { clueNumber, char: i - row, direction: 'down' };
    }
  }
  return null;
}

function getNextCursorChar(clues: CluesData, cursor: Cursor & {}): Cursor {
  const { char, clueNumber, direction } = cursor;
  const clue = clues[direction].byNumber[clueNumber];
  const nextCursor: Cursor = {
    char: char + 1,
    clueNumber,
    direction,
  };
  if (nextCursor.char !== clue.size) {
    return nextCursor;
  }
  return getNextCursorClue(clues, cursor);
}

function getNextCursorClue(clues: CluesData, cursor: Cursor & {}): Cursor {
  const { clueNumber, direction } = cursor;
  const clueIndex = clues[direction].order.indexOf(clueNumber) + 1;
  const nextCursor: Cursor = {
    char: 0,
    clueNumber: clues[direction].order[clueIndex],
    direction,
  };
  if (nextCursor.clueNumber) {
    return nextCursor;
  }
  if (direction === 'across') {
    return {
      direction: 'down',
      clueNumber: clues.down.order[0],
      char: 0,
    };
  }
  return null;
}

function getLastCursorChar(clues: CluesData, cursor: Cursor & {}): Cursor {
  const { char, clueNumber, direction } = cursor;
  const lastCursor: Cursor = {
    char: char - 1,
    clueNumber,
    direction,
  };
  if (lastCursor.char !== -1) {
    return lastCursor;
  }
  return getLastCursorClue(clues, cursor);
}

function getLastCursorClue(clues: CluesData, cursor: Cursor & {}): Cursor {
  const { clueNumber, direction } = cursor;
  const clueIndex = clues[direction].order.indexOf(clueNumber) - 1;
  if (clueIndex !== -1) {
    const lastClueNumber = clues[direction].order[clueIndex];
    return {
      direction,
      clueNumber: lastClueNumber,
      char: clues[direction].byNumber[lastClueNumber].size - 1,
    };
  }
  if (direction === 'down') {
    const lastClueNumber = clues.across.order[clues.across.order.length - 1];
    return {
      direction: 'across',
      clueNumber: lastClueNumber,
      char: clues.across.byNumber[lastClueNumber].size - 1,
    };
  }
  return null;
}

function getNextSquare(
  clues: CluesData,
  [i, j]: Square,
  [deltaI, deltaJ]: [0, 1] | [0, -1] | [1, 0] | [-1, 0],
): Square {
  const layout = getLayout(clues);
  let nextI = i + deltaI;
  let nextJ = j + deltaJ;
  while (!layout[nextI] || !layout[nextI][nextJ]) {
    if (
      (nextJ === clues.width && nextI === clues.height - 1) ||
      (nextJ === clues.width - 1 && nextI === clues.height)
    ) {
      nextJ = 0;
      nextI = 0;
    } else if (nextJ >= clues.width) {
      nextJ = 0;
      nextI += 1;
    } else if (nextJ < 0) {
      nextJ = clues.width - 1;
      nextI -= 1;
    } else if (nextI >= clues.height) {
      nextI = 0;
      nextJ += 1;
    } else if (nextI < 0) {
      nextI = clues.height - 1;
      nextJ -= 1;
    } else {
      nextI += deltaI;
      nextJ += deltaJ;
    }
  }
  return [nextI, nextJ];
}

export function getCursorSquare(clues: CluesData, cursor: Cursor): Square {
  if (!cursor) return [-1, -1];
  const { clueNumber, char, direction } = cursor;
  const clue = clues[direction].byNumber[clueNumber];
  if (!clue) return [-1, -1];
  const { row, col } = clue;
  return direction === 'across' ? [row, col + char] : [row + char, col];
}

function toPlayerAction(state: State, action: UIAction) {
  if (!state.clues) return null;

  if (action.type === 'BLUR') {
    return { cursor: null };
  }
  const [i, j] = getCursorSquare(state.clues, state.cursor);
  if (action.type === 'CLICK_CELL') {
    const direction = state.cursor && state.cursor.direction;
    const acrossCursor = getAcrossCursor(state.clues, action.i, action.j);
    const downCursor = getDownCursor(state.clues, action.i, action.j);
    if (action.i === i && action.j === j && direction === 'across') {
      // A user clicking the same square twice
      // probably wants to switch direction.
      return {
        cursor: downCursor || acrossCursor,
      };
    }
    return {
      cursor: acrossCursor || downCursor,
    };
  }
  if (action.type === 'KEY_PRESS') {
    if (!state.cursor) return state; // This shouldn't normally happen.
    const { key, keyCode } = action;
    if (key === 'Escape') {
      return { cursor: null };
    }
    if (key === 'Delete') {
      return { cursor: state.cursor, setLetter: { i, j, letter: '' } };
    }
    if (key === 'Backspace') {
      const cursor = getLastCursorChar(state.clues, state.cursor);
      return { cursor, setLetter: { i, j, letter: '' } };
    }
    if ((keyCode >= 65 && keyCode < 91) || key === ' ') {
      const cursor = getNextCursorChar(state.clues, state.cursor);
      return { cursor, setLetter: { i, j, letter: key.toUpperCase() } };
    }

    if (
      key === 'ArrowRight' ||
      key === 'ArrowLeft' ||
      key === 'ArrowUp' ||
      key === 'ArrowDown'
    ) {
      const shift = {
        ArrowUp: [-1, 0] as [-1, 0],
        ArrowDown: [1, 0] as [1, 0],
        ArrowLeft: [0, -1] as [0, -1],
        ArrowRight: [0, 1] as [0, 1],
      }[key];
      const [nextI, nextJ] = getNextSquare(state.clues, [i, j], shift);
      const acrossCursor = getAcrossCursor(state.clues, nextI, nextJ);
      const downCursor = getDownCursor(state.clues, nextI, nextJ);
      return {
        cursor:
          state.cursor.direction === 'across'
            ? acrossCursor || downCursor
            : downCursor || acrossCursor,
      };
    }
  }
  return { cursor: state.cursor };
}

export default (state: State, action: UIAction): PlayerAction | null => {
  const typedAction = toPlayerAction(state, action);
  return typedAction && { ...typedAction, type: 'PLAYER_ACTION' };
};
