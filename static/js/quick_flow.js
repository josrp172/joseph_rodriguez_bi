// quiz_flow.js
(() => {
  // CONSTANTS
  const TXT_URL = '/static/quiz/quiz_questions.txt';
  const Q_KEY   = 'quiz::questions';
  const IDX_KEY = 'quiz::currentIdx';
  const SCORE_KEY = 'quiz::scores';

  // HELPERS
async function loadBank() {
  const Q_KEY = 'quiz::questions';
  // 1. Prefer loaded form from localStorage (set by admin "Choose Questionnaire" modal)
  if (localStorage.getItem(Q_KEY)) {
    try {
      return JSON.parse(localStorage.getItem(Q_KEY));
    } catch (e) {
      // fallback if parsing fails, clear broken data
      localStorage.removeItem(Q_KEY);
    }
  }
  // 2. Fallback: load default quiz_questions.txt from server
  try {
    const raw = await fetch('/static/quiz/quiz_questions.txt').then(r => r.text());
    // Support multiple blocks separated by "---", parse each one
    const blocks = raw
      .trim()
      .split(/^---$/m)
      .map(b => {
        // Remove JS-style comments
        const sanitized = b.replace(/\/\/.*$/gm, '');
        try {
          return JSON.parse(sanitized);
        } catch (e) {
          console.warn("Failed to parse block:", e, sanitized);
          return null;
        }
      })
      .filter(Boolean);
    localStorage.setItem(Q_KEY, JSON.stringify(blocks));
    return blocks;
  } catch (e) {
    alert("Error loading questions.");
    return [];
  }
}
function nextPath(type) {
  return ({
    multiple_choice:    '/quiz/form/quiz_multiple_choice',
    fill_in_blank:      '/quiz/form/quiz_fill_in_blank',
    match:              '/quiz/form/quiz_match',
    drag_and_drop:      '/quiz/form/drag_drop',
    categorize:         '/quiz/form/categorize',
    target_shooter:     '/quiz/form/target_shooter',
    memory_match:       '/quiz/form/memory_match'
  })[type];
}

  // PUBLIC API
  window.quizFlow = {
    async initQuestion(renderFn) {
      const bank = await loadBank();
      let idx = Number(sessionStorage.getItem(IDX_KEY) ?? 0);
      const q = bank[idx];
      if (!q) return location.replace('/quiz/initial_ranking');
      renderFn(q, idx + 1, bank.length);
      const globalTimer = Number(localStorage.getItem('quiz::timer')) || 30;
    this.startTimer(globalTimer, secsLeft => {
      if (secsLeft === 0 && typeof window.showFeedback === 'function') {
        window.showFeedback(false);  // <<=== This triggers the feedback flow for this page!
      }
      else if (secsLeft <= 10)
        document.getElementById('quizTimer').classList.add('warning');
    });
    },
finishQuestion: async function(correct, secsLeft, userAnswer = null) {
  const totalTime = Number(localStorage.getItem('quiz::timer')) || 30;
  const score = correct ? Math.round(70 + (secsLeft / totalTime) * 30) : 0;
  const scores = JSON.parse(localStorage.getItem('quiz::scores') || '[]');
  scores.push(score);
  localStorage.setItem('quiz::scores', JSON.stringify(scores));

  const answers = JSON.parse(localStorage.getItem('quiz::answers') || '[]');
  const idx = Number(sessionStorage.getItem(IDX_KEY) ?? 0);
  const bank = await loadBank();
  const questionObj = bank[idx];

  // Prepare answerObj with adaptive logic per question type
  let answerObj = {
    question: questionObj.question,
    type: questionObj.type,
    isCorrect: correct,
    score: score,
    explanation: (userAnswer && userAnswer.explanation) || questionObj.explanation || null,
    raw: questionObj
  };

  // Now store details per type
  switch (questionObj.type) {
    case 'multiple_choice':
      answerObj.choices = (userAnswer && userAnswer.choices) || questionObj.choices || null;
      answerObj.userAnswer = (userAnswer && userAnswer.userAnswer) || userAnswer || null;
      answerObj.correctAnswer = (userAnswer && userAnswer.correctAnswer) || questionObj.answer || questionObj.correctAnswer || null;
      break;

    case 'fill_in_blank':
      answerObj.userAnswer = (userAnswer && userAnswer.userAnswer) || userAnswer || null;
      answerObj.correctAnswer = (userAnswer && userAnswer.correctAnswer) || questionObj.answer || questionObj.correctAnswer || null;
      break;

    case 'match':
      answerObj.left = (userAnswer && userAnswer.left) || questionObj.left || null;
      answerObj.right = (userAnswer && userAnswer.right) || questionObj.right || null;
      answerObj.userMapping = (userAnswer && userAnswer.mapping) || null;
      answerObj.correctMapping = (userAnswer && userAnswer.correctMapping) || questionObj.mapping || null;
      break;

    case 'categorize':
      answerObj.categories = (userAnswer && userAnswer.categories) || Object.keys(questionObj.categories || {}) || null;
      answerObj.items = (userAnswer && userAnswer.items) || (questionObj.items ? questionObj.items.map(i => i.text) : null);
      answerObj.userMapping = (userAnswer && userAnswer.mapping) || null;
      answerObj.correctMapping = (userAnswer && userAnswer.correctMapping) || null;
      break;

    case 'memory_match':
      answerObj.userPairs = (userAnswer && userAnswer.userPairs) || null;
      answerObj.correctPairs = (userAnswer && userAnswer.correctPairs) || null;
      answerObj.totalCards = (userAnswer && userAnswer.totalCards) || null;
      break;

    case 'reorder':
      answerObj.userOrder = (userAnswer && userAnswer.userOrder) || null;
      answerObj.correctOrder = (userAnswer && userAnswer.correctOrder) || null;
      break;

    case 'target_shooter':
      answerObj.options = (userAnswer && userAnswer.options) || (questionObj.options ? questionObj.options.map(opt => opt.text) : null);
      answerObj.correctIdxs = (userAnswer && userAnswer.correctIdxs) || null;
      answerObj.userShotIdxs = (userAnswer && userAnswer.userShotIdxs) || null;
      answerObj.userSelections = (userAnswer && userAnswer.userSelections) || null;
      break;

    // fallback: store userAnswer and correctAnswer if provided
    default:
      answerObj.userAnswer = (userAnswer && userAnswer.userAnswer) || userAnswer || null;
      answerObj.correctAnswer = (userAnswer && userAnswer.correctAnswer) || questionObj.answer || questionObj.correctAnswer || null;
      break;
  }

  answers.push(answerObj);
  localStorage.setItem('quiz::answers', JSON.stringify(answers));

  // Score and progress emission (unchanged)
  const total = scores.reduce((a,b) => a + b, 0);
  window.quizSocket.emit('submit_score', { total, progress: idx });

  sessionStorage.setItem(IDX_KEY, idx + 1);

  window.quizGoNext = function() {
      if (idx + 1 >= bank.length) {
        const answers = JSON.parse(localStorage.getItem('quiz::answers') || '[]');
        const userId = localStorage.getItem('quiz_permanent_user_id');
        const gameId = localStorage.getItem('quiz_game_id');
        console.log("About to emit submit_answers v21", { gameId, userId, answers });

        window.quizSocket.emit('submit_answers', {
          gameId: gameId,
          userId: userId,
          answers: answers
        });

        window.quizSocket.once('answers_saved', (msg) => {
          if (msg.status === 'ok') {
            location.replace('/quiz/final_ranking');
          } else {
            alert('Failed to save answers. Please try again! ' + (msg.error || ''));
          }
        });
      } else {
        location.replace('/quiz/initial_ranking');
      }
    };

}

    ,
    async initRanking() {
      const scores = JSON.parse(localStorage.getItem(SCORE_KEY) || '[]');
      const total = scores.reduce((a, b) => a + b, 0);
      // For single-player: inject score (for multiplayer, integrate socket updates)
      let myScore = document.getElementById('myScore');
      if (myScore) myScore.textContent = total.toFixed(0);
      // After 7s, go to next question or final ranking
      setTimeout(async () => {
        const bank = await loadBank();
        const idx = Number(sessionStorage.getItem(IDX_KEY) ?? 0);
        if (idx >= bank.length) location.replace('/quiz/final_ranking');
        else location.replace(nextPath(bank[idx].type));
      }, 7000);
    },
    startTimer(duration, tick) {
      let remaining = duration;
      const timerEl = document.getElementById('quizTimer');
      timerEl.textContent = remaining;
      const id = setInterval(() => {
        timerEl.textContent = --remaining;
        tick(remaining);
        if (remaining <= 0) clearInterval(id);
      }, 1000);
    }
  };
})();

// ─────────────────────────────────────────────────────────────────
// SOCKET.IO: join the waiting room on every page-load
(function(){
  // will reuse the same socket on every page
  const socket = io({ transports: ['websocket'] });
  socket.on('connect', () => {
      // Always update the current socket id as quiz_user_id

      const avatarIdx = +localStorage.getItem('quizPlayerAvatar') || 0;
      const userName  = localStorage.getItem('quiz_username') || 'Player';
      const scores    = JSON.parse(localStorage.getItem('quiz::scores') || '[]');
      const total     = scores.reduce((a,b) => a + b, 0);
      const progress  = Number(sessionStorage.getItem('quiz::currentIdx') ?? 0);

      socket.emit('join_waiting', { name: userName, avatar: avatarIdx, total, progress });
});
  // if you ever need to push events later:
  window.quizSocket = socket;

  socket.on('force_leave', function() {
  // Clear all local/session storage if you want a clean state
  localStorage.clear();
  sessionStorage.clear();
  // Redirect to the initial page
  window.location.href = "/quiz/start";
});
})();
// ─────────────────────────────────────────────────────────────────

