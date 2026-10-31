/**
 * CoinTribe Frontend Logic & GSAP Parallax Integration
 * Professional Authentication, Multi-Tab Views & FinTech Dashboard
 */

const API_BASE = window.location.origin + '/api';

async function apiFetch(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    throw new Error('No fue posible conectar con el backend. Verifica que el servidor esté activo.');
  }
  if (!response.ok) {
    let message = `Error del servidor (${response.status}).`;
    if (response.headers.get('content-type')?.includes('application/json')) {
      const body = await response.json();
      if (body.error) message = body.error;
    }
    throw new Error(message);
  }
  return response;
}

// State
let state = {
  currentUser: null,
  users: [],
  courses: [],
  challenges: [],
  userChallenges: [],
  posts: [],
  achievements: [],
  userAchievements: [],
  coins: [],
  activeTab: 'inicio'
};

// DOM References
const dom = {
  currentUserName: document.getElementById('current-user-name'),
  currentUserLevel: document.getElementById('current-user-level'),
  currentUserAvatar: document.getElementById('current-user-avatar'),
  statSavings: document.getElementById('stat-savings'),
  statGoal: document.getElementById('stat-goal'),
  statPercentage: document.getElementById('stat-percentage'),
  statLessons: document.getElementById('stat-lessons'),
  statProgressLabel: document.getElementById('stat-progress-label'),
  milestoneGoalLabel: document.getElementById('milestone-goal-label'),
  floatBadgeSavings: document.getElementById('float-badge-savings'),
  statUserLevelLabel: document.getElementById('stat-user-level-label'),
  goalProgressBar: document.getElementById('goal-progress-bar'),
  coursesList: document.getElementById('courses-list'),
  coursesListPreview: document.getElementById('courses-list-preview'),
  challengesList: document.getElementById('challenges-list'),
  myChallengesList: document.getElementById('my-challenges-list'),
  postsList: document.getElementById('posts-list'),
  achievementsList: document.getElementById('achievements-list'),
  coinsTableBody: document.getElementById('coins-table-body'),
  themeToggle: document.getElementById('btn-theme-toggle'),
  headerLoggedOut: document.getElementById('header-logged-out'),
  headerLoggedIn: document.getElementById('header-logged-in')
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupTheme();
  setupModals();
  initGSAPParallax();
  await checkStoredSession();
  await loadInitialData();
});

// ==========================================================================
// Authentication System (Login / Register / Session)
// ==========================================================================
async function checkStoredSession() {
  const saved = localStorage.getItem('cointribe_user');
  if (saved) {
    try {
      state.currentUser = JSON.parse(saved);
      updateAuthHeaderState(true);
      renderUserDashboard();
    } catch (e) {
      localStorage.removeItem('cointribe_user');
      updateAuthHeaderState(false);
    }
  } else {
    updateAuthHeaderState(false);
  }
}

function updateAuthHeaderState(isLoggedIn) {
  if (dom.headerLoggedIn && dom.headerLoggedOut) {
    dom.headerLoggedIn.style.display = isLoggedIn ? 'flex' : 'none';
    dom.headerLoggedOut.style.display = isLoggedIn ? 'none' : 'flex';
  }
}

function openAuthModal(type = 'login') {
  setAuthTab(type);
  openModal('modal-auth');
}

function setAuthTab(tab) {
  const btnLogin = document.getElementById('auth-tab-btn-login');
  const btnRegister = document.getElementById('auth-tab-btn-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  if (tab === 'login') {
    btnLogin.classList.add('active');
    btnRegister.classList.remove('active');
    formLogin.style.display = 'block';
    formRegister.style.display = 'none';
  } else {
    btnRegister.classList.add('active');
    btnLogin.classList.remove('active');
    formRegister.style.display = 'block';
    formLogin.style.display = 'none';
  }
}

function fillDemoCredentials() {
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  if (emailInput && passInput) {
    emailInput.value = 'admin@cointribe.com';
    passInput.value = '123456';
    showToast('Credenciales de prueba cargadas ✨', 'info');
  }
}

