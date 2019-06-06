// eventListeners
const userInitialsForm = document.querySelector('.user-initials-form');
const playAgainBtn = document.getElementById('play-again');
const startBtn = document.getElementById('startGame');
const mainStage = document.querySelector('.main-stage');

// globals
let quotesFixed;
let quotesMutable;
let highScoresRecords;
const score = document.getElementById('score-total');
let scoreCount;

// pub sub
const userInitialsSuccess = document.querySelector('.user-initials-success');
const btnLifeline = document.querySelector('.lifeline');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const randomNum = function randomNum(max) {
  return Math.floor(Math.random() * Math.floor(max));
};

// Randomly shuffle an array
// https://stackoverflow.com/a/2450976/1293256
// @param  {Array} array The array to shuffle
// @return {String}      The first item in the shuffled array
const shuffle = function shuffle(array) {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    // eslint-disable-next-line no-param-reassign
    array[currentIndex] = array[randomIndex];
    // eslint-disable-next-line no-param-reassign
    array[randomIndex] = temporaryValue;
  }
  return array;
};

const createTdSpansForAnimation = function createTdSpansForAnimation() {
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

const addFragmentsToDOM = function addFragmentsToDOM(fragmentParts, fragmentDestination) {
  const fragment = document.createDocumentFragment();
  fragmentParts.forEach(fragmentPart => fragment.appendChild(fragmentPart));
  fragmentDestination.appendChild(fragment);
};

const removeAllChildEls = function removeAllChildEls(parentEl) {
  while (parentEl.firstElementChild) {
    parentEl.removeChild(parentEl.firstElementChild);
  }
};

const entrySubmissionSuccess = (function entrySubmissionSuccessScope() {
  const formPrompt = document.querySelector('.form-prompt');
  const highScoresHeading = document.querySelector('.high-scores-heading');
  const highScoresTable = document.querySelector('.high-scores');
  let borderTransitionPieces;
  let piece = 0;

  const displayMessage = () => {
    userInitialsForm.classList.add('user-initials-form--is-hidden');
    // restore to non-collapsed default state
    userInitialsForm.classList.remove('user-initials-form--is-collapsing');
    // hidden form prompt text
    formPrompt.classList.add('hidden');
    // display successful submission text
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

  return {
    displayMessage,
    scrollToHighScoresTable,
    getTrBorderPieces,
    drawBorder,
  };
}());

const highScores = (function highScoresScope() {
  let userInitials;
  const nameEntry = Array.from(document.querySelectorAll('.high-scores__name-entry'));
  const highScoreEntry = Array.from(document.querySelectorAll('.high-scores__score-entry'));
  let newEntry;
  let newEntryElement;
  let newEntryElementRank;
  let newEntryElementName;
  let newEntryElementScore;

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

  const loadHighScoresToDOM = () => {
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
    userInitialsForm.reset();
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
  const resetTdSpans = () => {
    if (newEntryElementName) {
      removeAllChildEls(newEntryElementRank);
      removeAllChildEls(newEntryElementName);
      removeAllChildEls(newEntryElementScore);
      // go parent node (the row) and . . .
      newEntryElementScore.parentNode.removeAttribute('aria-label');
    }
  };
  const submitEntry = (e) => {
    e.preventDefault();
    userInitials = document.querySelector('.user-initials-form__input').value;
    updateHighScores();
    loadHighScoresToDOM();
    getNewEntryCells();
    newEntryElement.setAttribute('aria-label', 'Your performance immortalized');
    // grab return arrays created by createTdSpansForAnimation
    const [tdRankSpans, tdNameSpans, tdScoreSpans] = createTdSpansForAnimation();
    addFragmentsToDOM(tdRankSpans, newEntryElementRank);
    addFragmentsToDOM(tdNameSpans, newEntryElementName);
    addFragmentsToDOM(tdScoreSpans, newEntryElementScore);
    // collapse form upon valid submission
    userInitialsForm.classList.add('user-initials-form--is-collapsing');
    // perform series of animations with delays in between actions
    // pub sub
    sleep(800)
      .then(() => entrySubmissionSuccess.displayMessage())
      .then(() => sleep(2000))
      .then(() => entrySubmissionSuccess.scrollToHighScoresTable())
      .then(() => sleep(800))
      .then(() => entrySubmissionSuccess.getTrBorderPieces())
      .then(() => entrySubmissionSuccess.drawBorder());
  };
  return {
    getRecords,
    loadToDOM: loadHighScoresToDOM,
    submitEntry,
    resetTdSpans,
  };
}());

const card = (function cardScope() {
  const srCorrectAnnouncement = document.getElementById('sr-correct-announcement');
  const questionText = document.querySelector('.question__text');
  const questionHeading = document.querySelector('.question__heading');
  const answerButtons = Array.from(document.querySelectorAll('.btn-pointed'));
  let correctAnswer;
  let selectedBtn;
  let correctBtn;
  let flashCount = 0;

  const loadCard = () => {
    const randomIndex = randomNum(quotesMutable.length);
    const quoteObj = quotesMutable[randomIndex];
    const { quote } = quoteObj;
    correctAnswer = quoteObj.author;
    console.log(`correct: ${correctAnswer}`);
    // btns have an id of their textContent, so you can find corresponding btn like so
    correctBtn = mainStage.querySelector(`#${correctAnswer.toLowerCase()}`);
    // update random quote to html
    questionText.textContent = `"${quote}"`;
    // focus for screen reader
    questionHeading.focus();
    // remove random quote from quotesMutable array
    quotesMutable.splice(randomIndex, 1);
  };

  const resetCard = () => {
    correctBtn.classList.remove('btn-pointed--is-correct');
    selectedBtn.classList.remove('btn-pointed--is-selected');
    // pubsub
    answerButtons.forEach((answerBtn) => {
      answerBtn.classList.remove('btn-pointed--is-disabled');
      answerBtn.removeAttribute('disabled');
      answerBtn.removeAttribute('aria-disabled', 'true');
    });
    flashCount = 0;
    srCorrectAnnouncement.textContent = '';
  };

  const incrementScore = () => {
    scoreCount += 1;
    score.textContent = scoreCount;
  };

  const userGuessedRight = () => {
    if (selectedBtn === correctBtn) {
      return true;
    }
    return false;
  };

  const selectUserGuess = (e) => {
    selectedBtn = e.target;
    selectedBtn.classList.add('btn-pointed--is-selected');
  };

  const toggleCorrectBtn = () => new Promise((resolve) => {
    flashCount += 1;
    if (flashCount < 6) {
      correctBtn.classList.toggle('btn-pointed--is-correct');
        // flash the --is-correct styles
      setTimeout(() => {
        toggleCorrectBtn();
        resolve();
      }, 200);
    }
    if (flashCount === 6) {
      resolve();
    }
  });

  const removeTwoFalseAnswers = (e) => {
    if (!e.target.classList.contains('lifeline')) {
      return;
    }
    const correctBtnIndex = answerButtons.indexOf(correctBtn);
    // remove the correct answer from this array
    answerButtons.splice(correctBtnIndex, 1);
    shuffle(answerButtons);
    // add 1 to answerButtons.length to get a true 50:50 value
    // this accounts for the right answer being removed;
    for (let i = 0; i < (answerButtons.length + 1) / 2; i += 1) {
      answerButtons[i].classList.add('btn-pointed--is-disabled');
      answerButtons[i].setAttribute('disabled', 'true');
      answerButtons[i].setAttribute('aria-disabled', 'true');
    }
    btnLifeline.classList.add('lifeline--is-disabled');
    btnLifeline.setAttribute('disabled', 'true');
    btnLifeline.setAttribute('aria-disabled', 'true');
    // const falseAnswers = answerBtns - correctAnswer
  };

  const checkAnswer = (e) => {
    if (!e.target.classList.contains('btn-pointed')) {
      return;
    }
    selectUserGuess(e);
    toggleCorrectBtn().then(() => {
      if (userGuessedRight()) {
        incrementScore();
        srCorrectAnnouncement.textContent = 'Correct!';
        sleep(2000).then(() => {
          resetCard();
          loadCard();
        });
      } else {
        sleep(2000).then(() => {
          resetCard();
          // pubsub
          game.end();
        });
      }
    });
  };

  return {
    load: loadCard,
    checkAnswer,
    removeTwoFalseAnswers,
  };
}());

const game = (function gameScope() {
  const introStage = document.querySelector('.intro-stage');
  const endStage = document.querySelector('.end-stage');
  const footerSmallPrint = document.querySelector('.footer-small-print');
  const endScore = document.getElementById('end-score');
  const scoreCheckEl = document.querySelector('.score-check');
  const gameOverText = document.querySelector('.game-over-text');

  const runGame = () => {
    // quotesMutable represents a copy of the original that we can remove quotes from as we
    // progress in the game. Quotes fixed should not )be altered
    quotesMutable = [...quotesFixed];
    introStage.classList.add('hidden');
    mainStage.classList.remove('hidden');
    footerSmallPrint.classList.remove('hidden');
    scoreCount = 8;
    score.textContent = scoreCount;
    card.load();
  };

  const resetGame = () => {
    // remove all trSpan children of respective elements
    highScores.resetTdSpans();
    btnLifeline.classList.remove('lifeline--is-disabled');
    btnLifeline.removeAttribute('disabled');
    btnLifeline.removeAttribute('aria-disabled');
    userInitialsSuccess.classList.add('hidden');
    endStage.classList.add('hidden');
    footerSmallPrint.classList.add('hidden');
    // reset score
    scoreCount = 0;
    runGame();
  };

  const endGame = () => {
    mainStage.classList.add('hidden');
    endStage.classList.remove('hidden');
    gameOverText.focus();
    endScore.textContent = scoreCount;
    // just compare score count to lowest high score
    highScores.getRecords();
    highScores.loadToDOM();

    if (scoreCount <= highScoresRecords[highScoresRecords.length - 1].score) {
      return;
    }
    scoreCheckEl.classList.remove('hidden');
    userInitialsForm.classList.remove('user-initials-form--is-hidden');
  };

  return {
    run: runGame,
    reset: resetGame,
    end: endGame,
  };
}());

// eslint-disable-next-line func-names
(function () {
  const getQuotesFromServer = function getQuotesFromServer(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = () => resolve(JSON.parse(xhr.responseText));
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send();
    });
  };

  const filterQuotes = (data) => {
    // there are a few quotes in this array that aren't said by Jerry, George, Elaine, or Kramer;
    // We're not interested in those quotes, so we'll filter them out
    const relevantCharacters = ['Jerry', 'George', 'Elaine', 'Kramer'];
    // we'll also filter out uber-long quotes so that it doesn't resize
    // our questions container in an extreme way
    const maxQuoteLength = 300;
    quotesFixed = data.quotes.filter(
      quote => relevantCharacters.includes(quote.author) && quote.quote.length < maxQuoteLength,
    );
  };

  // run immediately so we have the quotes array to work with
  getQuotesFromServer('https://seinfeld-quotes.herokuapp.com/quotes').then(filterQuotes);
}());

startBtn.addEventListener('click', game.run);
mainStage.addEventListener('click', card.checkAnswer);
mainStage.addEventListener('click', card.removeTwoFalseAnswers);
playAgainBtn.addEventListener('click', game.reset);
userInitialsForm.addEventListener('submit', highScores.submitEntry);
