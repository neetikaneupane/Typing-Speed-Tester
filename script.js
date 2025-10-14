const paragraphPools = {
  easy: [
    "The quick brown fox jumps over the lazy dog. This is a simple typing test that will help you practice your skills. Keep going and you will see improvement over time.",
    "Practice makes perfect in everything you do. The more you type, the faster and more accurate you will become. Remember to focus on accuracy first, then speed will follow naturally.",
    "Learning to type well is an important skill in today's world. Many jobs require good typing abilities. Take your time and focus on building good habits from the start.",
    "Typing tests help you track your progress over time. You can see your speed improve with each practice session. Stay motivated and keep practicing every day for best results.",
    "The key to success is consistent practice and patience. Do not rush through the exercises. Take breaks when you feel tired and come back refreshed."
  ],
  medium: [
    "JavaScript is a versatile programming language used for web development. It allows developers to create dynamic and interactive websites. Modern applications rely heavily on JavaScript frameworks and libraries to function efficiently.",
    "Functions are fundamental building blocks in programming. They help organize code into reusable pieces that can be called multiple times. Understanding functions is essential for writing clean and maintainable code in any language.",
    "Variables store data that can be accessed and modified throughout your program. Choosing descriptive variable names makes your code easier to understand. Good naming conventions are crucial for collaborative development projects.",
    "Arrays and objects are essential data structures in JavaScript. They allow you to store and manipulate collections of data efficiently. Mastering these concepts will significantly improve your programming capabilities and problem-solving skills.",
    "Practice coding challenges regularly to sharpen your skills. The more problems you solve, the better you become at recognizing patterns. Challenge yourself with increasingly difficult tasks to accelerate your learning journey."
  ],
  hard: [
    "Asynchronous programming paradigms facilitate concurrent operations without blocking execution threads. Understanding the event loop mechanism is quintessential for developing sophisticated applications that require optimal performance and responsiveness.",
    "The juxtaposition of various algorithmic approaches reveals the inherent complexity of computational problems. Ephemeral data structures provide temporary storage solutions while maintaining efficiency. Obfuscation techniques often obscure the underlying implementation details.",
    "Heterogeneous systems present unique challenges in distributed computing environments. The quintessence of robust architecture lies in anticipating failure modes and implementing comprehensive error handling strategies throughout the application lifecycle.",
    "Synthesis of disparate methodologies enables innovative solutions to intractable problems. Ubiquitous connectivity has fundamentally transformed how we approach software design. The dichotomy between theoretical elegance and practical implementation remains ever-present.",
    "Paradigm shifts in technology necessitate continuous adaptation and learning. Quintessential principles of computer science transcend specific languages or frameworks. Understanding fundamental concepts provides a solid foundation for tackling any technical challenge."
  ]
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

let currentText = '';
let currentIndex = 0;
let timer = null;
let timeLeft = parseInt(timeSelect.value, 10);
let running = false;
let totalTyped = 0;
let correctChars = 0;
let errorCount = 0;
let startTime = null;
let errorPositions = new Set();

const HIGH_SCORE_KEY = 'typing_high_score_v2';

function loadHighScore() {
  const v = parseInt(highScoreEl.textContent, 10) || 0;
  highScoreEl.textContent = v;
}

function getRandomParagraph(difficulty = 'medium') {
  const pool = paragraphPools[difficulty] || paragraphPools.medium;
  return pool[Math.floor(Math.random() * pool.length)];
}

function renderPrompt() {
  promptEl.innerHTML = '';
  for (let i = 0; i < currentText.length; i++) {
    const span = document.createElement('span');
    span.textContent = currentText[i];
    span.className = 'char';
    
    if (i < currentIndex) {
      span.classList.add('typed');
      if (errorPositions.has(i)) {
        span.style.textDecoration = 'underline';
        span.style.textDecorationColor = '#ef4444';
        span.style.textDecorationThickness = '2px';
        span.style.color = '#ef4444';
      } else {
        span.style.color = '#86efac';
      }
    } else if (i === currentIndex) {
      span.style.backgroundColor = '#3b82f6';
      span.style.color = 'white';
    }
    
    promptEl.appendChild(span);
  }
}

function resetStats() {
  totalTyped = 0;
  correctChars = 0;
  errorCount = 0;
  errorPositions.clear();
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
  currentIndex = 0;
  startBtn.textContent = 'Running...';
  inputEl.disabled = false;
  inputEl.value = '';
  inputEl.focus();
  startTime = Date.now();
  renderPrompt();

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
  const prev = parseInt(highScoreEl.textContent, 10) || 0;
  if (currentWpm > prev) {
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
  if (!running) return;
  
  const typedChar = e.data;
  if (typedChar && currentIndex < currentText.length) {
    const expectedChar = currentText[currentIndex];
    totalTyped++;
    
    if (typedChar === expectedChar) {
      correctChars++;
    } else {
      errorCount++;
      errorPositions.add(currentIndex);
    }
    
    currentIndex++;
    renderPrompt();
    updateMetrics();
    
    if (currentIndex >= currentText.length) {
      stopGame();
    }
  }
  
  inputEl.value = '';
});

inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Backspace') {
    e.preventDefault();
    if (!running || currentIndex === 0) return;
    
    currentIndex--;
    if (!errorPositions.has(currentIndex)) {
      totalTyped--;
      correctChars--;
    } else {
      totalTyped--;
      errorCount--;
      errorPositions.delete(currentIndex);
    }
    
    renderPrompt();
    updateMetrics();
  }
});

skipBtn.addEventListener('click', () => {
  if (!running) return;
  if (currentIndex < currentText.length) {
    errorPositions.add(currentIndex);
    errorCount++;
    totalTyped++;
    currentIndex++;
    renderPrompt();
    updateMetrics();
  }
});

newPromptBtn.addEventListener('click', () => {
  currentText = getRandomParagraph(difficultySelect.value);
  currentIndex = 0;
  errorPositions.clear();
  inputEl.value = '';
  renderPrompt();
  if (running) {
    stopGame();
  }
});

startBtn.addEventListener('click', () => startGame());

resetBtn.addEventListener('click', () => {
  clearInterval(timer);
  running = false;
  inputEl.disabled = true;
  inputEl.value = '';
  currentIndex = 0;
  errorPositions.clear();
  currentText = getRandomParagraph(difficultySelect.value);
  timeLeft = parseInt(timeSelect.value, 10);
  timeLeftEl.textContent = timeLeft;
  startBtn.textContent = 'Start';
  resetStats();
  renderPrompt();
});

difficultySelect.addEventListener('change', () => {
  currentText = getRandomParagraph(difficultySelect.value);
  currentIndex = 0;
  errorPositions.clear();
  inputEl.value = '';
  renderPrompt();
  if (running) {
    stopGame();
  }
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
    errors: errorCount,
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

currentText = getRandomParagraph(difficultySelect.value);
timeLeft = parseInt(timeSelect.value, 10);
renderPrompt();
resetStats();
loadHighScore();

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !running) { startGame(); }
});