async function submitLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await apiFetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      const user = await res.json();
      state.currentUser = user;
      localStorage.setItem('cointribe_user', JSON.stringify(user));
      updateAuthHeaderState(true);
      renderUserDashboard();
      await fetchUserChallenges();
      await fetchUserAchievements();
      closeAllModals();
      showToast(`¡Bienvenido de nuevo, ${user.nombre}! 🚀`);
      switchMainTab('dashboard');
    }
  } catch (e) {
    showToast(e.message || 'Error de conexión al iniciar sesión', 'error');
  }
}

async function submitRegister(event) {
  event.preventDefault();
  const nombre = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;

  try {
    const res = await apiFetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });

    if (res.ok) {
      const user = await res.json();
      state.currentUser = user;
      localStorage.setItem('cointribe_user', JSON.stringify(user));
      updateAuthHeaderState(true);
      renderUserDashboard();
      closeAllModals();
      showToast(`¡Cuenta creada con éxito! Bienvenido a CoinTribe, ${user.nombre} 🎉`);
      switchMainTab('dashboard');
    }
  } catch (e) {
    showToast(e.message || 'Error de conexión al registrar usuario', 'error');
  }
}

function logout() {
  state.currentUser = null;
  localStorage.removeItem('cointribe_user');
  updateAuthHeaderState(false);
  switchMainTab('inicio');
  showToast('Has cerrado sesión correctamente 👋', 'info');
}

function handleDashboardAccess() {
  if (state.currentUser) {
    switchMainTab('dashboard');
  } else {
    showToast('Inicia sesión o crea una cuenta para ver tu panel personal', 'info');
    openAuthModal('login');
  }
}

// ==========================================================================
// Main Navigation (Separate Views/Tabs)
// ==========================================================================
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      if (target === 'dashboard' && !state.currentUser) {
        handleDashboardAccess();
        return;
      }
      switchMainTab(target);
    });
  });
}

function switchMainTab(tabId) {
  state.activeTab = tabId;

  // Update navbar buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === tabId);
  });

  // Toggle views
  document.querySelectorAll('.main-tab-view').forEach(view => {
    if (view.id === `view-${tabId}`) {
      view.style.display = 'block';
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(view, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
      }
    } else {
      view.style.display = 'none';
    }
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Refresh GSAP ScrollTrigger if switching to 'inicio'
  if (tabId === 'inicio' && typeof ScrollTrigger !== 'undefined') {
    setTimeout(() => ScrollTrigger.refresh(), 100);
  }
}

// ==========================================================================
// GSAP & ScrollTrigger Parallax Animations
// ==========================================================================
function initGSAPParallax() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // 1. Initial Hero Entrance Animation
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });
  heroTl
    .from('#hero-badge', { y: -20, opacity: 0, delay: 0.1 })
    .from('#hero-heading', { y: 30, opacity: 0 }, '-=0.7')
    .from('#hero-sub', { y: 20, opacity: 0 }, '-=0.7')
    .from('#hero-ctas', { y: 20, opacity: 0 }, '-=0.7')
    .from('#hero-expand-container', { scale: 0.9, opacity: 0, duration: 1.2 }, '-=0.6')
    .from('#hero-float-1', { x: -40, opacity: 0, duration: 0.8 }, '-=0.6')
    .from('#hero-float-2', { x: 40, opacity: 0, duration: 0.8 }, '-=0.8');

  // 2. Smooth Expanding Hero Image on Scroll
  gsap.to('#hero-expand-container', {
    scrollTrigger: {
      trigger: '#hero-section',
      start: 'top top',
      end: 'bottom 40%',
      scrub: 1.2
    },
    width: '100%',
    borderRadius: '20px',
    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 45px rgba(16, 185, 129, 0.5)',
    ease: 'power2.out'
  });

  // Parallax shift on the Hero Image inside container
  gsap.to('#hero-parallax-img', {
    scrollTrigger: {
      trigger: '#hero-section',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5
    },
    scale: 1.05,
    yPercent: 12,
    ease: 'none'
  });

  // Parallax floating badges shift
  gsap.to('#hero-float-1', {
    scrollTrigger: {
      trigger: '#hero-section',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2
    },
    y: -50,
    x: -20,
    ease: 'none'
  });

  gsap.to('#hero-float-2', {
    scrollTrigger: {
      trigger: '#hero-section',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2
    },
    y: 50,
    x: 20,
    ease: 'none'
  });

  // 3. Parallax Strip 1 (Academy Image Expansion & Shift)
  gsap.from('#academy-img-container', {
    scrollTrigger: {
      trigger: '#strip-academy',
      start: 'top 80%',
      end: 'top 30%',
      scrub: 1.2
    },
    scale: 0.92,
    borderRadius: '40px',
    ease: 'power2.out'
  });

  gsap.to('#academy-parallax-img', {
    scrollTrigger: {
      trigger: '#strip-academy',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5
    },
    scale: 1.22,
    yPercent: -15,
    ease: 'none'
  });

  // 4. Parallax Strip 2 (Community Image Expansion & Shift)
  gsap.from('#community-img-container', {
    scrollTrigger: {
      trigger: '#strip-community',
      start: 'top 80%',
      end: 'top 30%',
      scrub: 1.2
    },
    scale: 0.92,
    borderRadius: '40px',
    ease: 'power2.out'
  });

  gsap.to('#community-parallax-img', {
    scrollTrigger: {
      trigger: '#strip-community',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5
    },
    scale: 1.22,
    yPercent: -15,
    ease: 'none'
  });
}

