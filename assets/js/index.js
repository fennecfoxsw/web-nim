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
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function storageAvailable(type) {
  var storage;
  try {
    storage = window[type];
    var x = '__storage_test__';
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

let statusElement = document.getElementById('game-status');

let coins = [];

function calculateNimSum(array) {
  let nimSum = 0;
  array.forEach((elem) => (nimSum ^= elem));
  return nimSum;
}

function remapCoins() {
  let coinSpans = document.querySelectorAll('.game-row-coin');
  for (let i = 0; i < numberOfCoinPiles; i++)
    coinSpans[i].innerHTML = '⚫'.repeat(coins[i]);
  const gameBoard = document.getElementById('game-board');
  twemoji.parse(gameBoard, { className: 'emoji mx-3' });
  gameBoard.addEventListener('dragstart', (event) => {
    event.preventDefault();
  });
}

function newGame(isClassic, numberOfCoinPiles, minCoins, maxCoins) {
  if (isClassic) {
    coins = [1, 3, 5, 7];
  } else {
    for (let i = 0; i < numberOfCoinPiles; i++) {
      coins[i] = getRandomIntInclusive(minCoins, maxCoins);
    }
  }

  let gameRowElements = document.querySelectorAll('.game-row');
  if (numberOfCoinPiles === 3) {
    let forHide = gameRowElements[gameRowElements.length - 1];
    forHide.style = 'display: none;';
    coins[3] = 0;
  } else if (numberOfCoinPiles === 4) {
    let forShow = gameRowElements[gameRowElements.length - 1];
    forShow.style = 'display: table-row;';
  }

  isPlayerSelectedRow = false;
  playerSelectedRow = null;
  isGamePlaying = true;
  isPlayerMoved = false;

  remapCoins();
  decideWhoFirst();
  if (!isPlayerTurn) isComputerFirst = true;
  notyf.open({ type: 'info', message: '새 게임을 시작합니다.' });
}

function decideWhoFirst() {
  let nimSum = calculateNimSum(coins);
  if (nimSum !== 0) {
    statusElement.innerHTML = '당신이 먼저 시작합니다.';
    isPlayerTurn = true;
  } else {
    statusElement.innerHTML =
      '컴퓨터가 먼저 시작합니다. 턴 넘기기 버튼을 눌러주세요.';
    isPlayerTurn = false;
  }
}

function isWin(isPlayerMove) {
  const getArraySum = (array) => array.reduce((a, b) => a + b, 0);
  if (getArraySum(coins) === 0) {
    if (isPlayerMove) {
      statusElement.innerHTML = '당신이 승리했습니다!';
    } else {
      statusElement.innerHTML =
        '컴퓨터가 승리했습니다. New Game 버튼을 눌러 다시 시도해보세요.';
    }
    isGamePlaying = false;
  }
}

function playerMove(row) {
  statusElement.innerHTML = `${row}번째 줄을 선택하셨습니다. 원하시는 만큼 클릭해 동전을 가져가시고 턴 넘기기 버튼을 눌러주세요.`;
  row -= 1;
  const move = () => {
    playerSelectedRow = row;
    isPlayerSelectedRow = true;
    isPlayerMoved = true;
    coins[row]--;
    remapCoins();
  };
  if (!isPlayerSelectedRow) {
    if (coins[row] === 0)
      statusElement.innerHTML = `${
        row + 1
      }번째 줄은 더이상 동전을 가져갈 수 없습니다. 아래 턴 넘기기 버튼을 눌러주세요.`;
    else {
      move();
      isWin(true);
    }
  } else if (row === playerSelectedRow) {
    if (coins[row] === 0)
      statusElement.innerHTML = `${
        row + 1
      }번째 줄은 더이상 동전을 가져갈 수 없습니다. 아래 턴 넘기기 버튼을 눌러주세요.`;
    else {
      move();
      isWin(true);
    }
  } else {
    statusElement.innerHTML = `줄을 잘못 선택하셨습니다. ${
      playerSelectedRow + 1
    }번째 줄에서만 동전을 가져가주세요.`;
  }
}

function computerMove() {
  for (let i = 0; i < numberOfCoinPiles; i++) {
    let copyCoins = [...coins];
    while (copyCoins[i] > 0) {
      copyCoins[i]--;
      if (calculateNimSum(copyCoins) === 0) {
        coins = copyCoins;
        isPlayerSelectedRow = false;
        playerSelectedRow = null;
        isPlayerTurn = true;
        isPlayerMoved = false;
        statusElement.innerHTML =
          '당신의 차례입니다. 동전을 가져갈 줄을 선택해 클릭해주세요. 한번 선택하시면 바꿀 수 없습니다.';
        isWin(false);
        remapCoins();
        return;
      }
    }
  }

  let randomRow;
  do randomRow = getRandomIntInclusive(1, numberOfCoinPiles - 1);
  while (coins[randomRow] === 0);
  let randomMove = getRandomIntInclusive(1, coins[randomRow]);
  coins[randomRow] -= randomMove;
  isPlayerSelectedRow = false;
  playerSelectedRow = null;
  isPlayerTurn = true;
  isPlayerMoved = false;
  statusElement.innerHTML =
    '당신의 차례입니다. 동전을 가져갈 줄을 선택해 클릭해주세요. 한번 선택하시면 바꿀 수 없습니다.';
  isWin(false);
  remapCoins();
}

// Game Event
function onRowClicked(event) {
  if (isGamePlaying && isComputerFirst) {
    statusElement.innerHTML =
      '컴퓨터가 시작하지 않았습니다. 턴 넘기기 버튼을 눌러주세요.';
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
    playerMove(selectedRow.dataset.gameRow);
  }
}

function onTurnOverClicked(event) {
  if (!isGamePlaying) return;
  if (isComputerFirst) {
    isComputerFirst = false;
    computerMove();
    return;
  }
  if (!isPlayerMoved) {
    statusElement.innerHTML =
      '아직 동전을 가져가시지 않았습니다.<br>여러 더미 중 하나의 더미에서 적어도 한 개 이상의 동전을 가져가야 합니다.';
    return;
  }
  if (isGamePlaying && isPlayerTurn) {
    isPlayerTurn = false;
    computerMove();
  }
}

let gameRows = document.querySelectorAll('.game-row');
gameRows.forEach((gameRow) =>
  gameRow.addEventListener('click', (event) => onRowClicked(event))
);
document.addEventListener('keydown', (event) => {
  const gameKeys = ['1', '2', '3', '4', 'd', 'f', 'j', 'k'];
  const keyPressed = event.key.toLowerCase();
  let newEvent = { target: null };
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
        statusElement.innerHTML =
          '잘못된 키를 누르셨습니다. 현재 게임에서는 코인 더미가 3개입니다.';
        return;
      }
    }
    onRowClicked(newEvent);
  }
});

