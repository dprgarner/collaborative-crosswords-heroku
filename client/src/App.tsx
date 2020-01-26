import * as React from 'react';
import io from 'socket.io-client';

import './App.css';

import Clues from './Clues';
import Grid from './Grid';
import { CluesData, UIAction } from './types';
import {
  toEffectAction,
  effectReducer,
  getLayout,
  getActiveSquare,
} from './crosswordState';

type CrosswordProps = {
  clues: CluesData;
};

const Crossword = ({ clues: cluesProp }: CrosswordProps) => {
  const [state, dispatch] = React.useReducer(effectReducer, {
    active: null,
    letters: [[], [], ['O', 'P', 'E', 'N'], []],
    clues: cluesProp,
  });
  const { active, letters, clues } = state;

  const uiDispatch = (uiAction: UIAction) => {
    const effectAction = toEffectAction(state, uiAction);
    // Send it over a websocket here.
    console.log(effectAction);
    dispatch(effectAction);
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
};

export default function App() {
  const clues: CluesData = {
    width: 4,
    height: 4,
    across: {
      order: [1, 2],
      byNumber: {
        1: { clue: 'The sound a doggy makes', size: 4, row: 0, col: 0 },
        2: { clue: 'You do this to a door', size: 4, row: 2, col: 0 },
      },
    },
    down: {
      order: [1],
      byNumber: {
        1: { clue: 'Lots of trees', size: 4, row: 0, col: 0 },
      },
    },
  };

  React.useEffect(() => {
    const socket = io.connect();

    socket.on('boo', (msg: string) => {
      console.log(msg);
    });

    return () => {
      socket.close();
    };
  }, []);

  return <Crossword clues={clues} />;
}