// Setup Theme Switcher
function setupTheme() {
  if (dom.themeToggle) {
    dom.themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      dom.themeToggle.innerHTML = isLight ? '🌙' : '☀️';
      localStorage.setItem('cointribe-theme', isLight ? 'light' : 'dark');
    });

    if (localStorage.getItem('cointribe-theme') === 'light') {
      document.body.classList.add('light-theme');
      dom.themeToggle.innerHTML = '🌙';
    }
  }
}

// Setup Modals
function setupModals() {
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-close')) {
        closeAllModals();
      }
    });
  });
}

function openModal(id) {
  closeAllModals();
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

// Toast Notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'info' ? 'toast-info' : ''}`;
  
  const icon = type === 'error' ? '❌' : type === 'info' ? 'ℹ️' : '✨';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Format Money
function formatMoney(amount) {
  if (amount == null || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}

// Initial Data Load
async function loadInitialData() {
  try {
    await fetchUsers();
    await Promise.all([
      fetchCourses(),
      fetchChallenges(),
      fetchPosts(),
      fetchAchievements(),
      fetchCoins()
    ]);
  } catch (err) {
    console.error('Error loading initial data:', err);
    showToast(err.message || 'Error cargando datos del servidor', 'error');
  }
}

// 1. Users & Dashboard
async function fetchUsers() {
  const res = await apiFetch(`${API_BASE}/users`);
  state.users = await res.json();
  if (state.users.length > 0 && !state.currentUser) {
    // If no session is active, do not force login, but keep first user ready for switch
    // state.currentUser will be set when logged in
  } else if (state.currentUser) {
    // Refresh current user data from server if updated
    const fresh = state.users.find(u => u.id === state.currentUser.id);
    if (fresh) {
      state.currentUser = fresh;
      localStorage.setItem('cointribe_user', JSON.stringify(fresh));
      renderUserDashboard();
      await fetchUserChallenges();
      await fetchUserAchievements();
    }
  }
}

function renderUserDashboard() {
  const user = state.currentUser;
  if (!user) return;

  if (dom.currentUserName) dom.currentUserName.textContent = user.nombre;
  if (dom.currentUserLevel) dom.currentUserLevel.textContent = `Nivel ${user.nivel || 1}`;
  if (dom.statUserLevelLabel) dom.statUserLevelLabel.textContent = `Nivel ${user.nivel || 1} • ${user.nombre}`;
  if (dom.currentUserAvatar) dom.currentUserAvatar.textContent = user.nombre.charAt(0).toUpperCase();

  const ahorro = user.ahorro || 0;
  const meta = user.meta || 500000;
  const pct = Math.min(100, Math.round((ahorro / (meta || 1)) * 100));

  if (dom.statSavings) dom.statSavings.textContent = formatMoney(ahorro);
  if (dom.statGoal) dom.statGoal.textContent = formatMoney(meta);
  if (dom.statPercentage) dom.statPercentage.textContent = `${pct}%`;
  if (dom.statProgressLabel) dom.statProgressLabel.textContent = `${pct}% alcanzado (${formatMoney(ahorro)} de ${formatMoney(meta)})`;
  if (dom.statLessons) dom.statLessons.textContent = user.leccionesCompletadas || 0;
  if (dom.milestoneGoalLabel) dom.milestoneGoalLabel.textContent = formatMoney(meta);
  if (dom.floatBadgeSavings) dom.floatBadgeSavings.textContent = `${formatMoney(ahorro)} ahorrado`;

  if (dom.goalProgressBar) {
    dom.goalProgressBar.style.width = `${pct}%`;
  }
}

// Quick Deposit / Savings Preset
async function quickAddSavings(amount) {
  if (!state.currentUser) {
    handleDashboardAccess();
    return;
  }
  try {
    const res = await apiFetch(`${API_BASE}/users/${state.currentUser.id}/ahorro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monto: amount })
    });

    if (res.ok) {
      state.currentUser = await res.json();
      localStorage.setItem('cointribe_user', JSON.stringify(state.currentUser));
      renderUserDashboard();
      await fetchUserAchievements();
      showToast(`¡Ahorro rápido de ${formatMoney(amount)} sumado a tu cuenta! 💰`);
    } else {
      showToast('No se pudo registrar el ahorro', 'error');
    }
  } catch (e) {
    showToast(e.message || 'Error de conexión', 'error');
  }
}

async function submitAddAhorro(event) {
  event.preventDefault();
  const input = document.getElementById('ahorro-monto-input');
  const amount = parseFloat(input.value);

  if (!amount || amount <= 0) {
    showToast('Por favor ingresa un monto válido', 'error');
    return;
  }

  await quickAddSavings(amount);
  closeAllModals();
  input.value = '';
}

// Update Goal
async function submitUpdateGoal(event) {
  event.preventDefault();
  if (!state.currentUser) {
    handleDashboardAccess();
    return;
  }
  const input = document.getElementById('nueva-meta-input');
  const metaVal = parseFloat(input.value);

  if (!metaVal || metaVal <= 0) {
    showToast('Ingresa una meta válida', 'error');
    return;
  }

  try {
    const res = await apiFetch(`${API_BASE}/users/${state.currentUser.id}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: state.currentUser.nombre, meta: metaVal })
    });

    if (res.ok) {
      state.currentUser = await res.json();
      localStorage.setItem('cointribe_user', JSON.stringify(state.currentUser));
      renderUserDashboard();
      closeAllModals();
      showToast('¡Meta de ahorro actualizada! 🎯');
    }
  } catch (e) {
    showToast(e.message || 'Error al actualizar meta', 'error');
  }
}

