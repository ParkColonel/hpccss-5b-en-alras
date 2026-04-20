// Wordle Game State
const wordleVocabulary = [
  'glide', 'sneak', 'quaff', 'slurp', 'gaunt', 'stern', 'azure', 'lilac', 'tryst', 'chide',
  'taunt', 'burst', 'crack', 'vital', 'revel', 'about', 'above', 'actor', 'admit', 'adult',
  'after', 'agent', 'agree', 'alert', 'alike', 'alive', 'allow', 'alone', 'along', 'alter',
  'among', 'amuse', 'anger', 'angle', 'apply', 'argue', 'arise', 'armed', 'array', 'asset',
  'audit', 'avoid', 'award', 'aware', 'basic', 'basis', 'begin', 'below', 'birth', 'block',
  'board', 'brain', 'brief', 'build', 'cause', 'chain', 'check', 'civil', 'claim', 'clean',
  'clear', 'clock', 'close', 'count', 'court', 'cover', 'cycle', 'daily', 'dance', 'dated',
  'delay', 'depth', 'draft', 'drive', 'event', 'exact', 'exist', 'extra', 'faith', 'field',
  'final', 'focus', 'force', 'front', 'grand', 'group', 'guide', 'heart', 'heavy', 'ideal',
  'image', 'index', 'input', 'issue', 'joint', 'large', 'layer', 'level', 'limit', 'local',
  'logic', 'major', 'match', 'model', 'music', 'night', 'order', 'other', 'phase', 'point',
  'power', 'price', 'prior', 'range', 'scope', 'share', 'small', 'sound', 'space', 'stage',
  'still', 'table', 'total', 'track', 'trend', 'trial', 'value', 'voice', 'waste', 'watch',
  'water', 'whole', 'world', 'yield'
];

let currentAlras = 'EN ALRAS';

function selectAlras(alras) {
  currentAlras = alras;
  const isHist = alras === 'HIST ALRAS';
  document.querySelector('header .brand h1').textContent = `HPCCSS 5B ${alras}`;
  document.getElementById('hero-title').textContent = `${alras} - Section`;
  document.getElementById('hero-description').innerHTML = isHist
    ? `Available Features: <br>- Common Abbreviations <br>- Cold War Notes <br>- Hong Kong History Notes <br>- Japan History Notes`
    : `Available Features: <br>- Generic Vocabulary Flashcards <br>- Wordle`;

  const primaryTitle = document.getElementById('primary-feature-title');
  const primaryDesc = document.getElementById('primary-feature-desc');
  const primaryCard = document.getElementById('primary-feature-card');
  const secondaryTitle = document.getElementById('secondary-feature-title');
  const secondaryDesc = document.getElementById('secondary-feature-desc');
  const secondaryCard = document.getElementById('secondary-feature-card');
  const tertiaryCard = document.getElementById('tertiary-feature-card');
  const quaternaryCard = document.getElementById('quaternary-feature-card');

  if (isHist) {
    primaryTitle.textContent = 'Common Abbreviations';
    primaryDesc.textContent = 'Open the HIST ALRAS abbreviations table for regional, country, policy, politics, and military terms.';
    primaryCard.setAttribute('onclick', 'openHistoryAbbreviations()');
    secondaryTitle.textContent = 'Cold War Notes';
    secondaryDesc.textContent = 'Open the HIST ALRAS Cold War notes table from the course reference.';
    secondaryCard.setAttribute('onclick', 'openColdWarNotes()');
    tertiaryCard.style.display = 'block';
    quaternaryCard.style.display = 'block';
  } else {
    primaryTitle.textContent = 'Generic Vocabulary Flashcards';
    primaryDesc.textContent = 'Tap to enter the built-in flashcard trainer and practice 50+ vocabulary words with meanings and example sentences.';
    primaryCard.setAttribute('onclick', 'openFlashcards()');
    secondaryTitle.textContent = 'Wordle Game';
    secondaryDesc.textContent = 'Challenge yourself with the popular word-guessing game. Guess the five-letter word in 6 attempts using vocabulary from your course.';
    secondaryCard.setAttribute('onclick', 'openWordle()');
    tertiaryCard.style.display = 'none';
    quaternaryCard.style.display = 'none';
  }

  document.querySelectorAll('.alras-item').forEach((btn) => {
    btn.classList.toggle('active', btn.textContent === alras);
  });
  document.getElementById('sidebar-update-logs').classList.remove('active');
  document.querySelector('#update-logs-app .app-header p').textContent = `View recent updates and improvements to ${alras}.`;
  document.querySelector('#wordle-app .app-header p').textContent = `Guess the five-letter vocabulary word in 6 attempts.`;
  showLanding();
}

