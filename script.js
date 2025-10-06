
const wordPools = {
  easy: `the quick brown fox jumps over the lazy dog this is a simple typing test practice makes perfect keep going`.split(' '),
  medium: (`javascript function variable object array string keyboard timer accuracy speed challenge practice random sentence typing game rapid focus`).split(' '),
  hard: (`synthesis asynchronous juxtaposition paradigm ubiquitous ephemeral obfuscate dichotomy quintessence algorithmic heterogenous quintessential`).split(' ')
};


const promptEl = document.getElementById('prompt');
const inputEl = document.getElementById('textInput');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const skipBtn = document.getElementById('skipBtn');
const newPromptBtn = document.getElementById('newPromptBtn');
const timeSelect = document.getElementById('timeSelect');
const difficultySelect = document.getElementById('difficulty');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const timeLeftEl = document.getElementById('timeLeft');
const charsTypedEl = document.getElementById('charsTyped');
const correctCharsEl = document.getElementById('correctChars');
const errorsEl = document.getElementById('errors');
const highScoreEl = document.getElementById('highScore');
const downloadBtn = document.getElementById('downloadBtn');


let words = [];
let currentIndex = 0;
let timer = null;
let timeLeft = parseInt(timeSelect.value, 10);
let running = false;
let totalTyped = 0;
let correctChars = 0;
let errorCount = 0;
let startTime = null;

const HIGH_SCORE_KEY = 'typing_high_score_v1';

function loadHighScore() {
  const v = localStorage.getItem(HIGH_SCORE_KEY) || '0';
  highScoreEl.textContent = v;
}

function generateWords(difficulty = 'medium', amount = 30) {
  const pool = wordPools[difficulty] || wordPools.medium;
  const arr = [];
  for (let i = 0; i < amount; i++) arr.push(pool[Math.floor(Math.random() * pool.length)]);
  return arr;
}

function renderPrompt() {
  promptEl.innerHTML = '';
  words.forEach((w, i) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = w + (i < words.length - 1 ? ' ' : '');
    if (i < currentIndex) span.classList.add('correct');
    if (i === currentIndex) span.style.textDecoration = 'underline';
    promptEl.appendChild(span);
  });
 
  const curr = promptEl.querySelectorAll('.word')[currentIndex];
  if (curr) curr.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
}

function resetStats() {
  totalTyped = 0;
  correctChars = 0;
  errorCount = 0;
  wpmEl.textContent = '0';
  accuracyEl.textContent = '100%';
  charsTypedEl.textContent = '0';
  correctCharsEl.textContent = '0';
  errorsEl.textContent = '0';
}

function startGame() {
  if (running) return;
  running = true;
  timeLeft = parseInt(timeSelect.value, 10);
  timeLeftEl.textContent = timeLeft;
  resetStats();
  startBtn.textContent = 'Running...';
  inputEl.disabled = false;
  inputEl.focus();
  startTime = Date.now();

  timer = setInterval(() => {
    timeLeft--;
    timeLeftEl.textContent = timeLeft;
    updateMetrics();
    if (timeLeft <= 0) {
      stopGame();
    }
  }, 1000);
}

function stopGame() {
  running = false;
  clearInterval(timer);
  startBtn.textContent = 'Start';
  inputEl.disabled = true;
  updateMetrics(true);
  saveHighScore();
}

function saveHighScore() {
  const currentWpm = parseInt(wpmEl.textContent, 10) || 0;
  const prev = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10);
  if (currentWpm > prev) {
    localStorage.setItem(HIGH_SCORE_KEY, currentWpm);
    highScoreEl.textContent = currentWpm;
    alert('New high score! ' + currentWpm + ' WPM');
  }
}

