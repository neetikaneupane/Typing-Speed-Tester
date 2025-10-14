const paragraphPools = {
  easy: [
    "The quick brown fox jumps over the lazy dog. This is a simple typing test that will help you practice your skills. Keep going and you will see improvement over time. Practice makes perfect in everything you do. The more you type, the faster and more accurate you will become. Remember to focus on accuracy first, then speed will follow naturally. Stay focused and maintain a steady rhythm as you type each word carefully.",
    "Learning to type well is an important skill in today's world. Many jobs require good typing abilities. Take your time and focus on building good habits from the start. Typing tests help you track your progress over time. You can see your speed improve with each practice session. Stay motivated and keep practicing every day for best results. Consistency is the key to becoming a proficient typist.",
    "The key to success is consistent practice and patience. Do not rush through the exercises. Take breaks when you feel tired and come back refreshed. Building muscle memory takes time and dedication. Your fingers will learn the keyboard layout naturally. Focus on proper finger placement and posture. Good habits formed early will benefit you for years to come.",
    "Reading books helps expand your vocabulary and knowledge. The more you read, the more words you will encounter. This diversity strengthens your typing ability over time. Different genres offer unique writing styles to practice. Fiction and non-fiction each present their own challenges. Technical writing requires precision and accuracy. Literary works flow with rhythm and creative expression.",
    "Setting small goals helps you stay motivated during practice. Celebrate each milestone you achieve along the way. Track your words per minute to see tangible progress. Accuracy is more important than raw speed at first. Speed will naturally increase as you build confidence. Don't get discouraged by mistakes or slow starts. Every expert was once a beginner just like you."
  ],
  medium: [
    "JavaScript is a versatile programming language used for web development. It allows developers to create dynamic and interactive websites. Modern applications rely heavily on JavaScript frameworks and libraries to function efficiently. Functions are fundamental building blocks in programming. They help organize code into reusable pieces that can be called multiple times. Understanding functions is essential for writing clean and maintainable code in any language. Mastering these concepts takes practice and dedication to the craft.",
    "Variables store data that can be accessed and modified throughout your program. Choosing descriptive variable names makes your code easier to understand. Good naming conventions are crucial for collaborative development projects. Arrays and objects are essential data structures in JavaScript. They allow you to store and manipulate collections of data efficiently. Mastering these concepts will significantly improve your programming capabilities and problem-solving skills. Software development requires continuous learning and adaptation to new technologies.",
    "Practice coding challenges regularly to sharpen your skills. The more problems you solve, the better you become at recognizing patterns. Challenge yourself with increasingly difficult tasks to accelerate your learning journey. Algorithm design requires logical thinking and creativity. Breaking down complex problems into smaller steps makes them manageable. Testing your code thoroughly prevents bugs from reaching production. Code reviews help you learn from experienced developers.",
    "Web developers need to understand both frontend and backend technologies. The frontend handles what users see and interact with directly. The backend manages data storage and business logic behind the scenes. Databases store information that applications need to function properly. APIs connect different systems and allow them to communicate effectively. Security considerations must be built into every layer of the application. Performance optimization ensures users have a smooth experience.",
    "Version control systems help teams collaborate on code projects. Git has become the industry standard for tracking changes. Branches allow developers to work on features independently. Merge conflicts occur when multiple people edit the same files. Pull requests facilitate code review before merging changes. Continuous integration automates testing and deployment processes. DevOps practices bridge the gap between development and operations teams."
  ],
  hard: [
    "Asynchronous programming paradigms facilitate concurrent operations without blocking execution threads. Understanding the event loop mechanism is quintessential for developing sophisticated applications that require optimal performance and responsiveness. The juxtaposition of various algorithmic approaches reveals the inherent complexity of computational problems. Ephemeral data structures provide temporary storage solutions while maintaining efficiency. Obfuscation techniques often obscure the underlying implementation details from casual observation. Comprehensive documentation becomes increasingly important as system complexity grows. Maintaining code quality requires discipline and adherence to established conventions.",
    "Heterogeneous systems present unique challenges in distributed computing environments. The quintessence of robust architecture lies in anticipating failure modes and implementing comprehensive error handling strategies throughout the application lifecycle. Synthesis of disparate methodologies enables innovative solutions to intractable problems. Ubiquitous connectivity has fundamentally transformed how we approach software design and implementation. The dichotomy between theoretical elegance and practical implementation remains ever-present in software engineering. Scalability concerns must be addressed from the initial design phase. Performance bottlenecks often emerge unexpectedly in production environments.",
    "Paradigm shifts in technology necessitate continuous adaptation and learning throughout your career. Quintessential principles of computer science transcend specific languages or frameworks and remain relevant. Understanding fundamental concepts provides a solid foundation for tackling any technical challenge that arises. Microservices architecture decomposes monolithic applications into smaller, manageable components that can scale independently. Containerization technologies enable consistent deployment across different environments and platforms. Orchestration tools automate the management of complex distributed systems at scale. Cloud computing has revolutionized infrastructure provisioning and resource allocation.",
    "Cryptographic algorithms ensure data confidentiality and integrity across untrusted networks and storage systems. Hash functions create unique fingerprints for data verification and password storage purposes. Public key infrastructure enables secure communication between parties without prior key exchange. Blockchain technology leverages cryptographic principles to create immutable distributed ledgers for transactions. Consensus mechanisms ensure agreement among distributed nodes in decentralized networks without central authority. Smart contracts execute automatically when predetermined conditions are met on the blockchain. Decentralization introduces new paradigms for building trustless systems and applications.",
    "Machine learning algorithms discover patterns in data without explicit programming instructions or rules. Neural networks model complex relationships through interconnected layers of artificial neurons that process information. Deep learning architectures extract hierarchical features from raw data automatically through training processes. Natural language processing enables computers to understand and generate human language effectively. Computer vision systems interpret visual information from images and video streams with remarkable accuracy. Reinforcement learning agents learn optimal strategies through trial and error interactions with environments. Transfer learning leverages knowledge from one domain to accelerate learning in related domains."
  ]
};

const promptEl = document.getElementById('prompt');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
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
  try {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    const score = saved ? parseInt(saved, 10) : 0;
    highScoreEl.textContent = score;
    return score;
  } catch (e) {
    highScoreEl.textContent = '0';
    return 0;
  }
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
  updateMetrics(true);
  saveHighScore();
}

function saveHighScore() {
  const currentWpm = parseInt(wpmEl.textContent, 10) || 0;
  try {
    const prev = localStorage.getItem(HIGH_SCORE_KEY);
    const prevScore = prev ? parseInt(prev, 10) : 0;
    if (currentWpm > prevScore) {
      localStorage.setItem(HIGH_SCORE_KEY, currentWpm.toString());
      highScoreEl.textContent = currentWpm;
      alert('New high score! ' + currentWpm + ' WPM');
    }
  } catch (e) {
    console.error('Could not save high score:', e);
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

document.addEventListener('keydown', (e) => {
  if (!running) return;
  
  if (e.key === 'Backspace') {
    e.preventDefault();
    if (currentIndex === 0) return;
    
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
    return;
  }
  
  if (e.key.length === 1 && currentIndex < currentText.length) {
    e.preventDefault();
    const typedChar = e.key;
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
});

newPromptBtn.addEventListener('click', () => {
  currentText = getRandomParagraph(difficultySelect.value);
  currentIndex = 0;
  errorPositions.clear();
  renderPrompt();
  if (running) {
    stopGame();
  }
});

startBtn.addEventListener('click', () => startGame());

resetBtn.addEventListener('click', () => {
  clearInterval(timer);
  running = false;
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
