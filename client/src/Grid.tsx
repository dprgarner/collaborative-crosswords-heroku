import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import { UIAction } from './types';
import { CluesData, Cursor } from './shared/types';
import { getCursorSquares } from './gridSelectors';

type GridProps = {
  layout: (number | boolean)[][];
  letters: string[][];
  dispatch: React.Dispatch<UIAction>;
  clues: CluesData;
  cursor: Cursor;
};

const Grid = ({ layout, letters, dispatch, clues, cursor }: GridProps) => {
  const cursorSquares = getCursorSquares(clues, cursor);
  const containerRef = React.useRef<HTMLTableElement>(null);
  React.useEffect(() => {
    if (!cursorSquares && containerRef.current) {
      containerRef.current.blur();
    }
  }, [cursorSquares]);

  return (
    <table
      className="Grid"
      tabIndex={0}
      ref={containerRef}
      onBlur={() => {
        dispatch({ type: 'BLUR' });
      }}
      onKeyDown={e => {
        if (!e.ctrlKey) {
          dispatch({ type: 'KEY_PRESS', keyCode: e.keyCode, key: e.key });
        }
      }}
    >
      <tbody>
        {layout.map((row, i) => (
          <tr key={i}>
            {row.map((col, j) => (
              <td
                key={j}
                className={classNames('GridCell', !col && 'Black')}
                onClick={() => {
                  dispatch({ type: 'CLICK_CELL', i, j });
                }}
                data-testid={`${i},${j}`}
              >
                {_.isNumber(col) && <span className="GridNumber">{col}</span>}

                {col && (
                  <span
                    className={classNames('GridLetter', cursorSquares[i][j])}
                  >
                    {letters[i][j]}
                  </span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
export default Grid;
