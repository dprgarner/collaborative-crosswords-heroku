import _ from 'lodash';

import { UIAction } from './types';
import { State } from './shared/types';
import { CluesData, Cursor } from './shared/types';
import toPlayerAction from './toPlayerAction';
import { effectReducer } from './shared/reducer';

const reducer = (state: State, action: UIAction) => {
  const effectAction = toPlayerAction(state, action);
  return effectAction
    ? effectReducer(state, { type: 'PLAYER_ACTION', ...effectAction })
    : state;
};

const clues: CluesData = {
  width: 4,
  height: 4,
  across: {
    order: [1, 2],
    byNumber: {
      1: { clue: 'The sound a doggy makes', size: 4, row: 0, col: 0 },
      2: { clue: 'You do this to a door', size: 4, row: 2, col: 0 },
    },
  },
  down: {
    order: [1],
    byNumber: {
      1: { clue: 'Lots of trees', size: 4, row: 0, col: 0 },
    },
  },
};

describe('blurring', () => {
  it('blurs on action', () => {
    const letters = [[], [], [], []];
    const state: State = {
      cursor: {
        char: 3,
        clueNumber: 2,
        direction: 'across',
      },
      clues,
      letters,
    };
    const action: UIAction = { type: 'BLUR' };
    const finalState: State = {
      cursor: null,
      clues,
      letters,
    };
    expect(reducer(state, action)).toEqual(finalState);
  });

  it('blurs on escape', () => {
    const letters = [[], [], [], []];
    const state: State = {
      cursor: {
        char: 3,
        clueNumber: 2,
        direction: 'across',
      },
      clues,
      letters,
    };
    const action: UIAction = {
      type: 'KEY_PRESS',
      key: 'Escape',
      keyCode: 27,
    };
    const finalState: State = {
      cursor: null,
      clues,
      letters,
    };
    expect(reducer(state, action)).toEqual(finalState);
  });
});

describe('clicking', () => {
  it('selects a square', () => {
    const letters = [[], [], [], []];
    const state: State = {
      cursor: null,
      clues,
      letters,
    };
    const action: UIAction = { type: 'CLICK_CELL', i: 2, j: 2 };
    const finalState: State = {
      cursor: {
        char: 2,
        clueNumber: 2,
        direction: 'across',
      },
      clues,
      letters,
    };
    expect(reducer(state, action)).toEqual(finalState);
  });

  it('selects nowhere if the square is black', () => {
    const letters = [[], [], [], []];
    const state: State = {
      cursor: null,
      clues,
      letters,
    };
    const action: UIAction = { type: 'CLICK_CELL', i: 1, j: 2 };
    const finalState: State = {
      cursor: null,
      clues,
      letters,
    };
    expect(reducer(state, action)).toEqual(finalState);
  });

  it('selects a down-only clue square', () => {
    const letters = [[], [], [], []];
    const state: State = {
      cursor: null,
      clues,
      letters,
    };
    const action: UIAction = { type: 'CLICK_CELL', i: 1, j: 0 };
    const finalState: State = {
      cursor: {
        char: 1,
        clueNumber: 1,
        direction: 'down',
      },
      clues,
      letters,
    };
    expect(reducer(state, action)).toEqual(finalState);
  });

  it('switches orientation to across when clicking the same square', () => {
    const letters = [[], [], [], []];
    const state: State = {
      cursor: {
        char: 0,
        clueNumber: 1,
        direction: 'down',
      },
      clues,
      letters,
    };
    const action: UIAction = { type: 'CLICK_CELL', i: 0, j: 0 };
    const finalState: State = {
      cursor: {
        char: 0,
        clueNumber: 1,
        direction: 'across',
      },
      clues,
      letters,
    };
    expect(reducer(state, action)).toEqual(finalState);
  });

  it('switches orientation to down clicking the same square', () => {
    const letters = [[], [], [], []];
    const state: State = {
      cursor: {
        char: 0,
        clueNumber: 1,
        direction: 'across',
      },
      clues,
      letters,
    };
    const action: UIAction = { type: 'CLICK_CELL', i: 0, j: 0 };
    const finalState: State = {
      cursor: {
        char: 0,
        clueNumber: 1,
        direction: 'down',
      },
      clues,
      letters,
    };
    expect(reducer(state, action)).toEqual(finalState);
  });
});

