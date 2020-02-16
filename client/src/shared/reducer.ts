import { EffectAction, State } from './types';

export function effectReducer(state: State, action: EffectAction): State {
  if (!action) return state;

  if (action.type === 'SET_INITIAL_DATA') {
    const { state: initialState } = action;
    return initialState;
  }
  if (action.type === 'RECONNECTING') {
    return { cursors: {}, clues: null, letters: [] };
  }
  if (action.type === 'PLAYER_ACTION') {
    let letters = state.letters;
    const { cursor, setLetter, playerId } = action;
    if (setLetter) {
      const { i, j, letter } = setLetter;
      letters = [...letters];
      const newRow = [...letters[i]];
      newRow[j] = letter;
      letters[i] = newRow;
    }
    const cursors = { ...state.cursors };
    if (cursor) {
      cursors[playerId] = cursor;
    } else {
      delete cursors[playerId];
    }
    return { ...state, cursors, letters };
  }
  if (action.type === 'PLAYER_DISCONNECTED') {
    const { playerId } = action;
    const cursors = { ...state.cursors };
    delete cursors[playerId];
    return { ...state, cursors };
  }
  return state;
}
