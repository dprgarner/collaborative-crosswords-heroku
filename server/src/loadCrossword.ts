import assert from 'assert';
import { difference, range, every } from 'lodash';
import { safeLoad } from 'js-yaml';
import { CluesData } from './shared/types';

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
  constructor(...messages: string[]) {
    super(messages.join('\n'));
    this.name = 'ValidationError';
  }
}

function loadYamlClueData(yamlStr: string): YamlClueData {
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
  return clueData;
}

function getAnswers(clueData: YamlClueData) {
  let width = -1;
  let height = -1;
  const answers: string[][] = [];
  for (const direction of ['across', 'down'] as ('across' | 'down')[]) {
    for (const [rowCol, [, answer]] of Object.entries(clueData[direction])) {
      const [row, col] = rowCol.split(',').map(x => parseInt(x, 10));
      const formattedAnswer = answer.toUpperCase().replace(/[^A-Z]/g, '');

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
  return answers;
}

export function getClueStartSquares(
  answers: string[][],
): { across: boolean[][]; down: boolean[][] } {
  const [width, height] = [answers[0].length, answers.length];
  const clueStartSquares = {
    across: range(height).map(() => range(width).map(() => false)),
    down: range(height).map(() => range(width).map(() => false)),
  };
  for (let i = 0; i < height; i += 1) {
    for (let j = 0; j < width; j += 1) {
      if (
        i !== height - 1 &&
        answers[i][j] &&
        answers[i + 1][j] &&
        (i === 0 || (i !== 0 && !answers[i - 1][j]))
      ) {
        clueStartSquares.down[i][j] = true;
      }
      if (
        j !== width - 1 &&
        answers[i][j] &&
        answers[i][j + 1] &&
        (j === 0 || (j !== 0 && !answers[i][j - 1]))
      ) {
        clueStartSquares.across[i][j] = true;
      }
    }
  }
  return clueStartSquares;
}

export function getClueNumbers(startSquares: {
  across: boolean[][];
  down: boolean[][];
}) {
  const clueNumbers = { across: {}, down: {} } as {
    across: { [rowCol: string]: number };
    down: { [rowCol: string]: number };
  };
  const [width, height] = [
    startSquares.across[0].length,
    startSquares.across.length,
  ];
  let currentClue = 1;
  for (let i = 0; i < height; i += 1) {
    for (let j = 0; j < width; j += 1) {
      if (startSquares.across[i][j] || startSquares.down[i][j]) {
        if (startSquares.across[i][j]) {
          clueNumbers.across[`${i},${j}`] = currentClue;
        }
        if (startSquares.down[i][j]) {
          clueNumbers.down[`${i},${j}`] = currentClue;
        }
        currentClue += 1;
      }
    }
  }
  return clueNumbers;
}

export default function loadCrossword(yamlStr: string) {
  const yamlClueData = loadYamlClueData(yamlStr);
  const answers = getAnswers(yamlClueData);

  const [width, height] = [answers[0].length, answers.length];
  const clues = {
    width,
    height,
    across: { order: [], byNumber: {} },
    down: { order: [], byNumber: {} },
  } as CluesData;

  const clueNumbers = getClueNumbers(getClueStartSquares(answers));
  for (const direction of ['across', 'down'] as ('across' | 'down')[]) {
    assert(
      !difference(
        Object.keys(clueNumbers[direction]),
        Object.keys(yamlClueData[direction]),
      ).length,
      new ValidationError(
        'Missing Clues',
        direction,
        Object.keys(clueNumbers[direction]).join(' '),
        Object.keys(yamlClueData[direction]).join(' '),
      ),
    );
    for (const [rowCol, clueNumber] of Object.entries(clueNumbers[direction])) {
      const [row, col] = rowCol.split(',').map(x => parseInt(x, 10));
      const [clue, answer] = yamlClueData[direction][rowCol];
      clues[direction].order.push(clueNumber);
      clues[direction].byNumber[clueNumber] = {
        clue,
        size: answer.replace(/[^A-Za-z]/g, '').length,
        row,
        col,
        wordArrangement: toWordArrangement(answer),
      };
    }
  }

  return { clues, answers };
}
