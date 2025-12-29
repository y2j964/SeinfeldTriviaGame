import seinfeldQuotes from '../assets/seinfeld-quotes';
import shuffle from './shuffle';

const getDataFromServer = function getDataFromServer(url) {
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
  const quotes = data.quotes.filter(
    quote => relevantCharacters.includes(quote.author) && quote.quote.length < maxQuoteLength,
  );
  return quotes;
};

// eslint-disable-next-line import/prefer-default-export
export const getRelevantSeinfeldQuotes = () => getDataFromServer('https://seinfeld-quotes.herokuapp.com/quotes')
	.then(filterQuotes)
	.catch(() => shuffle(seinfeldQuotes));
