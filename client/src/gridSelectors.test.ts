import { getLayout } from './gridSelectors';
import { CluesData } from './shared/types';

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

describe('getLayout', () => {
  it('renders a layout', () => {
    expect(getLayout(clues)).toEqual([
      [1, true, true, true],
      [true, false, false, false],
      [2, true, true, true],
      [true, false, false, false],
    ]);
  });
});
