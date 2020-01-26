import * as React from 'react';
import io from 'socket.io-client';

import './App.css';

import Clues from './Clues';
import Grid from './Grid';
import { UIAction } from './types';
import { toPlayerAction, getLayout, getActiveSquare } from './crosswordState';
import { effectReducer } from './shared/reducer';
import { State, PlayerAction } from './shared/types';

export default function App() {
  const [state, dispatch] = React.useReducer(effectReducer, {
    active: null,
    letters: [],
    clues: null,
  });

  const socketRef = React.useRef<SocketIOClient.Socket | null>();
  React.useEffect(() => {
    socketRef.current = io.connect();
    const socket = socketRef.current;
    socket.on('serverState', (serverState: State) => {
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
    const socket = socketRef.current;
    const currentPlayerAction = toPlayerAction(state, uiAction);
    if (currentPlayerAction && socket) {
      const playerAction: PlayerAction = {
        type: 'PLAYER_ACTION',
        ...currentPlayerAction,
      };
      socket.emit('playerAction', playerAction);
      dispatch(playerAction);
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
