// needs module
const formPrompt = document.querySelector('.form-prompt');
const highScoresHeading = document.querySelector('.high-scores-heading');

// eventListeners
const userInitialsForm = document.querySelector('.user-initials-form');
const playAgainBtn = document.getElementById('play-again');

// too exposed
const userInitialsSuccess = document.querySelector('.user-initials-success');
let quotesFixed;
let quotesMutable;
const btnLifeline = document.querySelector('.lifeline');
let highScoresArray;

const highScoresTable = document.querySelector('.high-scores');
const startBtn = document.getElementById('startGame');
const mainStage = document.querySelector('.main-stage');
const score = document.getElementById('score-total');
let scoreCount;

let newEntry;
let newEntryElementRank;
let newEntryElementName;
let newEntryElementScore;

const highScores = (function highScoresScope() {
  let userInitials;
  const nameEntry = Array.from(document.querySelectorAll('.high-scores__name-entry'));
  const highScoreEntry = Array.from(document.querySelectorAll('.high-scores__score-entry'));

  const getHighScoresFromStorage = () => {
    if (localStorage.getItem('highScoresArray') === null) {
      highScoresArray = [
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
      // ensure list is sorted;
      highScoresArray.sort((a, b) => b.score - a.score);
      localStorage.setItem('highScoresArray', JSON.stringify(highScoresArray));
    } else {
      highScoresArray = JSON.parse(localStorage.getItem('highScoresArray'));
    }
  };
  const loadHighScores = () => {
    for (let i = 0; i < highScoresArray.length; i += 1) {
      // only log the top 10 highest scores
      if (i >= 10) {
        break;
      }
      // const text = document.createTextNode(highScoresArray[i].name);
      nameEntry[i].textContent = highScoresArray[i].name;
      highScoreEntry[i].textContent = highScoresArray[i].score;
    }
  };
  const updateHighScores = () => {
    userInitials = document.getElementById('user-initials-form__input').value;
    // store in object to be consistent with default storage objects
    newEntry = { name: userInitials, score: scoreCount };
    highScoresArray.push(newEntry);
    // find correct placement of newEntry in highScore table
    highScoresArray.sort((a, b) => b.score - a.score);
    // remove lowest oldEntry from highScore table
    highScoresArray.pop();
    localStorage.setItem('highScoresArray', JSON.stringify(highScoresArray));
    userInitialsForm.reset();
  };
  return {
    getFromStorage: getHighScoresFromStorage,
    load: loadHighScores,
    update: updateHighScores,
  };
}());

const createTdSpansForAnimation = function createTdSpansForAnimation() {
  // find index of newEntry so that we can highlight user's score
  const newEntryIndex = highScoresArray.findIndex(
    entry => entry.name === newEntry.name && entry.score === newEntry.score,
  );
  const newEntryElement = document.querySelector(`tbody tr:nth-of-type(${newEntryIndex + 1})`);
  newEntryElement.setAttribute('aria-label', 'Your performance immortalized');
  newEntryElementRank = newEntryElement.querySelector('.high-scores__rank-entry');
  newEntryElementName = newEntryElement.querySelector('.high-scores__name-entry');
  newEntryElementScore = newEntryElement.querySelector('.high-scores__score-entry');

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

const addTdSpansToDOM = function addTdSpansToDOM(tdRankSpans, tdNameSpans, tdScoreSpans) {
  // append spans in fragments to minimize repaints
  const rankFragment = document.createDocumentFragment();
  tdRankSpans.forEach(span => rankFragment.appendChild(span));
  newEntryElementRank.appendChild(rankFragment);

  const nameFragment = document.createDocumentFragment();
  tdNameSpans.forEach(span => nameFragment.appendChild(span));
  newEntryElementName.appendChild(nameFragment);

  const scoreFragment = document.createDocumentFragment();
  tdScoreSpans.forEach(span => scoreFragment.appendChild(span));
  newEntryElementScore.appendChild(scoreFragment);
};

const animateActiveTableRow = function animateActiveTableRowScope() {
  // set up with outer scope so that we only grab the outer variables once
  // it also allows us to init the piece counter
  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // grab all spans in the order in which we want to draw border animation
      // we want to draw the border from the top left to top right, top right to bottom right,
      // bottom right to bottom left, and bottom left to top right
      const tableRowBorderTop = Array.from(document.querySelectorAll('.table-row-border-top'));
      const tableRowBorderRight = document.querySelector('.table-row-border-right');
      const tableRowBorderBottom = Array.from(
        document.querySelectorAll('.table-row-border-bottom'),
      );
      const tableRowBorderLeft = document.querySelector('.table-row-border-left');

      const borderTransitionPieces = [
        ...tableRowBorderTop,
        tableRowBorderRight,
        ...tableRowBorderBottom.reverse(),
        tableRowBorderLeft,
      ];
      // init counter;
      let piece = 0;

      function drawBorder() {
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
      }
      resolve();
      // call drawBorder on execution on animateActiveTableRow
      drawBorder();
    }, 800);
  });
};

