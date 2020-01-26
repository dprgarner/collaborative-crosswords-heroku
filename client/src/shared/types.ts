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

export type CurrentPlayerAction = {
  active: Active;
  setLetter?: { i: number; j: number; letter: string };
};

export type PlayerAction = { type: 'PLAYER_ACTION' } & CurrentPlayerAction;

export type EffectAction =
  | PlayerAction
  | ({ type: 'SET_INITIAL_STATE' } & State)
  | { type: 'RECONNECTING' };

export type State = {
  active: Active;
  letters: string[][];
  clues: CluesData | null;
};