let turnOverButton = document.getElementById('turn-over-btn');
turnOverButton.addEventListener('click', (event) => onTurnOverClicked(event));
document.addEventListener('keydown', (event) => {
  if (['Enter', ' '].includes(event.key)) {
    event.preventDefault();
    onTurnOverClicked();
  }
});

let newGameButton = document.getElementById('new-game-btn');
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

let optionButton = document.getElementById('option-btn');
let optionSaveButton = document.getElementById('option-save-btn');

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    optionButton.click();
  }
});

function saveOption(isClassic, numberOfCoinPiles, minCoins, maxCoins) {
  if (storageAvailable('localStorage')) {
    localStorage.setItem('isClassic', isClassic);
    localStorage.setItem('numberOfCoinPiles', numberOfCoinPiles);
    localStorage.setItem('minCoins', minCoins);
    localStorage.setItem('maxCoins', maxCoins);
    notyf.open({
      type: 'success',
      message: '옵션이 성공적으로 저장되었습니다.',
    });
  } else {
    notyf.open({
      type: 'warning',
      message: '이 브라우저에서는 옵션을 저장 또는 로드할 수 없습니다.',
    });
  }
}

function loadOption() {
  if (storageAvailable('localStorage')) {
    isClassic = (localStorage.getItem('isClassic') ?? 'true') === 'true';
    numberOfCoinPiles = Number(localStorage.getItem('numberOfCoinPiles') ?? 4);
    minCoins = Number(localStorage.getItem('minCoins') ?? 1);
    maxCoins = Number(localStorage.getItem('maxCoins') ?? 10);
    let gameRowElements = document.querySelectorAll('.game-row');
    if (numberOfCoinPiles === 3) {
      let forHide = gameRowElements[gameRowElements.length - 1];
      forHide.style = 'display: none;';
    } else if (numberOfCoinPiles === 4) {
      let forShow = gameRowElements[gameRowElements.length - 1];
      forShow.style = 'display: table-row;';
    }
    notyf.open({
      type: 'success',
      message: '옵션을 성공적으로 가져왔습니다.',
    });
  } else {
    notyf.open({
      type: 'warning',
      message: '이 브라우저에서는 옵션을 저장 또는 로드할 수 없습니다.',
    });
  }
}

document.addEventListener('DOMContentLoaded', loadOption);

const optionIsClassicElement = document.getElementById('is-classic-checkbox');
const optionCoinPilesElement = document.getElementById('coin-piles-select');
const optionMaxCoinRangeElement = document.getElementById('max-coins-range');
const optionNowCoinElement = document.getElementById('option-now-coin');
optionSaveButton.addEventListener('click', (event) => {
  let optionIsClassic = optionIsClassicElement.checked;
  let optionCoinPiles = Number(optionCoinPilesElement.value);
  let optionMaxCoinRange = Number(optionMaxCoinRangeElement.value);

  if (optionIsClassic) {
    optionCoinPiles = 4;
    optionMaxCoinRange = 7;
  }

  isClassic = optionIsClassic;
  numberOfCoinPiles = parseInt(optionCoinPiles);
  maxCoins = parseInt(optionMaxCoinRange);
  saveOption(isClassic, numberOfCoinPiles, minCoins, maxCoins);
  newGame(isClassic, numberOfCoinPiles, minCoins, maxCoins);
});

optionMaxCoinRangeElement.addEventListener('change', (event) => {
  optionNowCoinElement.innerHTML = event.target.value;
});
optionButton.addEventListener('click', (event) => {
  optionIsClassicElement.checked = isClassic;
  optionCoinPilesElement.value = numberOfCoinPiles;
  optionNowCoinElement.innerHTML = maxCoins;
  optionMaxCoinRangeElement.value = maxCoins;
});
