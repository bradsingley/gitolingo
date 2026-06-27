// ---- Quiz data ----
// Each question:
//   text: string with {0}, {1}, ... placeholders for blanks
//   blanks: array of correct words (in order)
//   distractors: array of extra wrong-answer words
// For statement/celebration, screen type differs.

const screens = [
  { type: 'welcome' },

  {
    type: 'question',
    text: "To get started on a project, you'll want to locate the {0} on GitHub or ADO.",
    blanks: ['repository'],
    distractors: ['directory', 'package'],
    image: 'github.png',
    imageHeight: 300,
  },
  {
    type: 'question',
    text: "{0} the repository to create a {1} copy on your computer that's linked to the {2} repository.",
    blanks: ['Clone', 'local', 'remote'],
    distractors: ['Fork', 'backup'],
    image: 'clone.jpeg',
    imageHeight: 300,
  },
  {
    type: 'question',
    text: "Open the repo in {0} to set up your dev environment.",
    blanks: ['Visual Studio Code'],
    distractors: ['Notepad', 'GitHub'],
    image: 'Code.png',
    imageHeight: 300,
  },
  {
    type: 'question',
    text: "If it's been a while, {0} the latest changes from the {1} {2} to make sure everything is up to date.",
    blanks: ['pull', 'main', 'branch'],
    distractors: ['push', 'dev'],
    image: 'pull.png',
    imageHeight: 300,
  },

  {
    type: 'celebration',
    emoji: '🎉',
    title: "You're all set up!",
    text: "You've got the entire codebase at your fingertips now!",
  },

  {
    type: 'question',
    text: "If you want to experiment with a new feature or fix a bug, create a {0} to start a new line of development in your repo. If you want to create an entirely new repo, you can {1} the code instead.",
    blanks: ['branch', 'fork'],
    distractors: ['clone', 'merge', 'stash'],
    image: 'branch.png',
    imageHeight: 300,
  },

  {
    type: 'question',
    text: "Don't forget to {0} your changes often to save checkpoints on your local computer.",
    blanks: ['commit'],
    distractors: ['save', 'stash'],
    image: 'commit.png',
    imageHeight: 300,
  },
  {
    type: 'question',
    text: "{0} those changes up to the {1} repository occasionally, so your updates are available to collaborators.",
    blanks: ['Push', 'remote'],
    distractors: ['Pull', 'origin'],
    image: 'push-it.png',
  },
  {
    type: 'question',
    text: "When you're satisfied with your code, {0} updates from the main branch and {1} those changes to your {2} to avoid conflicts.",
    blanks: ['fetch', 'merge', 'branch'],
    distractors: ['stash', 'rebase'],
    image: 'merge.png',
    imageHeight: 300,
  },
  {
    type: 'question',
    text: "Now you're ready to submit a {0}. It's basically a request asking for your code to be {1} into the project.",
    blanks: ['pull request', 'adopted'],
    distractors: ['merge request', 'pushed', 'deleted'],
    image: 'pullrequest.jpeg',
    imageHeight: 300,
  },
  {
    type: 'celebration',
    title: "PR submitted!",
    text: "You submitted a PR!",
    image: 'octocat_jump.png',
  },
  {
    type: 'question',
    text: "Now that you've submitted your PR, it will attempt to pass a series of {0} tests, conflict tests, and require approval from reviewers.",
    blanks: ['visual parity'],
    distractors: ['unit', 'integration'],
    image: 'internetkid.png',
  },
  {
    type: 'question',
    text: "Once the PR has {0} into the main branch, it's ready to be {1} to users.",
    blanks: ['merged', 'released'],
    distractors: ['pushed', 'reverted'],
  },

  { type: 'complete' },
];

// ---- State ----
const state = {
  idx: 0,
  stars: 4,
  filled: [],   // word slots currently in blanks (length == blanks.length)
  pool: [],     // current option words (correct + distractors, shuffled)
  used: [],     // index into pool that have been placed into blanks (parallel to filled)
  checked: false,
  feedback: null, // 'correct' | 'incorrect'
};

// ---- DOM ----
const app = document.getElementById('app');

// ---- Helpers ----
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(s) { return s.trim().toLowerCase(); }

