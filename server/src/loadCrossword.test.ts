import loadCrossword, {
  getClueStartSquares,
  getClueNumbers,
  toWordArrangement,
} from './loadCrossword';
import { CluesData } from './shared/types';

test('parses an answer to a wordArrangement', () => {
  expect(toWordArrangement('Lemgthy')).toBe('7');
  expect(toWordArrangement('Ho Ho Ho')).toBe('2,2,2');
  expect(toWordArrangement('Hy-phen')).toBe('2-4');
  expect(toWordArrangement('One-of each')).toBe('3-2,4');
});

test('throws when input is the wrong shape', () => {
  for (let exampleYaml of [
    `
  across:
    0,0:
      - The sound a doggy makes
      - Woof
    2,0:
      - You do this to a door
      - Open
    `,

    `
  across:
    0,0:
      - One entry
  down:
    0,0:
    - One entry
    `,

    `
  across:
    0,0:
      - Three entries
      - Three entries
      - Three entries
  down:
    0,0:
    - Three entries
    - Three entries
    - Three entries
    `,

    `
  across:
    0, 0:
      - Bad key
  down:
    0,0:
      - Bad key
    `,
  ]) {
    expect(() => loadCrossword(exampleYaml)).toThrowError(/ValidationError/);
    expect(() => loadCrossword(exampleYaml)).toThrowError(/Invalid Input/);
  }
});

test('throws when across and down answers do not match', () => {
  const exampleYaml = `
    across:
      0,0:
        - The sound a doggy makes
        - Woof
    down:
      0,1:
        - I do not fit
        - Whoops
    `;
  expect(() => loadCrossword(exampleYaml)).toThrowError(/ValidationError/);
  expect(() => loadCrossword(exampleYaml)).toThrowError(/Inconsistent Clues/);
});

test('getClueStartSquares finds the clue starts', () => {
  expect(
    getClueStartSquares([
      ['A', 'B', 'C'],
      ['A', '', ''],
      ['A', '', ''],
    ]),
  ).toEqual({
    across: [
      [true, false, false],
      [false, false, false],
      [false, false, false],
    ],
    down: [
      [true, false, false],
      [false, false, false],
      [false, false, false],
    ],
  });

  expect(
    getClueStartSquares([
      ['A', 'B', 'C'],
      ['', 'B', ''],
      ['', 'B', ''],
    ]),
  ).toEqual({
    across: [
      [true, false, false],
      [false, false, false],
      [false, false, false],
    ],
    down: [
      [false, true, false],
      [false, false, false],
      [false, false, false],
    ],
  });

  expect(
    getClueStartSquares([
      ['', '', ''],
      ['', 'B', 'C'],
      ['', '', ''],
    ]),
  ).toEqual({
    across: [
      [false, false, false],
      [false, true, false],
      [false, false, false],
    ],
    down: [
      [false, false, false],
      [false, false, false],
      [false, false, false],
    ],
  });

  expect(
    getClueStartSquares([
      ['', '', ''],
      ['', 'B', ''],
      ['', 'B', ''],
    ]),
  ).toEqual({
    across: [
      [false, false, false],
      [false, false, false],
      [false, false, false],
    ],
    down: [
      [false, false, false],
      [false, true, false],
      [false, false, false],
    ],
  });
});

test('getClueStartSquares finds the clue starts in the last row and column', () => {
  expect(
    getClueStartSquares([
      ['', '', 'C'],
      ['', '', 'C'],
      ['A', 'B', 'C'],
    ]),
  ).toEqual({
    across: [
      [false, false, false],
      [false, false, false],
      [true, false, false],
    ],
    down: [
      [false, false, true],
      [false, false, false],
      [false, false, false],
    ],
  });
});

test('getClueNumbers gets the expected clue numbers', () => {
  expect(
    getClueNumbers(
      getClueStartSquares([
        ['', 'A', ''],
        ['A', 'A', ''],
        ['', 'A', 'A'],
      ]),
    ),
  ).toEqual({
    across: {
      '1,0': 2,
      '2,1': 3,
    },
    down: {
      '0,1': 1,
    },
  });

  expect(
    getClueNumbers(
      getClueStartSquares([
        ['', 'A', 'A'],
        ['', 'A', ''],
        ['', 'A', 'A'],
      ]),
    ),
  ).toEqual({
    across: {
      '0,1': 1,
      '2,1': 2,
    },
    down: {
      '0,1': 1,
    },
  });
});

test('throws if clues are too close together', () => {
  const eg1 = `
    across:
      0,0:
        - The sound a doggy makes
        - Woof
      1,0:
        - I am too close; there needs to be more "down" clues
        - Oops
    down:
      0,0:
        - Much crossword
        - Wow
    `;
  expect(() => loadCrossword(eg1)).toThrowError(/ValidationError/);
  expect(() => loadCrossword(eg1)).toThrowError(/Missing Clues/);
});

test('parses YAML to clues and answers', () => {
  const exampleYaml = `
    across:
      0,0:
        - The sound a doggy makes
        - Woof
      2,0:
        - You do this to a door
        - Open
    down:
      0,0:
        - Lots of trees
        - Wo od
      2,3:
        - Negative
        - No
    `;

  const clues: CluesData = {
    width: 4,
    height: 4,
    across: {
      order: [1, 2],
      byNumber: {
        1: {
          clue: 'The sound a doggy makes',
          size: 4,
          row: 0,
          col: 0,
          wordArrangement: '4',
        },
        2: {
          clue: 'You do this to a door',
          size: 4,
          row: 2,
          col: 0,
          wordArrangement: '4',
        },
      },
    },
    down: {
      order: [1, 3],
      byNumber: {
        1: {
          clue: 'Lots of trees',
          size: 4,
          row: 0,
          col: 0,
          wordArrangement: '2,2',
        },
        3: {
          clue: 'Negative',
          size: 2,
          row: 2,
          col: 3,
          wordArrangement: '2',
        },
      },
    },
  };

  const answers: string[][] = [
    ['W', 'O', 'O', 'F'],
    ['O', '', '', ''],
    ['O', 'P', 'E', 'N'],
    ['D', '', '', 'O'],
  ];

  const { clues: actualClues, answers: actualAnswers } = loadCrossword(
    exampleYaml,
  );
  expect(actualClues).toEqual(clues);
  expect(actualAnswers).toEqual(answers);
});
