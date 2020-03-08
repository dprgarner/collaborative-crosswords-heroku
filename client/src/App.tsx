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
    isComplete: false,
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

  const { letters, clues, cursors, isComplete } = state;
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
        {isComplete ? '🎉🎉🎉' : null}
        <Grid
          clues={clues}
          cursors={cursors}
          playerId={playerId}
          layout={layout}
          letters={letters}
          dispatch={uiDispatch}
        />
        {isComplete ? <>{'🎉🎉🎉'}</> : null}
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => uiDispatch({ type: 'RESET' })}>
            Reset Board
          </button>
        </div>
        <div style={{ position: 'fixed', bottom: 0 }}>{playerId}</div>
      </div>
      <div>
        <Clues
          across={clues.across}
          down={clues.down}
          playerCursor={cursors[playerId]}
        />
      </div>
    </div>
  );
}
