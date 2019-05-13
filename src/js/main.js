let isPlaying = false;
const startBtn = document.getElementById('startGame');
const introStage = document.querySelector('.intro-stage');
const questionText = document.querySelector('.question__text');
// const [btnA, btnB, btnC, btnD] = document.querySelectorAll('.btn-special');
const mainStage = document.querySelector('.main-stage');
const endStage = document.querySelector('.end-stage');
const formPrompt = document.querySelector('.form-prompt');
const scoreCheckEl = document.querySelector('.score-check');
const highScoresTable = document.querySelector('.high-scores');
const highScoresHeading = document.querySelector('.high-scores-heading');
const nameEntry = Array.from(document.querySelectorAll('.high-scores__name-entry'));
const highScoreEntry = Array.from(document.querySelectorAll('.high-scores__score-entry'));
const score = document.getElementById('score-total');
let userInitials = document.getElementById('user-initials');
const userInitialsForm = document.querySelector('.user-initials-form');
const userInitialsSuccess = document.querySelector('.user-initials-success');
const endScore = document.getElementById('end-score');
const playAgainBtn = document.getElementById('play-again');

let borderTransitionPieces;
let quotes;
let correctAnswer;
let selectedBtn;
let correctBtn;
let flashCount = 0;
let scoreCount;
let highScoresArray;

let newEntry;

const highScores = (function highScoresScope() {
  // let newEntry;
  function getHighScoresFromStorage() {
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
  }
  function loadHighScores() {
    for (let i = 0; i < highScoresArray.length; i += 1) {
      // only log the top 10 highest scores
      if (i >= 10) {
        break;
      }
      // const text = document.createTextNode(highScoresArray[i].name);
      nameEntry[i].textContent = highScoresArray[i].name;
      highScoreEntry[i].textContent = highScoresArray[i].score;
    }
  }
  function updateHighScores() {
    scoreCount = 10;
    userInitials = userInitials.value;
    // store in object to be consistent with default storage objects
    newEntry = { name: userInitials, score: scoreCount };
    highScoresArray.push(newEntry);
    // find correct placement of newEntry in highScore table
    highScoresArray.sort((a, b) => b.score - a.score);
    // remove lowest oldEntry from highScore table
    highScoresArray.pop();
  }
  return {
    getFromStorage: getHighScoresFromStorage,
    load: loadHighScores,
    update: updateHighScores,
  };
}());

highScores.getFromStorage();

function submitInitials(e) {
  e.preventDefault();
  // update new entry into highScores array
  highScores.update();
  // load new entry into table
  highScores.load();
  // find index of newEntry so that we can highlight user's score
  const newEntryIndex = highScoresArray.findIndex(
    entry => entry.name === newEntry.name && entry.score === newEntry.score,
  );
  const newEntryElement = document.querySelector(`tbody tr:nth-of-type(${newEntryIndex + 1})`);
  const newEntryElementRank = newEntryElement.querySelector('.high-scores__rank-entry');
  const newEntryElementName = newEntryElement.querySelector('.high-scores__name-entry');
  const newEntryElementScore = newEntryElement.querySelector('.high-scores__score-entry');

  // animation is built out of spans, bc you can't set tr to position relative
  // you can however set td to relative
  const trRankSpans = [];
  const trSpan1 = document.createElement('span');
  trSpan1.className = 'table-row-border table-row-border-top';
  const trSpan2 = document.createElement('span');
  trSpan2.className = 'table-row-border table-row-border-bottom';
  const trSpan3 = document.createElement('span');
  trSpan3.className = 'table-row-border table-row-border-left';
  trRankSpans.push(trSpan1, trSpan2, trSpan3);

  const trNameSpans = [];
  const trSpan4 = document.createElement('span');
  trSpan4.className = 'table-row-border table-row-border-top';
  const trSpan5 = document.createElement('span');
  trSpan5.className = 'table-row-border table-row-border-bottom';
  trNameSpans.push(trSpan4, trSpan5);

  const trScoreSpans = [];
  const trSpan6 = document.createElement('span');
  trSpan6.classList = 'table-row-border table-row-border-top';
  const trSpan7 = document.createElement('span');
  trSpan7.className = 'table-row-border table-row-border-right';
  const trSpan8 = document.createElement('span');
  trSpan8.className = 'table-row-border table-row-border-bottom';
  trScoreSpans.push(trSpan6, trSpan7, trSpan8);

  // append spans in fragments to minimize repaints
  const rankFragment = document.createDocumentFragment();
  trRankSpans.forEach(span => rankFragment.appendChild(span));
  newEntryElementRank.appendChild(rankFragment);

  const nameFragment = document.createDocumentFragment();
  trNameSpans.forEach(span => nameFragment.appendChild(span));
  newEntryElementName.appendChild(nameFragment);

  const scoreFragment = document.createDocumentFragment();
  trScoreSpans.forEach(span => scoreFragment.appendChild(span));
  newEntryElementScore.appendChild(scoreFragment);

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

  userInitialsForm.classList.add('user-initials-form--is-collapsing');
  // after transition is over . . .
  setTimeout(() => {
    // function hideCollapsedEl (el) {}
    userInitialsForm.classList.add('user-initials-form--is-hidden');
    // restore to non-collapsed default state
    userInitialsForm.classList.remove('user-initials-form--is-collapsing');
    // hidden form prompt text
    formPrompt.classList.add('hidden');
    // display successful submission text
    userInitialsSuccess.classList.remove('hidden');
    setTimeout(() => {
      highScoresHeading.focus();
      highScoresTable.scrollIntoView({ behavior: 'smooth' });
      setTimeout(drawBorder, 800);
    }, 2000);
  }, 800);
}
// InitialSubmissionSuccessUI
// (1)remove elements and display success, (2)scrollToHighScoresTable, (3)drawBorder

