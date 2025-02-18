/* global Notyf, liquidjs, twemoji, AOS */

const checkElement = async (selector) => {
  while (document.querySelector(selector) === null) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return document.querySelector(selector);
};
checkElement('#game-board').then(() => {
  AOS.init({
    duration: 500,
    once: true,
    offset: -9999,
  });
});

const notyf = new Notyf({
  duration: 5000,
  types: [
    {
      type: 'success',
      background: 'var(--bs-success)',
      icon: {
        className: 'material-icons text-white',
        tagName: 'span',
        text: 'check_circle',
      },
    },
    {
      type: 'info',
      background: 'var(--bs-blue)',
      icon: {
        className: 'material-icons text-white',
        tagName: 'span',
        text: 'info',
      },
    },
    {
      type: 'warning',
      background: 'var(--bs-orange)',
      icon: {
        className: 'material-icons text-white',
        tagName: 'span',
        text: 'warning',
      },
    },
    {
      type: 'error',
      background: 'var(--bs-danger)',
      icon: {
        className: 'material-icons text-white',
        tagName: 'span',
        text: 'error',
      },
    },
  ],
});

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      (e.code === 22 ||
        e.code === 1014 ||
        e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      storage &&
      storage.length !== 0
    );
  }
}

// Language
const pageLanguage = document.documentElement.lang;
const userLanguage = navigator.language;
const changeLanguageAlert = document.getElementById('change-language');
if (
  (pageLanguage === 'ko' && userLanguage !== 'ko-KR') ||
  (pageLanguage === 'en' && userLanguage === 'ko-KR')
) {
  let isDismissClicked = '';
  if (storageAvailable('localStorage')) {
    isDismissClicked = localStorage.getItem('dismissLanguage') === 'true';
  }
  if (!isDismissClicked) {
    changeLanguageAlert.style = 'display: block;';
    const dismissButton = document.getElementById('language-dismiss-button');
    dismissButton.addEventListener('click', () => {
      changeLanguageAlert.style = 'display: none;';
      if (storageAvailable('localStorage')) {
        localStorage.setItem('dismissLanguage', true);
      }
    });
  }
}

let languageData;
fetch('../assets/js/language.json')
  .then((response) => response.json())
  .then((data) => {
    languageData = data[pageLanguage];
  })
  .catch((error) => notyf.error(`Can't load language!\n${error}`));

const engine = new liquidjs.Liquid();
function getLanguageWithValue(message, values) {
  const languageMessage = languageData[message];
  const parsedTemplete = engine.parse(languageMessage);
  return engine.renderSync(parsedTemplete, values);
}

