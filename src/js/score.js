import PubSub from 'pubsub-js';

const srCorrectAnnouncement = document.getElementById('sr-correct-announcement');

export let scoreCount;

const score = document.getElementById('score-total');

export const incrementScore = () => {
  scoreCount += 1;
  score.textContent = scoreCount;
  srCorrectAnnouncement.textContent = 'Correct!';
};

export const resetScore = () => {
  scoreCount = 9;
  score.textContent = scoreCount;
};

PubSub.subscribe('reset card', () => {
  srCorrectAnnouncement.textContent = '';
});
PubSub.subscribe('run game', resetScore);
PubSub.subscribe('answer correct', incrementScore);
