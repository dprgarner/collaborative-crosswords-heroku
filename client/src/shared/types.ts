export type ClueSetData = {
  order: number[];
  byNumber: {
    [number: string]: {
      clue: string;
      size: number;
      row: number;
      col: number;
    };
  };
};

export type CluesData = {
  width: number;
  height: number;
  across: ClueSetData;
  down: ClueSetData;
};

/**
 * A representation of the user's focus within the grid. All modifications to
 * the grid's letters are performed by modifying a letter at a time, and most result in the cursor being moved.
 */
export type Cursor = {
  /**
   * The direction that the cursor is pointing in.
   */
  direction: 'across' | 'down';

  /**
   * The clue's number.
   */
  clueNumber: number;

  /**
   * The character index within the clue, indexed from 0.
   */
  char: number;
} | null;

/**
 * An action describing how a player has changed the state of their cursor and
 * the board. This action is distinct from UIAction, which only records the key
 * strokes or clicks; this action describes the end result of the UI interaction
 * to the server and the other connected players.
 */
export type PlayerAction = {
  type: 'PLAYER_ACTION';

  /**
   * The UUID of the player making the move.
   */
  playerId: string;

  /**
   * The new location of the user's cursor.
   */
  cursor: Cursor;

  /**
   * Any modifications to entered letters in the grid.
   */
  setLetter?: { i: number; j: number; letter: string };
};

export type EffectAction =
  | PlayerAction
  | { type: 'SET_INITIAL_DATA'; state: State; playerId: string }
  | { type: 'RECONNECTING' }
  | { type: 'PLAYER_DISCONNECTED'; playerId: string };

export type State = {
  /**
   * The position of the connected users' cursors within the board.
   */
  cursors: {
    [uuid: string]: Cursor;
  };

  /**
   * The 2d array of filled-in letters in the crossword. Blank and out-of-bounds
   * letters are represented with an empty string.
   */
  letters: string[][];

  /**
   * The clues of the current crossword.
   */
  clues: CluesData | null;
};