const scrollToHighScoresTable = function scrollToHighScoresTable() {
  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      highScoresHeading.focus();
      highScoresTable.scrollIntoView({ behavior: 'smooth' });
      resolve();
    }, 2000);
  });
};

// remove elements and reveal success message
const displayUserInitialSubmissionSuccessMessage = function displayUserInitialSubmissionSuccessMessage() {
  // this and the previous 2 functions return Promises to keep them decoupled:
  // they can be chained together if desired, or they can just be used by themselves
  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      userInitialsForm.classList.add('user-initials-form--is-hidden');
      // restore to non-collapsed default state
      userInitialsForm.classList.remove('user-initials-form--is-collapsing');
      // hidden form prompt text
      formPrompt.classList.add('hidden');
      // display successful submission text
      userInitialsSuccess.classList.remove('hidden');
      resolve();
    }, 800);
  });
};

// transition messages

const submitInitials = function submitInitials(e) {
  e.preventDefault();
  // update new entry into highScores array
  highScores.update();
  // load new entry into table
  highScores.load();
  // grab return arrays created by createTdSpansForAnimation
  const [tdRankSpans, tdNameSpans, tdScoreSpans] = createTdSpansForAnimation();
  addTdSpansToDOM(tdRankSpans, tdNameSpans, tdScoreSpans);
  // collapse form upon valid submission
  userInitialsForm.classList.add('user-initials-form--is-collapsing');
  // after collapse transition is over . . .
  displayUserInitialSubmissionSuccessMessage()
    .then(() => scrollToHighScoresTable())
    .then(() => animateActiveTableRow());
};

const randomNum = function randomNum(max) {
  return Math.floor(Math.random() * Math.floor(max));
};

const srCorrectAnnouncement = document.getElementById('sr-correct-announcement');