function progressPct() {
  // welcome = 0%, complete = 100%
  const total = screens.length - 1; // exclude welcome from "denominator start"
  return Math.min(100, Math.round((state.idx / total) * 100));
}

// ---- Render ----
function render() {
  const screen = screens[state.idx];
  app.innerHTML = '';

  switch (screen.type) {
    case 'welcome':       return renderWelcome();
    case 'question':      return renderQuestion(screen);
    case 'statement':     return renderStatement(screen);
    case 'celebration':   return renderCelebration(screen);
    case 'complete':      return renderComplete();
  }
}

function renderWelcome() {
  app.innerHTML = `
    <section class="screen active">
      <header class="welcome-header">
        <img class="brand-logo" src="images/logo.jpg" alt="Gitolingo" />
        <div class="stat-bar">
          <div class="stat stat-streak">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
            </svg>
            <span>0</span>
          </div>
          <div class="stat stat-gems">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6 3h12l4 6-10 12L2 9l4-6z" stroke="#0a8ec0" stroke-width="0.5" stroke-linejoin="round"/>
            </svg>
            <span>500</span>
          </div>
          <div class="stat stat-hearts">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 21s-7.5-4.4-9.8-9C.8 8 3.4 4 7 4c2 0 3.6 1 5 2.7C13.4 5 15 4 17 4c3.6 0 6.2 4 4.8 8-2.3 4.6-9.8 9-9.8 9z"/>
            </svg>
            <span>${state.stars}</span>
          </div>
        </div>
      </header>
      <main class="welcome-stage">
        <div class="character">
          <div class="bubble">Welcome. Let's get started.</div>
          <img class="character-img" src="images/octocat.png" alt="Octocat" />
        </div>
      </main>
      <footer class="welcome-footer">
        <div class="quiz-footer-content" style="justify-content:flex-end;">
          <button class="btn-continue" id="welcome-continue" type="button">Continue</button>
        </div>
      </footer>
    </section>
  `;
  document.getElementById('welcome-continue').onclick = next;
}

function renderTopBar() {
  const pct = progressPct();
  const total = screens.length - 1;
  const milestones = screens
    .map((s, i) => (s.type === 'celebration' ? i : -1))
    .filter(i => i >= 0)
    .map(i => {
      const x = (i / total) * 100;
      const reached = state.idx >= i;
      return `<span class="milestone-dot ${reached ? 'reached' : ''}" style="left:${x}%"></span>`;
    })
    .join('');

  return `
    <header class="top-bar">
      <button class="btn-close" id="back-btn" type="button" aria-label="Back">×</button>
      <div class="progress">
        <div class="progress-fill" style="width:${pct}%"></div>
        ${milestones}
      </div>
      <div class="stars" aria-label="${state.stars} stars left">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.4-9.8-9C.8 8 3.4 4 7 4c2 0 3.6 1 5 2.7C13.4 5 15 4 17 4c3.6 0 6.2 4 4.8 8-2.3 4.6-9.8 9-9.8 9z"/></svg>
        <span>${state.stars}</span>
      </div>
    </header>
  `;
}

function renderQuestion(screen) {
  // Initialize per-question state if not yet
  if (state.filled.length !== screen.blanks.length || !state.pool.length) {
    state.filled = screen.blanks.map(() => null);
    state.used = screen.blanks.map(() => null);
    state.pool = shuffle([...screen.blanks, ...screen.distractors]);
    state.checked = false;
    state.feedback = null;
  }

  app.innerHTML = `
    <section class="screen active">
      ${renderTopBar()}
      <main class="quiz-body">
        <div class="quiz-prompt">
          ${screen.image ? `<img class="quiz-image" src="images/${screen.image}" alt="" style="max-height:${screen.imageHeight || 200}px" />` : ''}
          <h2 class="quiz-title">Fill in the blanks</h2>
          <div class="sentence" id="sentence"></div>
        </div>
        <div class="options" id="options"></div>
      </main>
      ${state.feedback ? renderFeedbackBar(screen) : renderQuizFooter()}
    </section>
  `;

  renderSentence(screen);
  renderOptions(screen);
  attachFooterHandlers(screen);
  document.getElementById('back-btn').onclick = back;
}