function scrollToHighScoresTable() {
  highScoresHeading.focus();
  highScoresTable.scrollIntoView({ behavior: 'smooth' });
}

function resetGame() {
  userInitialsSuccess.classList.remove('hidden');
  // remove all trSpan children of respective elements
  while (newEntryElementRank.firstElementChild) {
    newEntryElementRank.removeChild(newEntryElementRank.firstElementChild);
  }
  while (newEntryElementName.firstElementChild) {
    newEntryElementName.removeChild(newEntryElementName.firstElementChild);
  }
  while (newEntryElementScore.firstElementChild) {
    newEntryElementScore.removeChild(newEntryElementScore.firstElementChild);
  }
}
playAgainBtn.addEventListener('click', resetGame);

userInitialsForm.addEventListener('submit', submitInitials);

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
  // delay time needs to be identical to the transition-duration time for table-row-border-top,
  // table-row-border-right, table-row-border-bottom, and table-row-border-left
  setTimeout(drawBorder, 350);
}

function endGame() {
  mainStage.classList.add('main-stage--is-hidden');
  endStage.classList.remove('end-stage--is-hidden');
  endScore.textContent = scoreCount;
  // just compare score count to lowest high score
  if (!scoreCount > highScoresArray[highScoresArray.length - 1].score) {
    return;
  }
  scoreCheckEl.classList.remove('scoreCheckEl--is-hidden');
  highScores.getFromStorage();
  highScores.load();
}

function toggleCorrectBtn(e) {
  // check if this is first run by checking if their is an associated event
  if (e) {
    console.log(correctBtn);
    flashCount = 0;
    selectedBtn = e.target;
    selectedBtn.classList.add('btn-special--is-selected');
  }
  flashCount += 1;
  if (flashCount < 6) {
    correctBtn.classList.toggle('btn-special--is-correct');
    // flash the --is-correct styles
    setTimeout(toggleCorrectBtn, 200);
  }
  if (flashCount === 6 && selectedBtn === correctBtn) {
    console.log('correct');
    scoreCount += 1;
    score.textContent = scoreCount;
    setTimeout(transitionCard, 2000);
  }
  if (flashCount === 6 && selectedBtn !== correctBtn) {
    setTimeout(endGame, 2000);
  }
}

function checkAnswerValidity(e) {
  if (!e.target.classList.contains('btn-special')) {
    return;
  }
  correctBtn = mainStage.querySelector(`#${correctAnswer.toLowerCase()}`);
  toggleCorrectBtn(e);
}

function transitionCard() {
  mainStage.classList.add('main-stage--is-fading');
  console.log('transition');
  correctBtn.classList.remove('btn-special--is-correct');
  selectedBtn.classList.remove('btn-special--is-selected');
  loadCard();
}

function randomNum(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function fetchQuotes(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = () => resolve(JSON.parse(xhr.responseText));
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send();
  });
}

// quote, choiceA, choiceB, choiceC, choiceD,

function loadCard() {
  // mainStage.classList.remove('main-stage--is-fading');
  const randomIndex = randomNum(quotes.length);
  const quoteObj = quotes[randomIndex];
  const { quote } = quoteObj;
  correctAnswer = quoteObj.author;
  console.log(`init correct: ${correctAnswer}`);
  // update random quote to html
  questionText.textContent = `"${quote}"`;
  // remove random quote from quotes array
  quotes.splice(randomIndex, 1);
}

mainStage.addEventListener('click', checkAnswerValidity);

function runGame() {
  isPlaying = true;
  introStage.classList.add('intro-stage--is-hidden');
  fetchQuotes('https://seinfeld-quotes.herokuapp.com/quotes').then((data) => {
    // there are a few quotes in this array that aren't said by Jerry, George, Elaine, or Kramer;
    // We're not interested in those quotes, so we'll filter them out
    quotes = data.quotes.filter(
      quote => (quote.author === 'Jerry' && quote.quote.length < 300)
        || (quote.author === 'George' && quote.quote.length < 300)
        || (quote.author === 'Elaine' && quote.quote.length < 300)
        || (quote.author === 'Kramer' && quote.quote.length < 300),
    );
    scoreCount = 0;
    score.textContent = scoreCount;
    loadCard(quotes);
  });
}

runGame();
// if answer is right, increment score and cue up next question

startBtn.addEventListener('click', runGame);
