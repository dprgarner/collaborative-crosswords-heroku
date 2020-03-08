import assert from 'assert';
import { every } from 'lodash';
import { safeLoad } from 'js-yaml';
import { CluesData } from './shared/types';

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

export function toWordArrangement(answer: string): string {
  let currentWordLength = 0;
  let currentWordArrangement = '';
  for (let i = 0; i < answer.length; i += 1) {
    if (answer[i] === ' ') {
      currentWordArrangement += `${currentWordLength},`;
      currentWordLength = 0;
    } else if (answer[i] === '-') {
      currentWordArrangement += `${currentWordLength}-`;
      currentWordLength = 0;
    } else {
      currentWordLength += 1;
    }
  }
  currentWordArrangement += `${currentWordLength}`;
  return currentWordArrangement;
}

type YamlClueData = {
  across: { [rowCol: string]: [string, string] };
  down: { [rowCol: string]: [string, string] };
};

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export default function loadCrossword(yamlStr: string) {
  const clueData = safeLoad(yamlStr) as YamlClueData;
  assert(
    clueData &&
      typeof clueData === 'object' &&
      Object.keys(clueData).length === 2 &&
      clueData.across &&
      clueData.down &&
      every(
        Object.entries(clueData.across).concat(Object.entries(clueData.down)),
        ([rowCol, clueAnswerTuple]) =>
          rowCol.match(/\d+,\d+/) && clueAnswerTuple.length === 2,
      ),
    new ValidationError('Invalid Input'),
  );

  let width = -1;
  let height = -1;
  const answers: string[][] = [];
  for (const direction of ['across', 'down'] as ('across' | 'down')[]) {
    for (const [rowCol, [, answer]] of Object.entries(clueData[direction])) {
      const [row, col] = rowCol.split(',').map(x => parseInt(x, 10));
      const formattedAnswer = answer.toUpperCase().replace(/[^A-Z]/, '');
      for (let c = 0; c < formattedAnswer.length; c++) {
        const i = direction === 'across' ? row : row + c;
        const j = direction === 'across' ? col + c : col;
        if (!answers[i]) {
          answers[i] = [];
        }
        if (answers[i][j]) {
          assert(
            answers[i][j] === formattedAnswer[c],
            new ValidationError('Inconsistent Clues'),
          );
        }
        answers[i][j] = formattedAnswer[c];
        height = Math.max(height, i);
        width = Math.max(width, j);
      }
    }
  }
  for (let i = 0; i <= height; i++) {
    for (let j = 0; j <= width; j++) {
      answers[i][j] = answers[i][j] || '';
    }
  }

  return { clues, answers };
}
