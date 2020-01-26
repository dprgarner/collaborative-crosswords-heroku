import memoizeOne from 'memoize-one';

import { Square, State, UIAction } from './types';
import { Active, CluesData } from './shared/types';

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

export function getActiveSquare(clues: CluesData, active: Active): Square {
  if (!active) return [-1, -1];
  const { clueNumber, char, direction } = active;
  const clue = clues[direction].byNumber[clueNumber];
  if (!clue) return [-1, -1];
  const { row, col } = clue;
  return direction === 'across' ? [row, col + char] : [row + char, col];
}

function getAcrossActive(clues: CluesData, i: number, j: number): Active {
  for (const clueNumber of clues.across.order) {
    const { row, col, size } = clues.across.byNumber[clueNumber];
    if (i === row && j >= col && j < col + size) {
      return { clueNumber, char: j - col, direction: 'across' };
    }
  }
  return null;
}

function getDownActive(clues: CluesData, i: number, j: number): Active {
  for (const clueNumber of clues.down.order) {
    const { row, col, size } = clues.down.byNumber[clueNumber];
    if (j === col && i >= row && i < row + size) {
      return { clueNumber, char: i - row, direction: 'down' };
    }
  }
  return null;
}

function getNextActiveChar(clues: CluesData, active: Active & {}): Active {
  const { char, clueNumber, direction } = active;
  const clue = clues[direction].byNumber[clueNumber];
  const nextActive: Active = {
    char: char + 1,
    clueNumber,
    direction,
  };
  if (nextActive.char !== clue.size) {
    return nextActive;
  }
  return getNextActiveClue(clues, active);
}

function getNextActiveClue(clues: CluesData, active: Active & {}): Active {
  const { clueNumber, direction } = active;
  const clueIndex = clues[direction].order.indexOf(clueNumber) + 1;
  const nextActive: Active = {
    char: 0,
    clueNumber: clues[direction].order[clueIndex],
    direction,
  };
  if (nextActive.clueNumber) {
    return nextActive;
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

function getLastActiveChar(clues: CluesData, active: Active & {}): Active {
  const { char, clueNumber, direction } = active;
  const lastActive: Active = {
    char: char - 1,
    clueNumber,
    direction,
  };
  if (lastActive.char !== -1) {
    return lastActive;
  }
  return getLastActiveClue(clues, active);
}

function getLastActiveClue(clues: CluesData, active: Active & {}): Active {
  const { clueNumber, direction } = active;
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

type PlayerAction = {
  active: Active;
  setLetter?: { i: number; j: number; letter: string };
};

type EffectAction =
  | ({ type: 'PLAYER_ACTION' } & PlayerAction)
  | {
      type: 'SET_INITIAL_STATE';
      clues: CluesData;
      letters: string[][];
    }
  | { type: 'RECONNECTING' };

export function toPlayerAction(
  state: State,
  action: UIAction,
): PlayerAction | null {
  if (!state.clues) return null;

  if (action.type === 'BLUR') {
    return { active: null };
  }
  const [i, j] = getActiveSquare(state.clues, state.active);
  if (action.type === 'CLICK_CELL') {
    const direction = state.active && state.active.direction;
    const acrossActive = getAcrossActive(state.clues, action.i, action.j);
    const downActive = getDownActive(state.clues, action.i, action.j);
    if (action.i === i && action.j === j && direction === 'across') {
      // A user clicking the same square twice
      // probably wants to switch direction.
      return {
        active: downActive || acrossActive,
      };
    }
    return {
      active: acrossActive || downActive,
    };
  }
  if (action.type === 'KEY_PRESS') {
    if (!state.active) return state; // This shouldn't normally happen.
    const { key, keyCode } = action;
    if (key === 'Escape') {
      return { active: null };
    }
    if (key === 'Delete') {
      return { active: state.active, setLetter: { i, j, letter: '' } };
    }
    if (key === 'Backspace') {
      const active = getLastActiveChar(state.clues, state.active);
      return { active, setLetter: { i, j, letter: '' } };
    }
    if ((keyCode >= 65 && keyCode < 91) || key === ' ') {
      const active = getNextActiveChar(state.clues, state.active);
      return { active, setLetter: { i, j, letter: key.toUpperCase() } };
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
      const acrossActive = getAcrossActive(state.clues, nextI, nextJ);
      const downActive = getDownActive(state.clues, nextI, nextJ);
      return {
        active:
          state.active.direction === 'across'
            ? acrossActive || downActive
            : downActive || acrossActive,
      };
    }
  }
  return { active: state.active };
}

export function effectReducer(state: State, action: EffectAction): State {
  let letters = state.letters;
  if (!action) return state;

  if (action.type === 'SET_INITIAL_STATE') {
    const { clues, letters } = action;
    return {
      active: null,
      clues,
      letters,
    };
  }
  if (action.type === 'RECONNECTING') {
    return { active: null, clues: null, letters: [] };
  }

  const { active, setLetter } = action;
  if (setLetter) {
    const { i, j, letter } = setLetter;
    letters = [...letters];
    const newRow = [...letters[i]];
    newRow[j] = letter;
    letters[i] = newRow;
  }
  return {
    ...state,
    active,
    letters,
  };
}
