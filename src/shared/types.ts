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
