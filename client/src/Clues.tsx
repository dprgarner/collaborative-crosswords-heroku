import * as React from 'react';
import classNames from 'classnames';

import { ClueSetData, Cursor } from './shared/types';

type ClueProps = {
  number: number;
  clue: string;
  wordArrangement: string;
  isActive: boolean;
};

const Clue = ({ number, clue, wordArrangement, isActive }: ClueProps) => (
  <div className={classNames('Clue', isActive && 'isActive')}>
    {`${number}: ${clue} (${wordArrangement})`}
  </div>
);

type CluesProps = {
  across: ClueSetData;
  down: ClueSetData;
  playerCursor: Cursor;
};

const Clues = ({ across, down, playerCursor }: CluesProps) => {
  return (
    <div className="Clues">
      <h2>Across</h2>
      {across.order.map(number => {
        const { clue, wordArrangement } = across.byNumber[number];
        return (
          <Clue
            key={number}
            number={number}
            clue={clue}
            wordArrangement={wordArrangement}
            isActive={
              playerCursor?.direction === 'across' &&
              playerCursor.clueNumber === number
            }
          />
        );
      })}

      <h2>Down</h2>
      {down.order.map(number => {
        const { clue, wordArrangement } = down.byNumber[number];
        return (
          <Clue
            key={number}
            number={number}
            clue={clue}
            wordArrangement={wordArrangement}
            isActive={
              playerCursor?.direction === 'down' &&
              playerCursor.clueNumber === number
            }
          />
        );
      })}
    </div>
  );
};

export default Clues;
