import PubSub from 'pubsub-js';
import sleep from './sleep';
import addFragmentsToDOM from './addFragmentsToDOM';
import removeAllChildEls from './removeAllChildEls';
import { newEntryElementName, newEntryElementRank, newEntryElementScore } from './highScores';
import { userInitialsForm } from './game';

const formPrompt = document.querySelector('.form-prompt');
const userInitialsSuccess = document.querySelector('.user-initials-success');
const highScoresHeading = document.querySelector('.high-scores-heading');
const highScoresTable = document.querySelector('.high-scores');
let borderTransitionPieces;
let piece = 0;

const createTdSpans = () => {
  // animation is built out of spans, bc you can't set tr to position relative
  // you can however set td to relative
  const tdRankSpans = [];
  const tdSpan1 = document.createElement('span');
  tdSpan1.className = 'table-row-border table-row-border-top';
  const tdSpan2 = document.createElement('span');
  tdSpan2.className = 'table-row-border table-row-border-bottom';
  const tdSpan3 = document.createElement('span');
  tdSpan3.className = 'table-row-border table-row-border-left';
  tdRankSpans.push(tdSpan1, tdSpan2, tdSpan3);

  const tdNameSpans = [];
  const tdSpan4 = document.createElement('span');
  tdSpan4.className = 'table-row-border table-row-border-top';
  const tdSpan5 = document.createElement('span');
  tdSpan5.className = 'table-row-border table-row-border-bottom';
  tdNameSpans.push(tdSpan4, tdSpan5);

  const tdScoreSpans = [];
  const tdSpan6 = document.createElement('span');
  tdSpan6.classList = 'table-row-border table-row-border-top';
  const tdSpan7 = document.createElement('span');
  tdSpan7.className = 'table-row-border table-row-border-right';
  const tdSpan8 = document.createElement('span');
  tdSpan8.className = 'table-row-border table-row-border-bottom';
  tdScoreSpans.push(tdSpan6, tdSpan7, tdSpan8);

  return [tdRankSpans, tdNameSpans, tdScoreSpans];
};

const resetTdSpans = () => {
  // if cracked top ten scores, remove pieces of row highlight animation
  if (newEntryElementName) {
    removeAllChildEls(newEntryElementRank);
    removeAllChildEls(newEntryElementName);
    removeAllChildEls(newEntryElementScore);
    // go parent node (the row) and . . .
    newEntryElementScore.parentNode.removeAttribute('aria-label');
  }
};

const hideUserInitialsForm = () => {
  userInitialsForm.classList.add('user-initials-form--is-hidden');
  // restore to non-collapsed default state
  userInitialsForm.classList.remove('user-initials-form--is-collapsing');
  // hidden form prompt text
  formPrompt.classList.add('hidden');
};

const displayMessage = () => {
  userInitialsSuccess.classList.remove('hidden');
};
const scrollToHighScoresTable = () => {
  highScoresHeading.focus();
  highScoresTable.scrollIntoView({ behavior: 'smooth' });
};
const getTrBorderPieces = () => {
  // grab all spans in the order in which we want to draw border animation
  // we want to draw the border from the top left to top right, top right to bottom right,
  // bottom right to bottom left, and bottom left to top right
  const tableRowBorderTop = Array.from(document.querySelectorAll('.table-row-border-top'));
  const tableRowBorderRight = document.querySelector('.table-row-border-right');
  const tableRowBorderBottom = Array.from(document.querySelectorAll('.table-row-border-bottom'));
  const tableRowBorderLeft = document.querySelector('.table-row-border-left');

  borderTransitionPieces = [
    ...tableRowBorderTop,
    tableRowBorderRight,
    ...tableRowBorderBottom.reverse(),
    tableRowBorderLeft,
  ];
  // don't return borderTransitionPieces b/c drawBorder uses a recursive loop
  // and the passed-in borderTransitionPieces will be lost after the first loop
};
const drawBorder = () => {
  if (piece >= borderTransitionPieces.length) {
    return;
  }
  if (borderTransitionPieces[piece].classList.contains('table-row-border-top')) {
    borderTransitionPieces[piece].classList.add('table-row-border-top--is-drawing');
  }
  if (borderTransitionPieces[piece].classList.contains('table-row-border-right')) {
    borderTransitionPieces[piece].classList.add('table-row-border-right--is-drawing');
  }
  if (borderTransitionPieces[piece].classList.contains('table-row-border-bottom')) {
    borderTransitionPieces[piece].classList.add('table-row-border-bottom--is-drawing');
  }
  if (borderTransitionPieces[piece].classList.contains('table-row-border-left')) {
    borderTransitionPieces[piece].classList.add('table-row-border-left--is-drawing');
  }
  piece += 1;
  // delay time needs to be identical to the transition-duration time for
  // table-row-border-top, table-row-border-right, table-row-border-bottom,
  // and table-row-border-left
  setTimeout(drawBorder, 350);
};

// eslint-disable-next-line import/prefer-default-export
export const submitEntry = (e) => {
  e.preventDefault();
  // get data from highScores before doing animation
  PubSub.publishSync('submit entry');
  const [tdRankSpans, tdNameSpans, tdScoreSpans] = createTdSpans();
  addFragmentsToDOM(tdRankSpans, newEntryElementRank);
  addFragmentsToDOM(tdNameSpans, newEntryElementName);
  addFragmentsToDOM(tdScoreSpans, newEntryElementScore);
  userInitialsForm.classList.add('user-initials-form--is-collapsing');
  // perform series of animations with delays in between actions
  sleep(800)
    .then(() => hideUserInitialsForm())
    .then(() => displayMessage())
    .then(() => sleep(2000))
    .then(() => scrollToHighScoresTable())
    .then(() => sleep(800))
    .then(() => getTrBorderPieces())
    .then(() => drawBorder());
};

PubSub.subscribe('submit game', () => userInitialsSuccess.classList.add('hidden'));
PubSub.subscribe('reset game', () => userInitialsSuccess.classList.add('hidden'));
PubSub.subscribe('reset game', resetTdSpans);