// 2. Courses
async function fetchCourses() {
  const res = await apiFetch(`${API_BASE}/courses`);
  state.courses = await res.json();
  renderCourses();
}

function renderCourses() {
  const renderList = (container, items) => {
    if (!container) return;
    container.innerHTML = '';
    items.forEach(c => {
      const card = document.createElement('div');
      card.className = 'custom-card';
      const tagClass = c.tema ? `tag-${c.tema.toLowerCase()}` : 'tag-bases';

      card.innerHTML = `
        <div class="card-tag ${tagClass}">${c.tema || 'General'}</div>
        <h4 class="card-title">${c.titulo}</h4>
        <p class="card-description">${c.descripcion || ''}</p>
        
        <div style="margin-bottom: 16px;">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom: 6px; font-weight:700;">
            <span style="color:var(--text-muted)">Progreso del curso</span>
            <span style="color:var(--emerald-400)">${c.progreso || 0}%</span>
          </div>
          <div class="progress-track" style="height: 8px;">
            <div class="progress-fill" style="width: ${c.progreso || 0}%"></div>
          </div>
        </div>

        <div class="card-footer">
          <span style="font-size: 0.85rem; color: var(--text-muted);">
            📖 ${c.totalLecciones || 1} Lecciones
          </span>
          <button class="btn-primary btn-sm" onclick="completeCourseLesson(${c.id})">
            Completar lección 🎓
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  };

  renderList(dom.coursesList, state.courses);
  renderList(dom.coursesListPreview, state.courses.slice(0, 3));
}

async function completeCourseLesson(courseId) {
  if (!state.currentUser) {
    handleDashboardAccess();
    return;
  }
  try {
    const res = await apiFetch(`${API_BASE}/courses/complete-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.currentUser.id, lecciones: 1 })
    });

    if (res.ok) {
      const updatedUser = await res.json();
      state.currentUser = updatedUser;
      localStorage.setItem('cointribe_user', JSON.stringify(updatedUser));
      renderUserDashboard();
      
      const course = state.courses.find(c => c.id === courseId);
      if (course) {
        const nextProgress = Math.min(100, (course.progreso || 0) + 25);
        await apiFetch(`${API_BASE}/courses/${courseId}/progress`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ progreso: nextProgress })
        });
        await fetchCourses();
      }
      await fetchUserAchievements();
      showToast('¡Lección completada! +1 en tu progreso');
    }
  } catch (e) {
    showToast(e.message || 'Error completando lección', 'error');
  }
}

