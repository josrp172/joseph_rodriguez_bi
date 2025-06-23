// quiz_flow.js
(() => {
  // CONSTANTS
  const TXT_URL = '/static/quiz/quiz_questions.txt';
  const Q_KEY   = 'quiz::questions';
  const IDX_KEY = 'quiz::currentIdx';
  const SCORE_KEY = 'quiz::scores';

  // HELPERS
  async function loadBank() {
    try {
  //    if (localStorage.getItem(Q_KEY))
   //     return JSON.parse(localStorage.getItem(Q_KEY));
      const raw = await fetch(TXT_URL).then(r => r.text());
      // after — strip JS-style comments, then parse
const blocks = raw
  .trim()
  .split(/^---$/m)
  .map(b => {
    // remove any // … comment at end of a line
    const sanitized = b.replace(/\/\/.*$/gm, '');
    try {
      return JSON.parse(sanitized);
    } catch (e) {
      console.warn("Failed to parse block:", e);
      return null;
    }
  })
  .filter(Boolean);
      localStorage.setItem(Q_KEY, JSON.stringify(blocks));
      return blocks;
    } catch (e) {
      alert("Error loading questions."); location.replace('quiz_error.html');
      return [];
    }
  }
  function nextPath(type) {
    return ({
    multiple_choice:    '/quiz/form/quiz_multiple_choice',
    fill_in_blank:      '/quiz/form/quiz_fill_in_blank',
    match:              '/quiz/form/quiz_match',
    drag_and_drop:      '/quiz/form/drag_drop',
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
      this.startTimer(30, secsLeft => {
        if (secsLeft === 0) this.finishQuestion(false, 0);
        else if (secsLeft <= 10)
          document.getElementById('quizTimer').classList.add('warning');
      });
    },
     finishQuestion: async function(correct, secsLeft) {
      const score = correct ? 100 - (30 - secsLeft) * 2 : 0;
      const scores = JSON.parse(localStorage.getItem(SCORE_KEY) || '[]');
      scores.push(score);
      localStorage.setItem(SCORE_KEY, JSON.stringify(scores));

      // — NEW: tell the server my updated total —
      const total = scores.reduce((a,b) => a + b, 0);
      window.quizSocket.emit('submit_score', { total });

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


    socket.emit('join_waiting', { name: userName, avatar: avatarIdx, total });
  });
  // if you ever need to push events later:
  window.quizSocket = socket;
})();
// ─────────────────────────────────────────────────────────────────