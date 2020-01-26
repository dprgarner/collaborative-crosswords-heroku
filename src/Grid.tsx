import * as React from 'react';
import classNames from 'classnames';
import * as _ from 'lodash';
import { Square, Action } from './types';

type GridProps = {
  layout: (number | boolean)[][];
  letters: string[][];
  dispatch: React.Dispatch<Action>;
  activeSquare: Square;
};

const Grid = ({ layout, letters, dispatch, activeSquare }: GridProps) => {
  const containerRef = React.useRef<HTMLTableElement>(null);
  React.useEffect(() => {
    const [i, j] = activeSquare;
    if (i === -1 && j === -1 && containerRef.current) {
      containerRef.current.blur();
    }
  }, [activeSquare]);

  return (
    <table
      className="Grid"
      tabIndex={0}
      ref={containerRef}
      onBlur={() => {
        dispatch({ type: 'BLUR' });
      }}
      onKeyDown={e => {
        e.preventDefault();
        dispatch({ type: 'KEY_PRESS', keyCode: e.keyCode, key: e.key });
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
                    className={classNames(
                      'GridLetter',
                      i === activeSquare[0] &&
                        j === activeSquare[1] &&
                        'active',
                    )}
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