// 3. Challenges
async function fetchChallenges() {
  const res = await apiFetch(`${API_BASE}/challenges`);
  state.challenges = await res.json();
  renderChallenges();
  renderUserChallenges();
}

async function fetchUserChallenges() {
  if (!state.currentUser) return;
  const res = await apiFetch(`${API_BASE}/challenges/user/${state.currentUser.id}`);
  state.userChallenges = await res.json();
  renderUserChallenges();
}

function renderChallenges() {
  if (!dom.challengesList) return;
  dom.challengesList.innerHTML = '';

  state.challenges.forEach(ch => {
    const isJoined = state.userChallenges.some(uc => uc.challengeId === ch.id);
    const card = document.createElement('div');
    card.className = 'custom-card';
    card.innerHTML = `
      <div class="card-tag tag-ahorro">🎯 Reto de Ahorro</div>
      <h4 class="card-title">${ch.titulo}</h4>
      <p class="card-description">${ch.descripcion || ''}</p>
      
      <div class="challenge-highlight">
        <div>
          <span style="font-size:0.75rem; color:var(--text-muted); display:block; font-weight:700;">META DEL RETO</span>
          <span class="challenge-target">${formatMoney(ch.metaAhorro)}</span>
        </div>
        <div style="text-align:right;">
          <span style="font-size:0.75rem; color:var(--text-muted); display:block; font-weight:700;">DURACIÓN</span>
          <span style="font-weight:800; font-family:'Outfit',sans-serif;">${ch.duracionDias || 30} días</span>
        </div>
      </div>

      <div class="card-footer">
        ${isJoined ? `
          <button class="btn-secondary btn-sm" onclick="openDepositChallengeModal(${ch.id})">
            💰 Aportar al reto
          </button>
          <span style="color:var(--emerald-400); font-size:0.88rem; font-weight:700;">✓ Unido</span>
        ` : `
          <button class="btn-primary btn-sm" onclick="joinChallenge(${ch.id})">
            Unirme al Reto 🚀
          </button>
        `}
      </div>
    `;
    dom.challengesList.appendChild(card);
  });
}

