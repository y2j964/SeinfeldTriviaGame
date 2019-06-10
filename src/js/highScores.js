import PubSub from 'pubsub-js';
import { scoreCount } from './score';

let userInitials;
const nameEntry = Array.from(document.querySelectorAll('.high-scores__name-entry'));
const highScoreEntry = Array.from(document.querySelectorAll('.high-scores__score-entry'));
export let highScoresRecords;
let newEntry;
let newEntryElement;
export let newEntryElementRank;
export let newEntryElementName;
export let newEntryElementScore;

const recordsAreInStorage = () => {
  if (localStorage.getItem('highScoresRecords') === null) {
    return false;
  }
  return true;
};

const initHighScoresRecords = () => {
  highScoresRecords = [
    { name: 'EB', score: 20 },
    { name: 'JCM', score: 25 },
    { name: 'JS', score: 14 },
    { name: 'GC', score: 17 },
    { name: 'EB', score: 8 },
    { name: 'LD', score: 10 },
    { name: 'KC', score: 13 },
    { name: 'GC', score: 6 },
    { name: 'KC', score: 3 },
    { name: 'JS', score: 4 },
  ];
  // ensure list is sorted in descending order;
  highScoresRecords.sort((a, b) => b.score - a.score);
};
const setInStorage = () => {
  localStorage.setItem('highScoresRecords', JSON.stringify(highScoresRecords));
};

const getFromStorage = () => {
  highScoresRecords = JSON.parse(localStorage.getItem('highScoresRecords'));
};

const getRecords = () => {
  if (!recordsAreInStorage()) {
    initHighScoresRecords();
    setInStorage();
  } else {
    getFromStorage();
  }
};

const loadToDOM = () => {
  highScoresRecords.forEach((entry, index) => {
    nameEntry[index].textContent = entry.name;
    highScoreEntry[index].textContent = entry.score;
  });
};

const updateHighScores = () => {
  // store in object to be consistent with default storage objects
  newEntry = { name: userInitials, score: scoreCount };
  highScoresRecords.push(newEntry);
  // find correct placement of newEntry in highScore table
  highScoresRecords.sort((a, b) => b.score - a.score);
  // remove lowest oldEntry from highScore table
  highScoresRecords.pop();
  localStorage.setItem('highScoresRecords', JSON.stringify(highScoresRecords));
};
const getNewEntryIndex = () => {
  // find index of newEntry so that we can highlight user's score
  const newEntryIndex = highScoresRecords.findIndex(
    entry => entry.name === newEntry.name && entry.score === newEntry.score,
  );
  return newEntryIndex;
};
const getNewEntryCells = () => {
  const newEntryIndex = getNewEntryIndex();
  newEntryElement = document.querySelector(`tbody tr:nth-of-type(${newEntryIndex + 1})`);
  newEntryElementRank = newEntryElement.querySelector('.high-scores__rank-entry');
  newEntryElementName = newEntryElement.querySelector('.high-scores__name-entry');
  newEntryElementScore = newEntryElement.querySelector('.high-scores__score-entry');
  return [newEntryElementRank, newEntryElementName, newEntryElementScore];
};

PubSub.subscribe('submit entry', () => {
  userInitials = document.querySelector('.user-initials-form__input').value;
  updateHighScores();
  loadToDOM();
  getNewEntryCells();
  newEntryElement.setAttribute('aria-label', 'Your performance immortalized');
});
PubSub.subscribe('end game', getRecords);
PubSub.subscribe('end game', loadToDOM);
