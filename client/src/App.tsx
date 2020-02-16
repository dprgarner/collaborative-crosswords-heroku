import * as React from 'react';
import io from 'socket.io-client';

import './App.css';

import Clues from './Clues';
import Grid from './Grid';
import { UIAction } from './types';
import toPlayerAction from './toPlayerAction';
import { getLayout } from './gridSelectors';
import { effectReducer } from './shared/reducer';
import { State, PlayerAction } from './shared/types';

export default function App() {
  const [state, dispatch] = React.useReducer(effectReducer, {
    cursors: {},
    letters: [],
    clues: null,
  });
  const [playerId, setPlayerId] = React.useState<string | null>(null);

  const socketRef = React.useRef<SocketIOClient.Socket | null>();
  React.useEffect(() => {
    socketRef.current = io.connect();
    const socket = socketRef.current;
    socket.on('initialData', (initialState: State, newPlayerId: string) => {
      dispatch({ type: 'SET_INITIAL_STATE', initialState });
      setPlayerId(newPlayerId);
    });
    socket.on('disconnect', () => {
      dispatch({ type: 'RECONNECTING' });
    });
    socket.on('playerAction', (playerAction: PlayerAction) => {
      dispatch(playerAction);
    });
    return () => {
      socket.close();
    };
  }, []);

  const { letters, clues } = state;
  if (!clues) return <h1 style={{ height: '100vh' }}>Loading...</h1>;
  const cursor = playerId ? state.cursors[playerId] : null;

  const uiDispatch = (uiAction: UIAction) => {
    const socket = socketRef.current;
    if (!playerId) return;
    const playerAction = toPlayerAction(state, uiAction, playerId);
    if (playerAction && socket) {
      socket.emit('playerAction', playerAction);
      dispatch(playerAction);
    }
  };

  const layout = getLayout(clues);

  return (
    <div className="Crossword">
      <div className="GridPanel">
        <div>{playerId}</div>
        <Grid
          clues={clues}
          cursor={cursor}
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