function renderUserChallenges() {
  if (!dom.myChallengesList) return;
  dom.myChallengesList.innerHTML = '';

  if (state.userChallenges.length === 0) {
    dom.myChallengesList.innerHTML = `
      <div style="grid-column: 1/-1; padding: 28px; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
        Aún no participas en ningún reto. ¡Explora los retos comunitarios y acepta tu primer desafío!
      </div>
    `;
    return;
  }

  state.userChallenges.forEach(uc => {
    const ch = state.challenges.find(challenge => challenge.id === uc.challengeId);
    if (!ch) return;
    const progress = Math.min(100, Math.round(((uc.ahorroAcumulado || 0) / (ch.metaAhorro || 1)) * 100));

    const item = document.createElement('div');
    item.className = 'custom-card';
    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h4 style="font-size: 1.15rem;">${ch.titulo}</h4>
        <span class="section-badge">${uc.completado ? 'Completado 🎉' : 'En progreso'}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:8px;">
        <span>Ahorrado: <strong>${formatMoney(uc.ahorroAcumulado)}</strong></span>
        <span>Meta: ${formatMoney(ch.metaAhorro)}</span>
      </div>
      <div class="progress-track" style="height: 10px; margin-bottom: 18px;">
        <div class="progress-fill" style="width: ${progress}%;"></div>
      </div>
      <button class="btn-primary btn-sm" onclick="openDepositChallengeModal(${ch.id})">
        Depositar en este reto (+ Dinero)
      </button>
    `;
    dom.myChallengesList.appendChild(item);
  });
}

async function joinChallenge(challengeId) {
  if (!state.currentUser) {
    handleDashboardAccess();
    return;
  }
  try {
    const res = await apiFetch(`${API_BASE}/challenges/${challengeId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.currentUser.id })
    });

    if (res.ok) {
      showToast('¡Te has unido al reto! 🌟');
      await fetchUsers();
      await fetchUserChallenges();
      renderChallenges();
    }
  } catch (e) {
    showToast(e.message || 'Error al unirse al reto', 'error');
  }
}

let activeChallengeDepositId = null;
function openDepositChallengeModal(chId) {
  if (!state.currentUser) {
    handleDashboardAccess();
    return;
  }
  activeChallengeDepositId = chId;
  openModal('modal-deposit-challenge');
}

