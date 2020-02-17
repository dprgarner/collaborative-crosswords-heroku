import * as React from 'react';
import io from 'socket.io-client';

import './App.css';

import Clues from './Clues';
import Grid from './Grid';
import { UIAction } from './types';
import toPlayerAction from './toPlayerAction';
import { getLayout } from './gridSelectors';
import { effectReducer } from './shared/reducer';
import { EffectAction } from './shared/types';

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
    socket.on('disconnect', () => {
      dispatch({ type: 'RECONNECTING' });
    });
    socket.on('effectAction', (effectAction: EffectAction) => {
      dispatch(effectAction);
      if (effectAction.type === 'SET_INITIAL_DATA') {
        setPlayerId(effectAction.playerId);
      }
    });
    return () => {
      socket.close();
    };
  }, []);

  const { letters, clues, cursors } = state;
  if (!clues || !playerId) {
    return <h1 style={{ height: '100vh' }}>Loading...</h1>;
  }

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
          cursors={cursors}
          playerId={playerId}
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