function updateMetrics(final = false) {
  const minutes = (parseInt(timeSelect.value, 10) - timeLeft) / 60 || 1 / 60;
  const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
  wpmEl.textContent = final ? wpm : Math.max(0, wpm);
  const acc = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
  accuracyEl.textContent = acc + '%';
  charsTypedEl.textContent = totalTyped;
  correctCharsEl.textContent = correctChars;
  errorsEl.textContent = errorCount;
}


inputEl.addEventListener('input', (e) => {
  const val = e.target.value;
  if (!running) return;
  
  const target = words[currentIndex] || '';
  totalTyped += 1; // count keystroke
 
  let correctSoFar = 0;
  for (let i = 0; i < val.length; i++) if (val[i] === target[i]) correctSoFar++;
  
  const errorsNow = val.length - correctSoFar;

  const spans = promptEl.querySelectorAll('.word');
  spans.forEach((s, idx) => {
    s.classList.remove('incorrect');
    s.classList.remove('correct');
    s.style.textDecoration = '';
    if (idx < currentIndex) s.classList.add('correct');
    if (idx === currentIndex) s.style.textDecoration = 'underline';
  });
 
  const currSpan = spans[currentIndex];
  if (currSpan) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < target.length; i++) {
      const chSpan = document.createElement('span');
      const typedChar = val[i];
      chSpan.textContent = target[i];
      if (typedChar == null) { /* untouched */ }
      else if (typedChar === target[i]) chSpan.style.color = '#86efac';
      else chSpan.style.color = '#fb7185';
      frag.appendChild(chSpan);
    }
    
    currSpan.innerHTML = '';
    currSpan.appendChild(frag);
  }

});


inputEl.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    if (!running) return;
    const typed = inputEl.value.trim();
    const target = words[currentIndex] || '';
    // count correct chars for this word
    for (let i = 0; i < Math.max(typed.length, target.length); i++) {
      const a = typed[i] || '';
      const b = target[i] || '';
      totalTyped++;
      if (a === b) correctChars++;
      else errorCount++;
    }
    
    if (typed === target) {
      const spans = promptEl.querySelectorAll('.word');
      if (spans[currentIndex]) spans[currentIndex].classList.add('correct');
    } else {
      const spans = promptEl.querySelectorAll('.word');
      if (spans[currentIndex]) spans[currentIndex].classList.add('incorrect');
    }
    currentIndex++;
    inputEl.value = '';
    renderPrompt();
    updateMetrics();
  }
});

skipBtn.addEventListener('click', () => {
  if (!running) return;
  currentIndex++;
  inputEl.value = '';
  renderPrompt();
});

newPromptBtn.addEventListener('click', () => {
  words = generateWords(difficultySelect.value, 40);
  currentIndex = 0;
  renderPrompt();
});

startBtn.addEventListener('click', () => startGame());
resetBtn.addEventListener('click', () => {
  clearInterval(timer);
  running = false;
  inputEl.disabled = true;
  inputEl.value = '';
  currentIndex = 0;
  words = generateWords(difficultySelect.value, 40);
  timeLeft = parseInt(timeSelect.value, 10);
  timeLeftEl.textContent = timeLeft;
  startBtn.textContent = 'Start';
  resetStats();
  renderPrompt();
});

difficultySelect.addEventListener('change', () => {
  words = generateWords(difficultySelect.value, 40);
  currentIndex = 0;
  inputEl.value = '';
  renderPrompt();
});

timeSelect.addEventListener('change', () => {
  timeLeft = parseInt(timeSelect.value, 10);
  timeLeftEl.textContent = timeLeft;
});

downloadBtn.addEventListener('click', () => {
  const data = {
    wpm: wpmEl.textContent,
    accuracy: accuracyEl.textContent,
    time: timeSelect.value,
    date: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'typing_result.json';
  a.click();
  URL.revokeObjectURL(url);
});


words = generateWords(difficultySelect.value, 40);
timeLeft = parseInt(timeSelect.value, 10);
renderPrompt();
resetStats();
loadHighScore();


document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !running) { startGame(); }
});

