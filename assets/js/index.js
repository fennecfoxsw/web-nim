function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Game Options
let isClassic = true;
let rowCount = 4;
let minCoins = 1;
let maxCoins = 10;

// Is game playing?
let isGamePlaying = false;
// On game coins
let coins = [];
// On game turn
let isPlayerTurn = false;

let isPlayerSelectedRow = false;
let playerSelectedRow;
let isPlayerMoved = false;

function calculateNimSum(array) {
  let nimSum = 0;
  array.forEach((elem) => (nimSum ^= elem));
  return nimSum;
}

function assignCoins() {
  let coinSpans = document.querySelectorAll('.game-row-coin');
  for (let i = 0; i < rowCount; i++)
    coinSpans[i].innerHTML = '⚫'.repeat(coins[i]);
  twemoji.parse(document.body, { className: 'emoji mx-3' });
}

function newGame(isClassic, rowCount, minCoins, maxCoins) {
  if (isClassic) {
    coins = [1, 3, 5, 7];
  } else {
    for (let i = 0; i < rowCount; i++) {
      coins[i] = getRandomIntInclusive(minCoins, maxCoins);
    }
  }

  let gameRowElements = document.querySelectorAll('.game-row');
  if (rowCount === 3) {
    let forHide = gameRowElements[gameRowElements.length - 1];
    forHide.style = 'display: none;';
  } else if (rowCount === 4) {
    let forShow = gameRowElements[gameRowElements.length - 1];
    forShow.style = 'display: table-row;';
  }
  isPlayerSelectedRow = false;
  playerSelectedRow = undefined;
  isGamePlaying = true;
  assignCoins();
  decideWhoFirst();
  if (!isPlayerTurn) computerMove();
}

function decideWhoFirst() {
  let statusElement = document.getElementById('game-status');
  let nimSum = calculateNimSum(coins);
  if (nimSum !== 0) {
    statusElement.innerHTML = '당신이 먼저 시작합니다. 게임에서 이기세요.';
    isPlayerTurn = true;
  } else {
    statusElement.innerHTML = '컴퓨터가 먼저 시작합니다. 게임에서 이기세요.';
    isPlayerTurn = false;
  }
}

function isWin(isPlayerMove) {
  let statusElement = document.getElementById('game-status');
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
  let statusElement = document.getElementById('game-status');
  statusElement.innerHTML = `${row}번째 줄을 선택하셨습니다. 원하시는 만큼 클릭해 동전을 가져가세요.`;
  row -= 1;
  const move = () => {
    playerSelectedRow = row;
    isPlayerSelectedRow = true;
    isPlayerMoved = true;
    coins[row]--;
    assignCoins();
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
    statusElement.innerHTML = `줄을 잘못 선택하셨습니다.`;
  }
}

function computerMove() {
  let statusElement = document.getElementById('game-status');
  for (let i = 0; i < rowCount; i++) {
    let copyCoins = [...coins];
    while (copyCoins[i] >= 0) {
      copyCoins[i]--;
      if (calculateNimSum(copyCoins) === 0) {
        coins = copyCoins;
        isPlayerSelectedRow = false;
        playerSelectedRow = undefined;
        isPlayerTurn = true;
        statusElement.innerHTML =
          '당신의 차례입니다. 동전을 가져갈 줄을 선택해 클릭해주세요. 한번 선택하시면 바꿀 수 없습니다.';
        isWin(false);
        assignCoins();
        return;
      }
    }
  }

  let randomRow;
  do randomRow = getRandomIntInclusive(1, rowCount - 1);
  while (coins[randomRow] === 0);
  let randomMove = getRandomIntInclusive(1, coins[randomRow]);
  coins[randomRow] -= randomMove;
  isPlayerSelectedRow = false;
  playerSelectedRow = undefined;
  isPlayerTurn = true;
  statusElement.innerHTML =
    '당신의 차례입니다. 동전을 가져갈 줄을 선택해 클릭해주세요. 한번 선택하시면 바꿀 수 없습니다.';
  isWin(false);
  assignCoins();
}

// Game Event
function onRowClicked(event) {
  if (isGamePlaying && isPlayerTurn) {
    let selectedRow;
    if (event.srcElement.tagName === 'IMG') {
      selectedRow = event.srcElement.parentNode.parentNode.parentNode;
    } else if (event.srcElement.tagName === 'SPAN') {
      selectedRow = event.srcElement.parentNode.parentNode;
    } else {
      selectedRow = event.srcElement.parentNode;
    }
    playerMove(selectedRow.dataset.gameRow);
  }
}

function onTurnOverClicked(event) {
  if (!isPlayerMoved) {
    let statusElement = document.getElementById('game-status');
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

let turnOverButton = document.getElementById('turn-over-btn');
turnOverButton.addEventListener('click', (event) => onTurnOverClicked(event));

// Other Event

let newGameButton = document.getElementById('new-game-btn');
let optionButton = document.getElementById('option-btn');
let optionSaveButton = document.getElementById('option-save-btn');

newGameButton.addEventListener('click', () =>
  newGame(isClassic, rowCount, minCoins, maxCoins)
);
optionSaveButton.addEventListener('click', (event) => {
  let optionIsClassicElement = document.getElementById('is-classic-checkbox');
  let optionCoinPilesElement = document.getElementById('coin-piles-select');
  let optionMaxCoinRangeElement = document.getElementById('max-coins-range');

  let optionIsClassic = optionIsClassicElement.checked;
  let optionCoinPiles = optionCoinPilesElement.value;
  let optionMaxCoinRange = optionMaxCoinRangeElement.value;

  if (optionIsClassic) {
    optionCoinPiles = 4;
    optionMaxCoinRange = 7;
  }

  isClassic = optionIsClassic;
  rowCount = parseInt(optionCoinPiles);
  maxCoins = parseInt(optionMaxCoinRange);
  newGame(isClassic, rowCount, minCoins, maxCoins);
});

let optionMaxCoinRangeElement = document.getElementById('max-coins-range');
optionMaxCoinRangeElement.addEventListener('change', (event) => {
  document.getElementById('option-now-coin').innerHTML = event.srcElement.value;
});
optionButton.addEventListener('click', (event) => {
  document.getElementById('option-now-coin').innerHTML = maxCoins;
});