function renderSentence(screen) {
  const el = document.getElementById('sentence');
  const parts = screen.text.split(/(\{\d+\})/g);
  el.innerHTML = parts.map(part => {
    const m = part.match(/^\{(\d+)\}$/);
    if (m) {
      const i = parseInt(m[1], 10);
      const word = state.filled[i];
      let cls = 'blank';
      if (word) cls += ' filled';
      if (state.feedback) {
        const correct = normalize(word || '') === normalize(screen.blanks[i]);
        cls += correct ? ' correct' : ' incorrect';
      }
      return `<span class="${cls}" data-blank="${i}">${word ? escapeHtml(word) : ''}</span>`;
    }
    return `<span class="word">${escapeHtml(part)}</span>`;
  }).join('');

  if (!state.feedback) {
    el.querySelectorAll('.blank.filled').forEach(b => {
      b.onclick = () => unfillBlank(parseInt(b.dataset.blank, 10), screen);
    });
  }
}

function renderOptions(screen) {
  const el = document.getElementById('options');
  el.innerHTML = state.pool.map((w, i) => {
    const used = state.used.includes(i);
    return `<button class="option ${used ? 'hidden' : ''}" data-pool="${i}" ${state.feedback ? 'disabled' : ''}>${escapeHtml(w)}</button>`;
  }).join('');

  if (!state.feedback) {
    el.querySelectorAll('.option').forEach(btn => {
      btn.onclick = () => fillBlank(parseInt(btn.dataset.pool, 10), screen);
    });
  }
}

function fillBlank(poolIdx, screen) {
  // Find first empty blank
  const blankIdx = state.filled.findIndex(v => v === null);
  if (blankIdx === -1) return;
  state.filled[blankIdx] = state.pool[poolIdx];
  state.used[blankIdx] = poolIdx;
  renderSentence(screen);
  renderOptions(screen);
  updateCheckButton();
}

function unfillBlank(blankIdx, screen) {
  state.filled[blankIdx] = null;
  state.used[blankIdx] = null;
  // Compact: shift later blanks left so order stays continuous from the left
  for (let i = blankIdx; i < state.filled.length - 1; i++) {
    state.filled[i] = state.filled[i + 1];
    state.used[i] = state.used[i + 1];
    state.filled[i + 1] = null;
    state.used[i + 1] = null;
  }
  renderSentence(screen);
  renderOptions(screen);
  updateCheckButton();
}

function updateCheckButton() {
  const btn = document.getElementById('check-btn');
  if (!btn) return;
  btn.disabled = state.filled.some(v => v === null);
}

function renderQuizFooter() {
  return `
    <footer class="quiz-footer">
      <div class="quiz-footer-content">
        <button class="btn-skip" id="skip-btn" type="button">Skip</button>
        <button class="btn-check" id="check-btn" type="button" disabled>Check</button>
      </div>
    </footer>
  `;
}

function attachFooterHandlers(screen) {
  const skip = document.getElementById('skip-btn');
  const check = document.getElementById('check-btn');
  if (skip) skip.onclick = () => skipQuestion();
  if (check) {
    check.disabled = state.filled.some(v => v === null);
    check.onclick = () => checkAnswer(screen);
  }
  const feedbackBtn = document.getElementById('feedback-continue');
  if (feedbackBtn) feedbackBtn.onclick = next;
}

function checkAnswer(screen) {
  const allCorrect = state.filled.every((w, i) => normalize(w || '') === normalize(screen.blanks[i]));
  state.feedback = allCorrect ? 'correct' : 'incorrect';
  state.checked = true;
  if (!allCorrect && state.stars > 0) state.stars -= 1;
  render();
}

function skipQuestion() {
  // Skip counts as incorrect-ish: mark feedback so user sees the answer, but don't dock star
  const screen = screens[state.idx];
  state.filled = screen.blanks.slice();
  state.used = screen.blanks.map((_, i) => i); // not really used, just to render
  state.feedback = 'incorrect';
  state.checked = true;
  render();
}

