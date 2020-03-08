import loadCrossword, { toWordArrangement } from './loadCrossword';
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
      order: [1],
      byNumber: {
        1: {
          clue: 'Lots of trees',
          size: 4,
          row: 0,
          col: 0,
          wordArrangement: '2,2',
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
