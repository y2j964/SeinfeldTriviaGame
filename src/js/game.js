import PubSub from 'pubsub-js';
import { scoreCount } from './score';
import { highScoresRecords } from './highScores';

const introStage = document.querySelector('.intro-stage');
export const mainStage = document.querySelector('.main-stage');
const endStage = document.querySelector('.end-stage');
const footerSmallPrint = document.querySelector('.footer-small-print');
const endScore = document.getElementById('end-score');
const scoreCheckEl = document.querySelector('.score-check');
export const userInitialsForm = document.querySelector('.user-initials-form');
const gameOverText = document.querySelector('.game-over-text');

// eslint-disable-next-line import/no-mutable-exports
export let quotesMutable;

export const runGame = (quotesFixed) => {
  // quotesMutable represents a copy of the original that we can remove quotes from as we
  // progress in the game. Quotes fixed should not be altered
  quotesMutable = [...quotesFixed];
  introStage.classList.add('hidden');
  mainStage.classList.remove('hidden');
  footerSmallPrint.classList.remove('hidden');
  PubSub.publish('run game');
  // loadCard();
};

export const resetGame = (quotesFixed) => {
  // remove all trSpan children of respective elements
  PubSub.publish('reset game');
  // resetTdSpans, resetScore, and restoreLifeline
  endStage.classList.add('hidden');
  footerSmallPrint.classList.add('hidden');
  runGame(quotesFixed);
};

const endGame = () => {
  mainStage.classList.add('hidden');
  endStage.classList.remove('hidden');
  gameOverText.focus();
  endScore.textContent = scoreCount;
  PubSub.publishSync('end game');
  userInitialsForm.reset();
  // just compare score count to lowest high score
  if (scoreCount <= highScoresRecords[highScoresRecords.length - 1].score) {
    return;
  }
  // display form and form prompt
  scoreCheckEl.classList.remove('hidden');
  userInitialsForm.classList.remove('user-initials-form--is-hidden');
};

PubSub.subscribe('wrong answer', endGame);
