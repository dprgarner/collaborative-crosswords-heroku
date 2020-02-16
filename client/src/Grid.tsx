import * as React from 'react';
import classNames from 'classnames';
import * as _ from 'lodash';
import { Square, UIAction } from './types';

type GridProps = {
  layout: (number | boolean)[][];
  letters: string[][];
  dispatch: React.Dispatch<UIAction>;
  cursorSquare: Square;
};

const Grid = ({ layout, letters, dispatch, cursorSquare }: GridProps) => {
  const containerRef = React.useRef<HTMLTableElement>(null);
  React.useEffect(() => {
    const [i, j] = cursorSquare;
    if (i === -1 && j === -1 && containerRef.current) {
      containerRef.current.blur();
    }
  }, [cursorSquare]);

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
                    className={classNames(
                      'GridLetter',
                      i === cursorSquare[0] &&
                        j === cursorSquare[1] &&
                        'cursor',
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
