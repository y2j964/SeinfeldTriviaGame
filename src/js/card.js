import PubSub from 'pubsub-js';
import sleep from './sleep';
import shuffle from './shuffle';
import randomNum from './randomNum';
import { mainStage, quotesMutable } from './game';

const questionText = document.querySelector('.question__text');
const questionHeading = document.querySelector('.question__heading');
const btnLifeline = document.querySelector('.lifeline');
const answerButtons = Array.from(document.querySelectorAll('.btn-pointed'));
let correctAnswer;
let selectedBtn;
let correctBtn;
let flashCount = 0;

export const loadCard = () => {
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
  PubSub.publish('reset card');
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

const disableLifeline = () => {
  btnLifeline.classList.add('lifeline--is-disabled');
  btnLifeline.setAttribute('disabled', 'true');
  btnLifeline.setAttribute('aria-disabled', 'true');
};

export const restoreLifeline = () => {
  btnLifeline.classList.remove('lifeline--is-disabled');
  btnLifeline.removeAttribute('disabled');
  btnLifeline.removeAttribute('aria-disabled');
};

export const removeTwoFalseAnswers = (e) => {
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
  disableLifeline();
};

export const checkAnswer = (e) => {
  if (!e.target.classList.contains('btn-pointed')) {
    return;
  }
  selectUserGuess(e);
  toggleCorrectBtn().then(() => {
    if (userGuessedRight()) {
      PubSub.publish('answer correct');
      sleep(2000).then(() => {
        resetCard();
        loadCard();
      });
    } else {
      sleep(2000).then(() => {
        resetCard();
        // trigger end game
        PubSub.publish('wrong answer');
      });
    }
  });
};

PubSub.subscribe('run game', loadCard);
PubSub.subscribe('reset game', restoreLifeline);
