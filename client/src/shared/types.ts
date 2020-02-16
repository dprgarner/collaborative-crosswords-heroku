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

export type Active = {
  clueNumber: number;
  char: number;
  direction: 'across' | 'down';
} | null;

/**
 * An action describing how a player has changed the state of their cursor and
 * the board from the perpective of the server and any other players.
 */
export type PlayerAction = {
  type: 'PLAYER_ACTION';
  active: Active;
  setLetter?: { i: number; j: number; letter: string };
};

export type EffectAction =
  | PlayerAction
  | ({ type: 'SET_INITIAL_STATE' } & State)
  | { type: 'RECONNECTING' };

export type State = {
  active: Active;
  letters: string[][];
  clues: CluesData | null;
};
