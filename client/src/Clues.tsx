import * as React from 'react';

import { ClueSetData } from './types';

type ClueProps = {
  number: number;
  clue: string;
  size: number;
};

const Clue = ({ number, clue, size }: ClueProps) => (
  <div>{`${number}: ${clue} (${size})`}</div>
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
        const { clue, size } = across.byNumber[number];
        return <Clue key={number} number={number} clue={clue} size={size} />;
      })}

      <h2>Down</h2>
      {down.order.map(number => {
        const { clue, size } = down.byNumber[number];
        return <Clue key={number} number={number} clue={clue} size={size} />;
      })}
    </div>
  );
};

export default Clues;
