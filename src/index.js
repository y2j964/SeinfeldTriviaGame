import './styles/main.scss';

import { getRelevantSeinfeldQuotes } from './js/getDataFromServer';
import {
  runGame, resetGame, userInitialsForm, mainStage,
} from './js/game';
import { checkAnswer, removeTwoFalseAnswers } from './js/card';
import { submitEntry } from './js/entrySubmissionSuccess';

// eventListeners
const playAgainBtn = document.getElementById('play-again');
const startBtn = document.getElementById('startGame');

getRelevantSeinfeldQuotes().then((data) => {
  const quotesFixed = data;
  startBtn.addEventListener('click', () => runGame(quotesFixed));
  mainStage.addEventListener('click', checkAnswer);
  mainStage.addEventListener('click', removeTwoFalseAnswers);
  playAgainBtn.addEventListener('click', () => resetGame(quotesFixed));
  userInitialsForm.addEventListener('submit', submitEntry);
});
