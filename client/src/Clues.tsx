import * as React from 'react';

import { ClueSetData } from './shared/types';

type ClueProps = {
  number: number;
  clue: string;
  wordArrangement: string;
};

const Clue = ({ number, clue, wordArrangement }: ClueProps) => (
  <div>{`${number}: ${clue} (${wordArrangement})`}</div>
);

type CluesProps = {
  across: ClueSetData;
  down: ClueSetData;
};

const Clues = ({ across, down }: CluesProps) => {
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
          />
        );
      })}
    </div>
  );
};

export default Clues;