function renderFeedbackBar(screen) {
  const isCorrect = state.feedback === 'correct';
  const icon = isCorrect
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 12 10 17 19 7"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>`;
  const answer = isCorrect
    ? ''
    : `<span class="answer">Correct answer: ${escapeHtml(screen.blanks.join(', '))}</span>`;
  return `
    <div class="feedback-bar ${isCorrect ? 'correct' : 'incorrect'}">
      <div class="feedback-content">
        <div class="feedback-icon">${icon}</div>
        <div class="feedback-text">
          ${isCorrect ? 'Great job!' : 'Incorrect'}
          ${answer}
        </div>
        <button class="btn-feedback" id="feedback-continue" type="button">Continue</button>
      </div>
    </div>
  `;
}

function renderStatement(screen) {
  app.innerHTML = `
    <section class="screen active">
      ${renderTopBar()}
      <main class="statement-body">
        <img class="character-img" src="images/octocat.png" alt="Octocat" />
        <div class="bubble">${escapeHtml(screen.text)}</div>
      </main>
      <footer class="quiz-footer">
        <div class="quiz-footer-content" style="justify-content:flex-end;">
          <button class="btn-continue" id="statement-continue" type="button">Continue</button>
        </div>
      </footer>
    </section>
  `;
  document.getElementById('back-btn').onclick = back;
  document.getElementById('statement-continue').onclick = next;
}

function renderCelebration(screen) {
  const img = screen.image || 'octocat_happy.png';
  app.innerHTML = `
    <section class="screen active">
      ${renderTopBar()}
      <main class="celebration-body">
        <div class="character">
          <div class="bubble">${escapeHtml(screen.text)}</div>
          <img class="character-img" src="images/${img}" alt="Octocat" />
        </div>
      </main>
      <footer class="quiz-footer">
        <div class="quiz-footer-content" style="justify-content:flex-end;">
          <button class="btn-continue" id="celebration-continue" type="button">Continue</button>
        </div>
      </footer>
    </section>
  `;
  document.getElementById('back-btn').onclick = back;
  document.getElementById('celebration-continue').onclick = next;
}

function renderComplete() {
  app.innerHTML = `
    <section class="screen active">
      <header class="top-bar">
        <div style="width:32px"></div>
        <div class="progress"><div class="progress-fill" style="width:100%"></div></div>
        <div class="stars">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.4-9.8-9C.8 8 3.4 4 7 4c2 0 3.6 1 5 2.7C13.4 5 15 4 17 4c3.6 0 6.2 4 4.8 8-2.3 4.6-9.8 9-9.8 9z"/></svg>
          <span>${state.stars}</span>
        </div>
      </header>
      <main class="complete-body">
        <img class="character-img" src="images/octocat.png" alt="Octocat" />
        <h1>Lesson complete!</h1>
        <div class="complete-stars">${'♥'.repeat(state.stars)}<span class="empty">${'♥'.repeat(4 - state.stars)}</span></div>
        <p>You finished the Gitolingo basics. Time to ship some code.</p>
        <div style="margin-top:24px">
          <button class="btn-continue" id="restart-btn" type="button">Start over</button>
        </div>
      </main>
    </section>
  `;
  document.getElementById('restart-btn').onclick = restart;
}

function renderFail() {
  app.innerHTML = `
    <section class="screen active">
      <main class="complete-body">
        <img class="character-img" src="images/octocat_cry.png" alt="Octocat" />
        <h1 class="fail-title">Out of hearts!</h1>
        <div class="complete-stars"><span class="empty">${'♥'.repeat(4)}</span></div>
        <p>You ran out of hearts. Give it another go from the top.</p>
        <div style="margin-top:24px">
          <button class="btn-continue" id="restart-btn" type="button">Start over</button>
        </div>
      </main>
    </section>
  `;
  document.getElementById('restart-btn').onclick = restart;
}

function restart() {
  state.idx = 0;
  state.stars = 4;
  resetQuestionState();
  render();
}

// ---- Navigation ----
function next() {
  if (state.stars === 0) {
    renderFail();
    return;
  }
  if (state.idx < screens.length - 1) {
    state.idx += 1;
    resetQuestionState();
    render();
  }
}

function back() {
  if (state.idx > 0) {
    state.idx -= 1;
    resetQuestionState();
    render();
  }
}

function resetQuestionState() {
  state.filled = [];
  state.pool = [];
  state.used = [];
  state.checked = false;
  state.feedback = null;
}

// ---- Util ----
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

// ---- Boot ----
render();
