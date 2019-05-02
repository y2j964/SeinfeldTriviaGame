let isPlaying = false;
const startBtn = document.getElementById('startGame');
const answers = document.querySelector('.answers');
const cardIntro = document.querySelector('.card-intro');
let answerBtnIsHovered = false;

let count = 0;
function toggleCorrectAnswer(e) {
  // check if this is first run by checking if their is an associated event
  if (e) {
    count = 0;
    selectedAnswer = e.target;
  }
  // console.log(e.target.id);
  count += 1;
  if (count < 6) {
    selectedAnswer.classList.toggle('btn-special--is-correct');
    // flash the --is-correct styles
    setTimeout(toggleCorrectAnswer, 200);
  }
}

let selectedAnswer;

function checkAnswerValidity(e) {
  if (!e.target.classList.contains('btn-special')) {
    return;
  }
  console.log(e.target.id);
  toggleCorrectAnswer(e);
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

class Card {
  constructor() {}
}

function loadCard() {}

function runGame() {
  isPlaying = true;
  cardIntro.classList.add('card-intro--is-hidden');
  fetchQuotes('https://seinfeld-quotes.herokuapp.com/quotes').then(data => {
    // there are a few quotes in this array that aren't said by Jerry, Geroge, Elaine, or Kramer;
    // We're not interested in those quotes, so we'll filter them out
    let quotes = data.quotes.filter(
      quote =>
        quote.author === 'Jerry' ||
        quote.author === 'George' ||
        quote.author === 'Elaine' ||
        quote.author === 'Kramer',
    );
    console.log(quotes);
    console.log(quotes[randomNum(quotes.length)]);
  });
}

runGame();
// if answer is right, increment score and cue up next question

startBtn.addEventListener('click', runGame);
answers.addEventListener('click', checkAnswerValidity);
// function runGame() {
//   data =>
//   console.log(data.quotes[randomNum(data.quotes.length)]),
// }

// quotes.splice(0, 2);
// console.log(quotes);
// quote and author
// don't call same quote twice; remove from array
// reset if question wrong and prompt user to play again
// Your score was x. Pretty pretty good. Your high score is y
// if score is between values, pretty pretty good or terrible or great

// var longest = quotes.reduce(function(a, b) {
//   return a.quote.length > b.quote.length ? a : b;
// }, '');
// console.log(longest);
// loadCard();