describe('entering letters', () => {
  it('enters a word', () => {
    const state: State = {
      cursor: {
        char: 0,
        clueNumber: 1,
        direction: 'across',
      },
      clues,
      letters: [[], [], [], []],
    };
    const actions: UIAction[] = [
      { type: 'KEY_PRESS', key: 'w', keyCode: 'W'.charCodeAt(0) },
      { type: 'KEY_PRESS', key: 'e', keyCode: 'E'.charCodeAt(0) },
      { type: 'KEY_PRESS', key: 'l', keyCode: 'L'.charCodeAt(0) },
      { type: 'KEY_PRESS', key: 'p', keyCode: 'P'.charCodeAt(0) },
    ];
    expect(actions.reduce(reducer, state)).toEqual({
      cursor: {
        char: 0,
        clueNumber: 2,
        direction: 'across',
      },
      clues,
      letters: [['W', 'E', 'L', 'P'], [], [], []],
    });
  });

  it('enters a word downwards', () => {
    const state: State = {
      cursor: {
        char: 0,
        clueNumber: 1,
        direction: 'down',
      },
      clues,
      letters: [['W', 'E', 'L', 'P'], [], [], []],
    };
    const actions: UIAction[] = [
      { type: 'KEY_PRESS', key: 'n', keyCode: 'N'.charCodeAt(0) },
      { type: 'KEY_PRESS', key: 'o', keyCode: 'O'.charCodeAt(0) },
      { type: 'KEY_PRESS', key: 'p', keyCode: 'P'.charCodeAt(0) },
      { type: 'KEY_PRESS', key: 'e', keyCode: 'E'.charCodeAt(0) },
    ];
    expect(actions.reduce(reducer, state)).toEqual({
      cursor: null,
      clues,
      letters: [['N', 'E', 'L', 'P'], ['O'], ['P'], ['E']],
    });
  });
});

describe('deleting letters', () => {
  it('deletes a letter in-place', () => {
    const state: State = {
      cursor: {
        char: 2,
        clueNumber: 1,
        direction: 'across',
      },
      clues,
      letters: [['W', 'E', 'L', 'P'], [], [], []],
    };
    const actions: UIAction[] = [
      { type: 'KEY_PRESS', key: 'Delete', keyCode: 46 },
    ];
    expect(actions.reduce(reducer, state)).toEqual({
      cursor: {
        char: 2,
        clueNumber: 1,
        direction: 'across',
      },
      clues,
      letters: [['W', 'E', '', 'P'], [], [], []],
    });
  });

  it('deletes multiple letters', () => {
    const state: State = {
      cursor: {
        char: 3,
        clueNumber: 1,
        direction: 'across',
      },
      clues,
      letters: [['W', 'E', 'L', 'P'], [], [], []],
    };
    const actions: UIAction[] = [
      { type: 'KEY_PRESS', key: 'Backspace', keyCode: 8 },
      { type: 'KEY_PRESS', key: 'Backspace', keyCode: 8 },
      { type: 'KEY_PRESS', key: 'Backspace', keyCode: 8 },
    ];
    expect(actions.reduce(reducer, state)).toEqual({
      cursor: {
        char: 0,
        clueNumber: 1,
        direction: 'across',
      },
      clues,
      letters: [['W', '', '', ''], [], [], []],
    });
  });
});

/**
 * Similar to reduce, but returns a list of all the intermediate accumulated
 * states.
 */
function scan<A, T>(xs: T[], f: (a: A, t: T) => A, acc: A) {
  var result: A[] = [];
  for (var i = 0; i < xs.length; i++) {
    acc = result[result.push(f(acc, xs[i])) - 1];
  }
  return result;
}

