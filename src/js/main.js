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

let newEntryElementRank;
let newEntryElementName;
let newEntryElementScore;

highScores.getFromStorage();
function createTdSpansForAnimation() {
  // find index of newEntry so that we can highlight user's score
  const newEntryIndex = highScoresArray.findIndex(
    entry => entry.name === newEntry.name && entry.score === newEntry.score,
  );
  const newEntryElement = document.querySelector(`tbody tr:nth-of-type(${newEntryIndex + 1})`);
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
}

function addTdSpansToDOM(tdRankSpans, tdNameSpans, tdScoreSpans) {
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
}

const tableRowAnimation = function tableRowAnimationScope() {
  // this function specifically is set up with outer scope so that we only grab the outer variables once
  // it also allows us to init the piece counter
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('scope');
      // grab all spans in the order in which we want to draw border animation
      // we want to draw the border from the top left to top right, top right to bottom right,
      // bottom right to bottom left, and bottom left to top right
      const tableRowBorderTop = Array.from(document.querySelectorAll('.table-row-border-top'));
      const tableRowBorderRight = document.querySelector('.table-row-border-right');
      const tableRowBorderBottom = Array.from(
        document.querySelectorAll('.table-row-border-bottom'),
      );
      const tableRowBorderLeft = document.querySelector('.table-row-border-left');

      borderTransitionPieces = [
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
        // delay time needs to be identical to the transition-duration time for table-row-border-top,
        // table-row-border-right, table-row-border-bottom, and table-row-border-left
        setTimeout(drawBorder, 350);
      }
      resolve();
      drawBorder();
    }, 800);
  });
};

function scrollToHighScoresTable() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      highScoresHeading.focus();
      highScoresTable.scrollIntoView({ behavior: 'smooth' });
      resolve();
    }, 2000);
  });
}

// remove elements and reveal success message
function userInitialSubmissionSuccess() {
  // this and the previous 2 functions return Promises to keep them decoupled: they can be chained together if desired,
  // or they can just be used by themselves
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
}

// transition messages

function submitInitials(e) {
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
  userInitialSubmissionSuccess()
    .then(() => scrollToHighScoresTable())
    .then(() => tableRowAnimation());
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