const card = (function cardScope() {
  const questionText = document.querySelector('.question__text');
  const questionHeading = document.querySelector('.question__heading');
  const answerButtons = Array.from(document.querySelectorAll('.btn-pointed'));
  let correctAnswer;
  let selectedBtn;
  let correctBtn;
  let flashCount = 0;

  const loadCard = () => {
    // mainStage.classList.remove('fading');
    const randomIndex = randomNum(quotesMutable.length);
    const quoteObj = quotesMutable[randomIndex];
    const { quote } = quoteObj;
    correctAnswer = quoteObj.author;
    console.log(`init correct: ${correctAnswer}`);
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
    answerButtons.forEach((answerBtn) => {
      answerBtn.classList.remove('btn-pointed--is-disabled');
      answerBtn.removeAttribute('disabled');
      answerBtn.removeAttribute('aria-disabled', 'true');
    });
    srCorrectAnnouncement.textContent = '';
    loadCard();
  };
  const checkCorrectAnswer = () => {
    if (selectedBtn === correctBtn) {
      srCorrectAnnouncement.textContent = 'Correct!';
      scoreCount += 1;
      score.textContent = scoreCount;
      setTimeout(card.reset, 2000);
    }
    if (selectedBtn !== correctBtn) {
      setTimeout(() => {
        card.reset();
        game.end();
      }, 2000);
    }
  };

  const toggleCorrectBtn = (e) => {
    // check if this is first run by checking if their is an associated event
    if (e) {
      flashCount = 0;
      selectedBtn = e.target;
      selectedBtn.classList.add('btn-pointed--is-selected');
    }
    flashCount += 1;
    if (flashCount < 6) {
      correctBtn.classList.toggle('btn-pointed--is-correct');
      // flash the --is-correct styles
      setTimeout(toggleCorrectBtn, 200);
    }
    if (flashCount === 6) {
      checkCorrectAnswer();
    }
  };

  const processAnswerClick = (e) => {
    if (!e.target.classList.contains('btn-pointed')) {
      return;
    }
    toggleCorrectBtn(e);
  };

  const removeTwoFalseAnswers = (e) => {
    if (!e.target.classList.contains('lifeline')) {
      return;
    }
    const correctBtnIndex = answerButtons.indexOf(correctBtn);
    answerButtons.splice(correctBtnIndex, 1);
    shuffle(answerButtons);
    // we removed 1 potential answer (the correct one) from this array
    // so we'll add 1 to the length to get a true 50:50 value;
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

  return {
    load: loadCard,
    reset: resetCard,
    processAnswerClick,
    toggleCorrectBtn,
    checkCorrectAnswer,
    removeTwoFalseAnswers,
  };
}());

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
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

const game = (function gameScope() {
  const introStage = document.querySelector('.intro-stage');
  const endStage = document.querySelector('.end-stage');
  const footerSmallPrint = document.querySelector('.footer-small-print');
  const endScore = document.getElementById('end-score');
  const scoreCheckEl = document.querySelector('.score-check');

  const runGame = () => {
    introStage.classList.add('hidden');
    // isPlaying = true;
    scoreCount = 0;
    // quotesMutable represents a copy of the original that we can remove quotes from as we
    // progress in the game. Quotes fixed should not )be altered
    quotesMutable = [...quotesFixed];
    mainStage.classList.remove('hidden');
    footerSmallPrint.classList.remove('hidden');
    score.textContent = scoreCount;
    card.load();
  };

  const resetGame = () => {
    // reset score
    scoreCount = 0;
    // remove all trSpan children of respective elements
    if (newEntryElementName) {
      while (newEntryElementRank.firstElementChild) {
        newEntryElementRank.removeChild(newEntryElementRank.firstElementChild);
      }
      while (newEntryElementName.firstElementChild) {
        newEntryElementName.removeChild(newEntryElementName.firstElementChild);
      }
      while (newEntryElementScore.firstElementChild) {
        newEntryElementScore.removeChild(newEntryElementScore.firstElementChild);
      }
      // go parent node (the row) and . . .
      newEntryElementScore.parentNode.removeAttribute('aria-label');
    }
    btnLifeline.classList.remove('lifeline--is-disabled');
    btnLifeline.removeAttribute('disabled');
    btnLifeline.removeAttribute('aria-disabled');
    userInitialsSuccess.classList.add('hidden');
    endStage.classList.add('hidden');
    footerSmallPrint.classList.add('hidden');
    runGame();
  };

  const endGame = () => {
    highScores.getFromStorage();
    highScores.load();
    mainStage.classList.add('hidden');
    endStage.classList.remove('hidden');
    endScore.textContent = scoreCount;
    // just compare score count to lowest high score
    highScores.getFromStorage();

    if (scoreCount < highScoresArray[highScoresArray.length - 1].score) {
      return;
    }
    scoreCheckEl.classList.remove('hidden');
    userInitialsForm.classList.remove('user-initials-form--is-hidden');
    highScores.load();
  };

  return {
    run: runGame,
    reset: resetGame,
    end: endGame,
  };
}());

playAgainBtn.addEventListener('click', game.reset);

userInitialsForm.addEventListener('submit', submitInitials);

const getQuotesFromServer = function getQuotesFromServer(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = () => resolve(JSON.parse(xhr.responseText));
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send();
  });
};

// run immediately so we have the quotes array to work with
getQuotesFromServer('https://seinfeld-quotes.herokuapp.com/quotes').then((data) => {
  // there are a few quotes in this array that aren't said by Jerry, George, Elaine, or Kramer;
  // We're not interested in those quotes, so we'll filter them out
  // we'll also filter out uber-long quotes so that it doesn't resize
  // our questions container in an extreme way
  quotesFixed = data.quotes.filter(
    quote => (quote.author === 'Jerry' && quote.quote.length < 300)
      || (quote.author === 'George' && quote.quote.length < 300)
      || (quote.author === 'Elaine' && quote.quote.length < 300)
      || (quote.author === 'Kramer' && quote.quote.length < 300),
  );
});

startBtn.addEventListener('click', game.run);
mainStage.addEventListener('click', card.processAnswerClick);
mainStage.addEventListener('click', card.removeTwoFalseAnswers);
