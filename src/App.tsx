import * as React from 'react';

import './App.css';

import Clues from './Clues';
import Grid from './Grid';
import { CluesData } from './types';
import { reducer, getLayout, getActiveSquare } from './crosswordState';

type CrosswordProps = {
  clues: CluesData;
};

const Crossword = ({ clues: cluesProp }: CrosswordProps) => {
  const [{ active, letters, clues }, dispatch] = React.useReducer(reducer, {
    active: null,
    letters: [[], [], ['O', 'P', 'E', 'N'], []],
    clues: cluesProp,
  });
  const layout = getLayout(clues);
  const activeSquare = getActiveSquare(clues, active);

  return (
    <div className="Crossword">
      <div className="GridPanel">
        <Grid
          activeSquare={activeSquare}
          layout={layout}
          letters={letters}
          dispatch={dispatch}
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

  return <Crossword clues={clues} />;
}
