let isPlaying = false;
const startBtn = document.getElementById('startGame');
const introStage = document.querySelector('.intro-stage');
const questionText = document.querySelector('.question__text');
// const [btnA, btnB, btnC, btnD] = document.querySelectorAll('.btn-special');
const mainStage = document.querySelector('.main-stage');
const endStage = document.querySelector('.end-stage');
const nameEntry = Array.from(
  document.querySelectorAll('.high-scores__name-entry'),
);
const highScoreEntry = Array.from(
  document.querySelectorAll('.high-scores__score-entry'),
);
const score = document.getElementById('score-total');
const endScore = document.getElementById('end-score');

let quotes;
let correctAnswer;
let selectedBtn;
let correctBtn;
let flashCount = 0;
let scoreCount;
let highScores;

function endGame() {
  mainStage.classList.add('main-stage--is-hidden');
  endStage.classList.remove('end-stage--is-hidden');
  endScore.textContent = scoreCount;
  // if endScore
}

if (localStorage.getItem('highScores') === null) {
  highScores = [
    { name: 'EB', score: 20 },
    { name: 'JCM', score: 25 },
    { name: 'JS', score: 14 },
    { name: 'GC', score: 17 },
    { name: 'EB', score: 8 },
    { name: 'LD', score: 10 },
    { name: 'KC', score: 13 },
    { name: 'GC', score: 6 },
    { name: 'KC', score: 3 },
    { name: 'JS', score: 5 },
  ];
  // ensure list is sorted;
  highScores.sort((a, b) => b.score - a.score);
  localStorage.setItem('highScores', JSON.stringify(highScores));
} else {
  highScores = JSON.parse(localStorage.getItem('highScores'));
}

function loadHighScores() {
  for (let i = 0; i < highScores.length; i++) {
    // only log the top 10 highest scores
    if (i >= 10) {
      break;
    }
    nameEntry[i].textContent = highScores[i].name;
    highScoreEntry[i].textContent = highScores[i].score;
  }
}

loadHighScores();
const newScore = 23;
let initials = 'NEW';
const newEntry = { name: initials, score: newScore };
if (newScore > highScores[highScores.length - 1].score) {
  highScores.push(newEntry);
  highScores.sort((a, b) => b.score - a.score);
  // only keep track of top 10 scores
  highScores.pop();
  loadHighScores();
  const newEntryIndex = highScores.findIndex(
    entry => entry.name === initials && entry.score === newScore,
  );
  const newEntryElement = document.querySelector(
    `tbody tr:nth-of-type(${newEntryIndex + 1})`,
  );
  newEntryElement.classList.add('high-scores__row--is-active');
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
  console.log('init correct: ' + correctAnswer);
  // update random quote to html
  questionText.textContent = `"${quote}"`;
  // remove random quote from quotes array
  quotes.splice(randomIndex, 1);
}

mainStage.addEventListener('click', checkAnswerValidity);

function runGame() {
  isPlaying = true;
  introStage.classList.add('intro-stage--is-hidden');
  fetchQuotes('https://seinfeld-quotes.herokuapp.com/quotes').then(data => {
    // there are a few quotes in this array that aren't said by Jerry, Geroge, Elaine, or Kramer;
    // We're not interested in those quotes, so we'll filter them out
    quotes = data.quotes.filter(
      quote =>
        (quote.author === 'Jerry' && quote.quote.length < 300) ||
        (quote.author === 'George' && quote.quote.length < 300) ||
        (quote.author === 'Elaine' && quote.quote.length < 300) ||
        (quote.author === 'Kramer' && quote.quote.length < 300),
    );
    scoreCount = 0;
    score.textContent = scoreCount;
    loadCard(quotes);
  });
}

runGame();
// if answer is right, increment score and cue up next question

startBtn.addEventListener('click', runGame);

// function runGame() {
//   data =>
//   console.log(data.quotes[randomNum(data.quotes.length)]),
// }

// reset if question wrong and prompt user to play again
// Your score was x. Pretty pretty good. Your high score is y
// if score is between values, pretty pretty good or terrible or great

// var longest = quotes.reduce(function(a, b) {
//   return a.quote.length > b.quote.length ? a : b;
// }, '');
// console.log(longest);
// loadCard();