describe('navigating letters', () => {
  it('moves right', () => {
    const state: State = {
      cursor: {
        char: 0,
        clueNumber: 1,
        direction: 'across',
      },
      clues,
      letters: [[], [], [], []],
    };
    const actions: UIAction[] = _.times(10, () => ({
      type: 'KEY_PRESS',
      key: 'ArrowRight',
      keyCode: 39,
    }));
    const cursorStates: Cursor[] = scan(actions, reducer, state).map(
      ({ cursor }) => cursor,
    );
    expect(cursorStates).toEqual([
      { direction: 'across', clueNumber: 1, char: 1 },
      { direction: 'across', clueNumber: 1, char: 2 },
      { direction: 'across', clueNumber: 1, char: 3 },
      { direction: 'down', clueNumber: 1, char: 1 },
      { direction: 'down', clueNumber: 1, char: 2 },
      { direction: 'across', clueNumber: 2, char: 1 },
      { direction: 'across', clueNumber: 2, char: 2 },
      { direction: 'across', clueNumber: 2, char: 3 },
      { direction: 'down', clueNumber: 1, char: 3 },
      { direction: 'down', clueNumber: 1, char: 0 },
    ]);
  });

  it('moves down', () => {
    const state: State = {
      cursor: {
        char: 0,
        clueNumber: 1,
        direction: 'across',
      },
      clues,
      letters: [[], [], [], []],
    };
    const actions: UIAction[] = _.times(10, () => ({
      type: 'KEY_PRESS',
      key: 'ArrowDown',
      keyCode: 40,
    }));
    const cursorStates: Cursor[] = scan(actions, reducer, state).map(
      ({ cursor }) => cursor,
    );
    expect(cursorStates).toEqual([
      { direction: 'down', clueNumber: 1, char: 1 },
      { direction: 'down', clueNumber: 1, char: 2 },
      { direction: 'down', clueNumber: 1, char: 3 },
      { direction: 'across', clueNumber: 1, char: 1 },
      { direction: 'across', clueNumber: 2, char: 1 },
      { direction: 'across', clueNumber: 1, char: 2 },
      { direction: 'across', clueNumber: 2, char: 2 },
      { direction: 'across', clueNumber: 1, char: 3 },
      { direction: 'across', clueNumber: 2, char: 3 },
      { direction: 'across', clueNumber: 1, char: 0 },
    ]);
  });

  it('moves left', () => {
    const state: State = {
      cursor: {
        char: 0,
        clueNumber: 1,
        direction: 'across',
      },
      clues,
      letters: [[], [], [], []],
    };
    const actions: UIAction[] = _.times(10, () => ({
      type: 'KEY_PRESS',
      key: 'ArrowLeft',
      keyCode: 37,
    }));
    const cursorStates: Cursor[] = scan(actions, reducer, state).map(
      ({ cursor }) => cursor,
    );
    expect(cursorStates).toEqual([
      { direction: 'down', clueNumber: 1, char: 3 },
      { direction: 'across', clueNumber: 2, char: 3 },
      { direction: 'across', clueNumber: 2, char: 2 },
      { direction: 'across', clueNumber: 2, char: 1 },
      { direction: 'across', clueNumber: 2, char: 0 },
      { direction: 'down', clueNumber: 1, char: 1 },
      { direction: 'across', clueNumber: 1, char: 3 },
      { direction: 'across', clueNumber: 1, char: 2 },
      { direction: 'across', clueNumber: 1, char: 1 },
      { direction: 'across', clueNumber: 1, char: 0 },
    ]);
  });

  it('moves up', () => {
    const state: State = {
      cursor: {
        char: 0,
        clueNumber: 1,
        direction: 'across',
      },
      clues,
      letters: [[], [], [], []],
    };
    const actions: UIAction[] = _.times(10, () => ({
      type: 'KEY_PRESS',
      key: 'ArrowUp',
      keyCode: 38,
    }));
    const cursorStates: Cursor[] = scan(actions, reducer, state).map(
      ({ cursor }) => cursor,
    );
    expect(cursorStates).toEqual([
      { direction: 'across', clueNumber: 2, char: 3 },
      { direction: 'across', clueNumber: 1, char: 3 },
      { direction: 'across', clueNumber: 2, char: 2 },
      { direction: 'across', clueNumber: 1, char: 2 },
      { direction: 'across', clueNumber: 2, char: 1 },
      { direction: 'across', clueNumber: 1, char: 1 },
      { direction: 'down', clueNumber: 1, char: 3 },
      { direction: 'down', clueNumber: 1, char: 2 },
      { direction: 'down', clueNumber: 1, char: 1 },
      { direction: 'down', clueNumber: 1, char: 0 },
    ]);
  });
});
