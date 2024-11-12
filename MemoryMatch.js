// MemoryMatch.js

// IndexedDB variables
const dbName = 'offline-memory-match';
const dbVersion = 1;
let db;

// Game variables
const gameGrid = document.querySelector('.game-grid');
const movesElement = document.getElementById('moves');
const scoreElement = document.getElementById('score');
const resetBtn = document.getElementById('reset-btn');
let gameData = {
  cards: [],
  moves: 0,
  score: 0,
  flippedCards: []
};
let highScores = [];

// Initialize IndexedDB
async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };
    request.onerror = () => {
      reject('Error opening DB');
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('gameData', { keyPath: 'id' });
      db.createObjectStore('highScores', { autoIncrement: true });
    };
  });
}

// Load game data from IndexedDB
async function loadGameData() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('gameData', 'readonly');
    const objectStore = transaction.objectStore('gameData');
    const request = objectStore.get(1);
    request.onsuccess = () => {
      gameData = request.result || gameData;
      resolve();
    };
    request.onerror = () => {
      reject('Error loading game data');
    };
  });
}

// Save game data to IndexedDB
async function saveGameData() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('gameData', 'readwrite');
    const objectStore = transaction.objectStore('gameData');
    const request = objectStore.put(gameData);
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = () => {
      reject('Error saving game data');
    };
  });
}

// Load high scores from IndexedDB
async function loadHighScores() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('highScores', 'readonly');
    const objectStore = transaction.objectStore('highScores');
    const request = objectStore.getAll();
    request.onsuccess = () => {
      highScores = request.result || highScores;
      resolve();
    };
    request.onerror = () => {
      reject('Error loading high scores');
    };
  });
}

// Save high score to IndexedDB
async function saveHighScore(score) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('highScores', 'readwrite');
    const objectStore = transaction.objectStore('highScores');
    const request = objectStore.add({ score });
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = () => {
      reject('Error saving high score');
    };
  });
}

// Generate random cards
function generateCards() {
  const images = ['image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg', 'image5.jpg', 'image6.jpg', 'image7.jpg', 'image8.jpg'];
  const cards = [];
  for (let i = 0; i < 16; i++) {
    cards.push({ image: images[Math.floor(i / 2)], flipped: false });
  }
  return cards;
}

// Flip card
function flipCard(card) {
  card.flipped = true;
  gameData.flippedCards.push(card);
  if (gameData.flippedCards.length === 2) {
    checkMatch();
  }
}

// Check match
function checkMatch() {
  const card1 = gameData.flippedCards[0];
  const card2 = gameData.flippedCards[1];
  if (card1.image === card2.image) {
    gameData.score++;
    scoreElement.textContent = gameData.score;
    gameData.flippedCards = [];
  } else {
    setTimeout(() => {
      card1.flipped = false;
      card2.flipped = false;
      gameData.flippedCards = [];
    }, 1000);
  }
  gameData.moves++;
  movesElement.textContent = gameData.moves;
  saveGameData();
}

// Reset game
function resetGame() {
  gameData = {
    cards: generateCards(),
    moves: 0,
    score: 0,
    flippedCards: []
  };
  gameGrid.innerHTML = '';
  gameData.cards.forEach((card) => {
    const cardElement = document.createElement('div');
    cardElement.style.backgroundImage = `url(${card.image})`;
    cardElement.addEventListener('click', () => {
      if (!card.flipped) {
        flipCard(card);
      }
    });
    gameGrid.appendChild(cardElement);
  });
  movesElement.textContent = gameData.moves;
  scoreElement.textContent = gameData.score;
  saveGameData();
}

// Initialize game
async function initGame() {
  await initDB();
  await loadGameData();
  await loadHighScores();
  gameGrid.innerHTML = '';
  gameData.cards.forEach((card) => {
    const cardElement = document.createElement('div');
    cardElement.style.backgroundImage = `url(${card.image})`;
    cardElement.addEventListener('click', () => {
      if (!card.flipped) {
        flipCard(card);
      }
    });
    gameGrid.appendChild(cardElement);
  });
  movesElement.textContent = gameData.moves;
  scoreElement.textContent = gameData.score;
  resetBtn.addEventListener('click', resetGame);
}

initGame();

