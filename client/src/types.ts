export type Square = [number, number];

/**
 * An action describing a user's interaction with the UI.
 */
export type UIAction =
  | { type: 'BLUR' }
  | { type: 'KEY_PRESS'; keyCode: number; key: string }
  | { type: 'CLICK_CELL'; i: number; j: number };