// Original Code
// Copyright © 2009 Fortune_Cookie_
// https://community.shopify.com/c/Shopify-Design/Ordinal-Number-in-javascript-1st-2nd-3rd-4th/m-p/72156
function getGetOrdinal(n) {
  if (pageLanguage === 'ko') return `${n}번째`;
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Game Options
let isClassic = true;
let numberOfCoinPiles = 4;
let minCoins = 1;
let maxCoins = 10;

let isGamePlaying = false;
let isComputerFirst = false;
let isPlayerTurn = false;
let isPlayerSelectedRow = false;
let playerSelectedRow;
let isPlayerMoved = false;

const statusElement = document.getElementById('game-status');

let coins = [];

function calculateNimSum(array) {
  let nimSum = 0;
  array.forEach((elem) => {
    /* eslint no-bitwise: ["error", { "allow": ["^="] }] */
    nimSum ^= elem;
  });
  return nimSum;
}

function remapCoins() {
  const coinSpans = document.querySelectorAll('.game-row-coin');
  for (let i = 0; i < numberOfCoinPiles; i += 1)
    coinSpans[i].innerHTML = '⚫'.repeat(coins[i]);
  const gameBoard = document.getElementById('game-board');
  twemoji.parse(gameBoard, {
    className: 'emoji mx-3',
    base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
  });
  gameBoard.addEventListener('dragstart', (event) => {
    event.preventDefault();
  });
}

function decideWhoFirst() {
  const nimSum = calculateNimSum(coins);
  if (nimSum !== 0) {
    statusElement.innerHTML = languageData.youFirst;
    isPlayerTurn = true;
  } else {
    statusElement.innerHTML = languageData.computerFirst;
    isPlayerTurn = false;
  }
}

function newGame() {
  if (isClassic) {
    coins = [1, 3, 5, 7];
  } else {
    for (let i = 0; i < numberOfCoinPiles; i += 1) {
      coins[i] = getRandomIntInclusive(minCoins, maxCoins);
    }
  }

  const gameRowElements = document.querySelectorAll('.game-row');
  if (numberOfCoinPiles === 3) {
    const forHide = gameRowElements[gameRowElements.length - 1];
    forHide.style = 'display: none;';
    coins[3] = 0;
  } else if (numberOfCoinPiles === 4) {
    const forShow = gameRowElements[gameRowElements.length - 1];
    forShow.style = 'display: table-row;';
  }

  isPlayerSelectedRow = false;
  playerSelectedRow = null;
  isGamePlaying = true;
  isPlayerMoved = false;

  remapCoins();
  decideWhoFirst();
  if (!isPlayerTurn) isComputerFirst = true;
  notyf.open({ type: 'info', message: languageData.toastNewGame });
}

function isWin(isPlayerMove) {
  const getArraySum = (array) => array.reduce((a, b) => a + b, 0);
  if (getArraySum(coins) === 0) {
    if (isPlayerMove) {
      statusElement.innerHTML = languageData.youWin;
    } else {
      statusElement.innerHTML = languageData.computerWin;
    }
    isGamePlaying = false;
  }
}

function playerMove(row) {
  statusElement.innerHTML = getLanguageWithValue('rowSelected', {
    row: getGetOrdinal(row + 1),
  });
  const move = () => {
    playerSelectedRow = row;
    isPlayerSelectedRow = true;
    isPlayerMoved = true;
    coins[row] -= 1;
    remapCoins();
  };
  if (!isPlayerSelectedRow) {
    if (coins[row] === 0)
      statusElement.innerHTML = getLanguageWithValue('rowCanNotTake', {
        row: getGetOrdinal(row + 1),
      });
    else {
      move();
      isWin(true);
    }
  } else if (row === playerSelectedRow) {
    if (coins[row] === 0)
      statusElement.innerHTML = getLanguageWithValue('rowCanNotTake', {
        row: getGetOrdinal(row + 1),
      });
    else {
      move();
      isWin(true);
    }
  } else {
    statusElement.innerHTML = getLanguageWithValue('wrongRow', {
      row: getGetOrdinal(playerSelectedRow + 1),
    });
  }
}

function computerMove() {
  for (let i = 0; i < numberOfCoinPiles; i += 1) {
    const copyCoins = [...coins];
    while (copyCoins[i] > 0) {
      copyCoins[i] -= 1;
      if (calculateNimSum(copyCoins) === 0) {
        coins = copyCoins;
        isPlayerSelectedRow = false;
        playerSelectedRow = null;
        isPlayerTurn = true;
        isPlayerMoved = false;
        statusElement.innerHTML = languageData.yourTurn;
        isWin(false);
        remapCoins();
        return;
      }
    }
  }

  let randomRow;
  do randomRow = getRandomIntInclusive(1, numberOfCoinPiles - 1);
  while (coins[randomRow] === 0);
  const randomMove = getRandomIntInclusive(1, coins[randomRow]);
  coins[randomRow] -= randomMove;
  isPlayerSelectedRow = false;
  playerSelectedRow = null;
  isPlayerTurn = true;
  isPlayerMoved = false;
  statusElement.innerHTML = languageData.yourTurn;
  isWin(false);
  remapCoins();
}

// Game Event
function onRowClicked(event) {
  if (isGamePlaying && isComputerFirst) {
    statusElement.innerHTML = languageData.computerNotStarted;
    return;
  }
  if (isGamePlaying && isPlayerTurn) {
    const clickedElement = event.target;
    let selectedRow;
    if (clickedElement.tagName === 'IMG') {
      selectedRow = clickedElement.parentNode.parentNode.parentNode;
    } else if (clickedElement.tagName === 'SPAN') {
      selectedRow = clickedElement.parentNode.parentNode;
    } else {
      selectedRow = clickedElement.parentNode;
    }
    playerMove(parseInt(selectedRow.dataset.gameRow));
  }
}

function onTurnOverClicked() {
  if (!isGamePlaying) return;
  if (isComputerFirst) {
    isComputerFirst = false;
    computerMove();
    return;
  }
  if (!isPlayerMoved) {
    statusElement.innerHTML = languageData.youAreNotTaked;
    return;
  }
  if (isGamePlaying && isPlayerTurn) {
    isPlayerTurn = false;
    computerMove();
  }
}

const gameRows = document.querySelectorAll('.game-row');
gameRows.forEach((gameRow) =>
  gameRow.addEventListener('click', (event) => onRowClicked(event))
);
document.addEventListener('keydown', (event) => {
  const gameKeys = ['1', '2', '3', '4', 'd', 'f', 'j', 'k'];
  const keyPressed = event.key.toLowerCase();
  const newEvent = { target: null };
  if (gameKeys.includes(keyPressed)) {
    if (keyPressed === '1' || keyPressed === 'd') {
      newEvent.target = document.querySelector('#game-row-1-tr td');
    }
    if (keyPressed === '2' || keyPressed === 'f') {
      newEvent.target = document.querySelector('#game-row-2-tr td');
    }
    if (keyPressed === '3' || keyPressed === 'j') {
      newEvent.target = document.querySelector('#game-row-3-tr td');
    }
    if (keyPressed === '4' || keyPressed === 'k') {
      if (numberOfCoinPiles === 4) {
        newEvent.target = document.querySelector('#game-row-4-tr td');
      } else {
        statusElement.innerHTML = languageData.wrongKey;
        return;
      }
    }
    onRowClicked(newEvent);
  }
});

const turnOverButton = document.getElementById('turn-over-btn');
turnOverButton.addEventListener('click', (event) => onTurnOverClicked(event));
document.addEventListener('keydown', (event) => {
  if (['Enter', ' '].includes(event.key)) {
    event.preventDefault();
    onTurnOverClicked();
  }
});

const newGameButton = document.getElementById('new-game-btn');
newGameButton.addEventListener('click', () =>
  newGame(isClassic, numberOfCoinPiles, minCoins, maxCoins)
);
document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'n') {
    event.preventDefault();
    newGameButton.click();
  }
});