let wordleState = {
  currentWord: '',
  guesses: [],
  attempts: 6,
  gameOver: false,
  won: false,
  usedWords: [],
  remainingWords: [...wordleVocabulary]
};

function initializeWordle() {
  // Reset remaining words if all have been used
  if (wordleState.remainingWords.length === 0) {
    wordleState.remainingWords = [...wordleVocabulary];
  }
  
  // Pick a random word
  const randomIndex = Math.floor(Math.random() * wordleState.remainingWords.length);
  wordleState.currentWord = wordleState.remainingWords[randomIndex].toUpperCase();
  wordleState.usedWords.push(wordleState.currentWord);
  
  // Remove the word from remaining words
  wordleState.remainingWords.splice(randomIndex, 1);
  
  // Reset game state
  wordleState.guesses = [];
  wordleState.attempts = 6;
  wordleState.gameOver = false;
  wordleState.won = false;
  
  // Update display
  updateWordleDisplay();
  document.getElementById('guess-input').disabled = false;
  document.getElementById('guess-input').focus();
  document.getElementById('guess-input').value = '';
  document.getElementById('new-game-btn').style.display = 'none';
}

function updateWordleDisplay() {
  const letterCounts = {};
  for (let char of wordleState.currentWord) {
    letterCounts[char] = (letterCounts[char] || 0) + 1;
  }

  // Display word with revealed letters
  let display = '';
  for (let i = 0; i < wordleState.currentWord.length; i++) {
    let letter = wordleState.currentWord[i];
    let isRevealed = false;
    
    for (let guess of wordleState.guesses) {
      if (guess[i].letter === letter && guess[i].state === 'correct') {
        isRevealed = true;
        break;
      }
    }
    
    display += isRevealed ? letter : '_';
  }
  document.getElementById('word-display').textContent = display.split('').join(' ');

  // Display guesses
  let guessesList = '';
  for (let guess of wordleState.guesses) {
    let guessLine = '<div class="guess-line">';
    for (let letterObj of guess) {
      guessLine += `<span class="letter-box ${letterObj.state}">${letterObj.letter}</span>`;
    }
    guessLine += '</div>';
    guessesList += guessLine;
  }
  document.getElementById('guesses-list').innerHTML = guessesList;

  // Update attempts
  document.getElementById('attempts-text').textContent = `Attempts remaining: ${wordleState.attempts}`;

  // Update status
  let statusText = '';
  if (wordleState.won) {
    statusText = '<span class="status-win">🎉 You Won! The word was ' + wordleState.currentWord + '</span>';
  } else if (wordleState.gameOver) {
    statusText = '<span class="status-lose">Game Over! The word was ' + wordleState.currentWord + '</span>';
  }
  document.getElementById('wordle-status').innerHTML = statusText;
}

function handleGuessKeydown(event) {
  if (event.key === 'Enter') {
    submitGuess();
  }
}

function submitGuess() {
  if (wordleState.gameOver || wordleState.won) {
    document.getElementById('new-game-btn').style.display = 'block';
    return;
  }

  const input = document.getElementById('guess-input').value.toUpperCase();
  
  if (input.length !== 5) {
    alert('Please enter a 5-letter word');
    return;
  }

  const letterCounts = {};
  for (let char of wordleState.currentWord) {
    letterCounts[char] = (letterCounts[char] || 0) + 1;
  }

  // Evaluate the guess
  let guessArray = [];
  for (let i = 0; i < input.length; i++) {
    const letter = input[i];
    let state = 'absent';

    if (letter === wordleState.currentWord[i]) {
      state = 'correct';
      letterCounts[letter]--;
    } else if (wordleState.currentWord.includes(letter) && letterCounts[letter] > 0) {
      state = 'present';
      letterCounts[letter]--;
    }

    guessArray.push({ letter, state });
  }

  wordleState.guesses.push(guessArray);
  wordleState.attempts--;

  // Check if word is correct
  if (input === wordleState.currentWord) {
    wordleState.won = true;
    wordleState.gameOver = true;
  } else if (wordleState.attempts === 0) {
    wordleState.gameOver = true;
  }

  if (wordleState.gameOver || wordleState.won) {
    document.getElementById('new-game-btn').style.display = 'block';
    document.getElementById('guess-input').disabled = true;
  }

  updateWordleDisplay();
  document.getElementById('guess-input').value = '';
  document.getElementById('guess-input').focus();
}

function openWordle() {
  document.getElementById('flashcard-app').style.display = 'none';
  document.getElementById('history-table-app').style.display = 'none';
  document.getElementById('cold-war-app').style.display = 'none';
  document.getElementById('update-logs-app').style.display = 'none';
  document.getElementById('wordle-app').style.display = 'block';
  initializeWordle();
  document.getElementById('guess-input').disabled = false;
  document.getElementById('wordle-app').scrollIntoView({ behavior: 'smooth' });
}

