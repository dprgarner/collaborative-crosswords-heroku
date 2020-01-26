import * as React from 'react';
import io from 'socket.io-client';

import './App.css';

import Clues from './Clues';
import Grid from './Grid';
import { UIAction } from './types';
import {
  toPlayerAction,
  effectReducer,
  getLayout,
  getActiveSquare,
} from './crosswordState';

import { ServerState } from './shared/fromServer';

export default function App() {
  const [state, dispatch] = React.useReducer(effectReducer, {
    active: null,
    letters: [],
    clues: null,
  });

  React.useEffect(() => {
    const socket = io.connect();
    socket.on('serverState', (serverState: ServerState) => {
      dispatch({ type: 'SET_INITIAL_STATE', ...serverState });
    });
    socket.on('disconnect', () => {
      dispatch({ type: 'RECONNECTING' });
    });
    return () => {
      socket.close();
    };
  }, []);

  const { active, letters, clues } = state;
  if (!clues) return <h1 style={{ height: '100vh' }}>Loading...</h1>;

  const uiDispatch = (uiAction: UIAction) => {
    const effectAction = toPlayerAction(state, uiAction);
    if (effectAction) {
      // Send it over a websocket here.
      console.log(effectAction);
      dispatch({ type: 'PLAYER_ACTION', ...effectAction });
    }
  };

  const layout = getLayout(clues);
  const activeSquare = getActiveSquare(clues, active);

  return (
    <div className="Crossword">
      <div className="GridPanel">
        <Grid
          activeSquare={activeSquare}
          layout={layout}
          letters={letters}
          dispatch={uiDispatch}
        />
      </div>
      <div>
        <Clues across={clues.across} down={clues.down} />
      </div>
    </div>
  );
}