async function submitDepositChallenge(event) {
  event.preventDefault();
  const input = document.getElementById('reto-deposito-monto');
  const amount = parseFloat(input.value);

  if (!amount || amount <= 0 || !activeChallengeDepositId) {
    showToast('Ingresa un monto válido', 'error');
    return;
  }

  try {
    const res = await apiFetch(`${API_BASE}/challenges/${activeChallengeDepositId}/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.currentUser.id, monto: amount })
    });

    if (res.ok) {
      closeAllModals();
      input.value = '';
      showToast(`¡Abonaste ${formatMoney(amount)} al reto!`);
      await fetchUsers();
      await fetchUserChallenges();
      await fetchChallenges();
    }
  } catch (e) {
    showToast(e.message || 'Error registrando depósito en reto', 'error');
  }
}

// 4. Forum / Posts
async function fetchPosts() {
  const res = await apiFetch(`${API_BASE}/posts`);
  state.posts = await res.json();
  renderPosts();
}

function renderPosts() {
  if (!dom.postsList) return;
  dom.postsList.innerHTML = '';

  state.posts.forEach(p => {
    const card = document.createElement('div');
    card.className = 'post-card';
    card.innerHTML = `
      <div class="post-header">
        <div class="post-author-box">
          <div class="post-avatar">${(p.autor || 'U').charAt(0).toUpperCase()}</div>
          <div>
            <div style="font-weight:700; font-size:0.95rem;">${p.autor || 'Miembro de la Tribu'}</div>
            <div style="font-size:0.75rem; color:var(--text-subtle);">${p.fecha ? new Date(p.fecha).toLocaleDateString() : 'Reciente'}</div>
          </div>
        </div>
        <span class="card-tag tag-bases" style="margin-bottom:0;">#${p.etiqueta || 'comunidad'}</span>
      </div>
      <h4 class="post-title">${p.titulo}</h4>
      <p class="post-body">${p.cuerpo}</p>
      <div class="post-actions">
        <button class="btn-like" onclick="likePost(${p.id})">
          ❤️ ${p.likes || 0} Me gusta
        </button>
      </div>
    `;
    dom.postsList.appendChild(card);
  });
}

async function likePost(postId) {
  if (!state.currentUser) {
    handleDashboardAccess();
    return;
  }
  try {
    const res = await apiFetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: state.currentUser.id })
    });
    if (res.ok) {
      const updatedPost = await res.json();
      const p = state.posts.find(item => item.id === postId);
      if (p) p.likes = updatedPost.likes;
      renderPosts();
      showToast('¡Le diste Me gusta! ❤️');
    }
  } catch (e) {
    showToast(e.message || 'Error al dar like', 'error');
  }
}

async function submitCreatePost(event) {
  event.preventDefault();
  if (!state.currentUser) {
    handleDashboardAccess();
    return;
  }
  const titulo = document.getElementById('post-titulo-input').value;
  const etiqueta = document.getElementById('post-etiqueta-input').value;
  const cuerpo = document.getElementById('post-cuerpo-input').value;

  try {
    const res = await apiFetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        autor: state.currentUser.nombre,
        etiqueta,
        titulo,
        cuerpo
      })
    });

    if (res.ok) {
      closeAllModals();
      document.getElementById('post-titulo-input').value = '';
      document.getElementById('post-cuerpo-input').value = '';
      showToast('Publicación compartida con la Tribu 🎉');
      await fetchPosts();
    }
  } catch (e) {
    showToast(e.message || 'Error al publicar', 'error');
  }
}

// 5. Achievements
async function fetchAchievements() {
  const res = await apiFetch(`${API_BASE}/achievements`);
  state.achievements = await res.json();
  renderAchievements();
}

async function fetchUserAchievements() {
  if (!state.currentUser) return;
  const res = await apiFetch(`${API_BASE}/achievements/user/${state.currentUser.id}`);
  state.userAchievements = await res.json();
  renderAchievements();
}

function renderAchievements() {
  if (!dom.achievementsList) return;
  dom.achievementsList.innerHTML = '';

  const unlockedIds = new Set(
    state.userAchievements.map(ua => ua.achievementId)
  );

  state.achievements.forEach(ach => {
    const isUnlocked = unlockedIds.has(ach.id);
    const card = document.createElement('div');
    card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
    const icon = ach.icono || '🏆';

    card.innerHTML = `
      <div class="achievement-icon-circle">${icon}</div>
      <h4 style="font-size: 1.15rem; margin-bottom: 6px;">${ach.nombre}</h4>
      <p style="font-size: 0.84rem; color: var(--text-muted); margin-bottom: 14px;">${ach.pista || ''}</p>
      <span class="section-badge" style="${isUnlocked ? 'background:rgba(245,158,11,0.2); color:var(--gold-400);' : 'background:rgba(255,255,255,0.06); color:var(--text-subtle);'}">
        ${isUnlocked ? 'Desbloqueado ⭐' : 'Bloqueado 🔒'}
      </span>
    `;
    dom.achievementsList.appendChild(card);
  });
}

// 6. Coins
async function fetchCoins() {
  const res = await apiFetch(`${API_BASE}/coins`);
  state.coins = await res.json();
  renderCoins();
}

function renderCoins() {
  if (!dom.coinsTableBody) return;
  dom.coinsTableBody.innerHTML = '';

  state.coins.forEach(coin => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="font-weight:700;">
        <span style="display:inline-block; width:30px; height:30px; border-radius:50%; background:rgba(245,158,11,0.2); text-align:center; line-height:30px; margin-right:8px;">🪙</span>
        ${coin.name}
      </td>
      <td><span class="card-tag tag-bases" style="margin:0;">${coin.symbol}</span></td>
      <td style="font-weight:800; color:var(--emerald-400); font-family:'Outfit',sans-serif;">$${(coin.price || 0).toLocaleString()} USD</td>
      <td>
        <span style="color:var(--emerald-400); font-weight:700; font-size:0.88rem;">+2.4% hoy</span>
      </td>
    `;
    dom.coinsTableBody.appendChild(row);
  });
}

// Switch User Modal
function openSwitchUserModal() {
  const select = document.getElementById('user-switch-select');
  select.innerHTML = '';
  state.users.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.textContent = `${u.nombre} (${u.email})`;
    if (state.currentUser && u.id === state.currentUser.id) opt.selected = true;
    select.appendChild(opt);
  });
  openModal('modal-switch-user');
}

function submitSwitchUser(e) {
  e.preventDefault();
  const select = document.getElementById('user-switch-select');
  const userId = parseInt(select.value);
  const found = state.users.find(u => u.id === userId);
  if (found) {
    state.currentUser = found;
    localStorage.setItem('cointribe_user', JSON.stringify(found));
    updateAuthHeaderState(true);
    renderUserDashboard();
    fetchUserChallenges();
    fetchUserAchievements();
    closeAllModals();
    showToast(`Usuario cambiado a: ${found.nombre}`);
  }
}
