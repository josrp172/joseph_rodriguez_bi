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
          if (secsLeft === 0) this.finishQuestion(false, 0);
          else if (secsLeft <= 10)
            document.getElementById('quizTimer').classList.add('warning');
        });
    },
     finishQuestion: async function(correct, secsLeft) {
     const totalTime = Number(localStorage.getItem('quiz::timer')) || 30;
     const score = correct
       ? Math.round(70 + (secsLeft / totalTime) * 30)
       : 0;
      const scores = JSON.parse(localStorage.getItem(SCORE_KEY) || '[]');
      scores.push(score);
      localStorage.setItem(SCORE_KEY, JSON.stringify(scores));

      // — NEW: tell the server my updated total —
      const total = scores.reduce((a,b) => a + b, 0);
      const progress = Number(sessionStorage.getItem(IDX_KEY) ?? 0);
      window.quizSocket.emit('submit_score', { total, progress });

      let idx = Number(sessionStorage.getItem(IDX_KEY) ?? 0);
      sessionStorage.setItem(IDX_KEY, ++idx);

      const bank = await loadBank();
     if (idx >= bank.length) {
      location.replace('/quiz/final_ranking');
    } else {
      location.replace('/quiz/initial_ranking'); // Always visit initial_ranking before each question
    }
    },
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