function openHistoryAbbreviations() {
  document.getElementById('flashcard-app').style.display = 'none';
  document.getElementById('history-table-app').style.display = 'block';
  document.getElementById('cold-war-app').style.display = 'none';
  document.getElementById('update-logs-app').style.display = 'none';
  document.getElementById('wordle-app').style.display = 'none';
  document.querySelector('.hero').style.display = 'none';
  document.getElementById('history-table-app').scrollIntoView({ behavior: 'smooth' });
}

function openColdWarNotes() {
  document.getElementById('flashcard-app').style.display = 'none';
  document.getElementById('history-table-app').style.display = 'none';
  document.getElementById('cold-war-app').style.display = 'block';
  document.getElementById('hk-history-app').style.display = 'none';
  document.getElementById('update-logs-app').style.display = 'none';
  document.getElementById('wordle-app').style.display = 'none';
  document.querySelector('.hero').style.display = 'none';
  document.getElementById('cold-war-app').scrollIntoView({ behavior: 'smooth' });
}

function openHkHistoryNotes() {
  document.getElementById('flashcard-app').style.display = 'none';
  document.getElementById('history-table-app').style.display = 'none';
  document.getElementById('cold-war-app').style.display = 'none';
  document.getElementById('hk-history-app').style.display = 'block';
  document.getElementById('jp-history-app').style.display = 'none';
  document.getElementById('update-logs-app').style.display = 'none';
  document.getElementById('wordle-app').style.display = 'none';
  document.querySelector('.hero').style.display = 'none';
  document.getElementById('hk-history-app').scrollIntoView({ behavior: 'smooth' });
}

function openJpHistoryNotes() {
  document.getElementById('flashcard-app').style.display = 'none';
  document.getElementById('history-table-app').style.display = 'none';
  document.getElementById('cold-war-app').style.display = 'none';
  document.getElementById('hk-history-app').style.display = 'none';
  document.getElementById('jp-history-app').style.display = 'block';
  document.getElementById('update-logs-app').style.display = 'none';
  document.getElementById('wordle-app').style.display = 'none';
  document.querySelector('.hero').style.display = 'none';
  document.getElementById('jp-history-app').scrollIntoView({ behavior: 'smooth' });
}

function showLanding() {
  document.querySelector('main').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('flashcard-app').style.display = 'none';
  document.getElementById('history-table-app').style.display = 'none';
  document.getElementById('cold-war-app').style.display = 'none';
  document.getElementById('hk-history-app').style.display = 'none';
  document.getElementById('jp-history-app').style.display = 'none';
  document.getElementById('update-logs-app').style.display = 'none';
  document.getElementById('wordle-app').style.display = 'none';
  document.querySelector('.hero').style.display = 'grid';
  document.querySelector('header .brand h1').textContent = `HPCCSS 5B ${currentAlras}`;
}

function openFlashcards() {
  document.getElementById('flashcard-app').style.display = 'block';
  document.getElementById('history-table-app').style.display = 'none';
  document.getElementById('cold-war-app').style.display = 'none';
  document.getElementById('update-logs-app').style.display = 'none';
  document.getElementById('wordle-app').style.display = 'none';
  document.getElementById('loading').style.display = 'block';
  document.getElementById('app').style.display = 'none';
  renderCard();
  document.querySelector('.hero').style.display = 'grid';
  document.getElementById('flashcard-app').scrollIntoView({ behavior: 'smooth' });
}

function openUpdateLogs() {
  document.getElementById('flashcard-app').style.display = 'none';
  document.getElementById('history-table-app').style.display = 'none';
  document.getElementById('cold-war-app').style.display = 'none';
  document.getElementById('update-logs-app').style.display = 'block';
  document.getElementById('wordle-app').style.display = 'none';
  document.querySelector('.hero').style.display = 'none';
  document.querySelector('header .brand h1').textContent = 'HPCCSS 5B ALRAS Update Logs';
  document.querySelectorAll('.alras-item').forEach((btn) => btn.classList.remove('active'));
  document.getElementById('sidebar-update-logs').classList.add('active');
  document.getElementById('update-logs-app').scrollIntoView({ behavior: 'smooth' });
}

window.addEventListener('load', () => {
  document.getElementById('flashcard-app').style.display = 'none';
  document.getElementById('history-table-app').style.display = 'none';
  document.getElementById('cold-war-app').style.display = 'none';
  document.getElementById('update-logs-app').style.display = 'none';
  document.getElementById('wordle-app').style.display = 'none';
  selectAlras(currentAlras);
  if (typeof cards !== 'undefined' && cards.length === 0) {
    document.getElementById('loading').innerText = 'No data found.';
  }
});