// Option

const optionButton = document.getElementById('option-btn');
const optionSaveButton = document.getElementById('option-save-btn');

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    optionButton.click();
  }
});

function saveOption(toSaveOptions) {
  if (storageAvailable('localStorage')) {
    localStorage.setItem('isClassic', toSaveOptions.isClassic);
    localStorage.setItem('numberOfCoinPiles', toSaveOptions.numberOfCoinPiles);
    localStorage.setItem('minCoins', toSaveOptions.minCoins);
    localStorage.setItem('maxCoins', toSaveOptions.maxCoins);
    notyf.open({
      type: 'success',
      message: languageData.optionSaved,
    });
  } else {
    notyf.open({
      type: 'warning',
      message: languageData.browserCanNotSaveLoadOption,
    });
  }
}

function loadOption() {
  if (storageAvailable('localStorage')) {
    isClassic = (localStorage.getItem('isClassic') ?? 'true') === 'true';
    numberOfCoinPiles = Number(localStorage.getItem('numberOfCoinPiles') ?? 4);
    minCoins = Number(localStorage.getItem('minCoins') ?? 1);
    maxCoins = Number(localStorage.getItem('maxCoins') ?? 10);
    const gameRowElements = document.querySelectorAll('.game-row');
    if (numberOfCoinPiles === 3) {
      const forHide = gameRowElements[gameRowElements.length - 1];
      forHide.style = 'display: none;';
    } else if (numberOfCoinPiles === 4) {
      const forShow = gameRowElements[gameRowElements.length - 1];
      forShow.style = 'display: table-row;';
    }
    notyf.open({
      type: 'success',
      message: languageData.optionLoaded,
    });
  } else {
    notyf.open({
      type: 'warning',
      message: languageData.browserCanNotSaveLoadOption,
    });
  }
}

document.addEventListener('DOMContentLoaded', loadOption);

const optionIsClassicElement = document.getElementById('is-classic-checkbox');
const optionCoinPilesElement = document.getElementById('coin-piles-select');
const optionMaxCoinRangeElement = document.getElementById('max-coins-range');
const optionNowCoinElement = document.getElementById('option-now-coin');
optionSaveButton.addEventListener('click', () => {
  const optionIsClassic = optionIsClassicElement.checked;
  let optionCoinPiles = Number(optionCoinPilesElement.value);
  let optionMaxCoinRange = Number(optionMaxCoinRangeElement.value);
  if (optionIsClassic) {
    optionCoinPiles = 4;
    optionMaxCoinRange = 7;
  }

  isClassic = optionIsClassic;
  numberOfCoinPiles = parseInt(optionCoinPiles, 10);
  maxCoins = parseInt(optionMaxCoinRange, 10);
  saveOption({ isClassic, numberOfCoinPiles, minCoins, maxCoins });
  newGame();
});

optionMaxCoinRangeElement.addEventListener('change', (event) => {
  optionNowCoinElement.innerHTML = event.target.value;
});
optionButton.addEventListener('click', () => {
  optionIsClassicElement.checked = isClassic;
  optionCoinPilesElement.value = numberOfCoinPiles;
  optionNowCoinElement.innerHTML = maxCoins;
  optionMaxCoinRangeElement.value = maxCoins;
});
