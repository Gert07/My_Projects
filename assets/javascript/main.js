/* ── Theme ─────────────────────────────────────────────── */
const html = document.documentElement;
const themeBtn = document.getElementById('theme-btn');
let currentTheme = localStorage.getItem('theme') || 'auto';


/* ── View Routing ───────────────────────────────────────── */
let prevView = null;
let isApplyingRoute = false;

const VIEW_ROUTE_MAP = {
  'home-view': 'home',
  'gallery-view': 'gallery',
  'contacts-view': 'contacts',
  'csharp-view': 'projects/csharp',
  'js-view': 'projects/javascript',
  'python-view': 'projects/python'
};

const VIEW_ROUTE_LOOKUP = Object.fromEntries(
  Object.entries(VIEW_ROUTE_MAP).map(([viewId, route]) => [route, viewId])
);

function normalizeRoute(route) {
  return String(route || '')
    .replace(/^#/, '')
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase();
}

function updateRoute(route, { replace = false } = {}) {
  if (isApplyingRoute) return;
  const normalizedRoute = normalizeRoute(route);
  const targetHash = normalizedRoute ? `#${normalizedRoute}` : '';
  if (window.location.hash === targetHash) return;

  if (replace) {
    history.replaceState(null, '', targetHash || window.location.pathname + window.location.search);
  } else {
    window.location.hash = normalizedRoute;
  }
}

function setActiveNavByView(id, btn) {
  document.querySelectorAll('.topbar-nav .nav-btn, .topbar-nav .nav-link').forEach(b => b.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
    return;
  }

  const navButtonByView = {
    'home-view': document.querySelector(".topbar-nav .nav-btn[onclick*=\"showView('home-view'\"]"),
    'gallery-view': document.querySelector(".topbar-nav .nav-btn[onclick*=\"showView('gallery-view'\"]"),
    'contacts-view': document.querySelector(".topbar-nav .nav-btn[onclick*=\"showView('contacts-view'\"]"),
    'csharp-view': document.querySelector('#nav-projects-dd > .nav-btn'),
    'js-view': document.querySelector('#nav-projects-dd > .nav-btn'),
    'python-view': document.querySelector('#nav-projects-dd > .nav-btn'),
    'content-view': document.querySelector('#nav-study-dd > .nav-btn')
  };

  navButtonByView[id]?.classList.add('active');
}

function showView(id, btn, options = {}) {
  const { updateHash = true, replaceHistory = false } = options;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  prevView = null;

  setActiveNavByView(id, btn);

  document.getElementById('hero-section').style.display = (id === 'home-view') ? '' : 'none';

  if (id === 'home-view') {
    document.querySelectorAll('.smenu-children, .smenu-leaves').forEach(c => c.classList.remove('open'));
    document.querySelectorAll('.smenu-btn, .smenu-sub-btn').forEach(b => b.classList.remove('open'));
  }

  if (id === 'gallery-view') loadGallery();
  if (updateHash && VIEW_ROUTE_MAP[id]) updateRoute(VIEW_ROUTE_MAP[id], { replace: replaceHistory });

  window.scrollTo(0, 0);
}

function goBack() {
  const route = normalizeRoute(window.location.hash);
  if (!route || route === 'home') {
    showView('home-view', null, { updateHash: false });
    document.getElementById('hero-section').style.display = '';
    return;
  }

  const parts = route.split('/');
  if (parts[0] === 'study') {
    if (parts.length >= 3) {
      updateRoute(`study/${parts[1]}`);
      return;
    }

    showView('home-view', null);
    document.getElementById('hero-section').style.display = '';
    return;
  }

  showView('home-view', null);
  document.getElementById('hero-section').style.display = '';
}

/* ── Content Loader ─────────────────────────────────────── */
function loadContent(page, element, options = {}) {
  const { updateHash = true, replaceHistory = false, route = null } = options;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('content-view').classList.add('active');
  document.getElementById('hero-section').style.display = 'none';

  const contentTitle = typeof element === 'string'
    ? element
    : (element ? element.textContent.trim() : 'Content');
  document.getElementById('content-view-title').textContent = contentTitle;

  const contentEl = document.getElementById('content');
  contentEl.innerHTML = '<div class="content-loading"><div class="spinner"></div> Loading…</div>';

  document.querySelectorAll('.menu-link').forEach(b => b.classList.remove('active-page'));
  if (element && typeof element !== 'string') element.classList.add('active-page');
  setActiveNavByView('content-view');
  closeAllDropdowns();
  closeMobileNav();

  fetch(page)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.text();
    })
    .then(html => { contentEl.innerHTML = html; })
    .catch(() => {
      contentEl.innerHTML = `
        <p style="color:var(--text-muted);padding:20px;">
          Could not load <code>${page}</code>.<br>
          Make sure the file exists at this path on your server.
        </p>`;
    });

  if (updateHash && route) updateRoute(route, { replace: replaceHistory });
  window.scrollTo(0, 0);
}

/* ── Sidebar Accordion ──────────────────────────────────── */
function toggleSidebarMenu(btn) {
  const children = btn.nextElementSibling;
  const isOpen = children.classList.contains('open');
  const scope = btn.closest('.study-dropdown-menu') || btn.closest('#mobile-nav') || document;
  scope.querySelectorAll('.smenu-children').forEach(c => c.classList.remove('open'));
  scope.querySelectorAll('.smenu-btn').forEach(b => b.classList.remove('open'));
  if (!isOpen) {
    children.classList.add('open');
    btn.classList.add('open');
  }
}

function toggleSidebarSub(btn) {
  const leaves = btn.nextElementSibling;
  leaves.classList.toggle('open');
  btn.classList.toggle('open');
}

/* ── Mobile Nav ─────────────────────────────────────────── */
function toggleMobileNav() {
  const nav = document.getElementById('mobile-nav');
  const ham = document.getElementById('hamburger');
  nav.classList.toggle('open');
  ham.classList.toggle('open');
}

function closeMobileNav() {
  document.getElementById('mobile-nav').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}

function toggleMobileSection(id) {
  const el = document.getElementById(id);
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

/* ── Dropdown ───────────────────────────────────────────── */
function toggleDropdown(id, e) {
  e.stopPropagation();
  const target = document.getElementById(id);
  const willOpen = !target.classList.contains('open');
  closeAllDropdowns();
  if (willOpen) target.classList.add('open');
}

function closeAllDropdowns() {
  document.querySelectorAll('.topbar-nav > li').forEach(li => li.classList.remove('open'));
}

document.addEventListener('click', e => {
  if (!e.target.closest('.topbar-nav > li')) closeAllDropdowns();
});

/* ── Todo Panel ─────────────────────────────────────────── */
function applyRouteFromHash() {
  const route = normalizeRoute(window.location.hash);
  if (!route || route === 'home') {
    showView('home-view', null, { updateHash: false });
    return;
  }

  const parts = route.split('/');
  if (parts[0] === 'study' && parts[1]) {
    const module = findModuleBySlug(parts[1]);
    if (!module) {
      showView('home-view', null, { updateHash: false });
      return;
    }

    if (parts[2]) {
      const topic = findModuleTopic(module, parts[2]);
      if (!topic) {
        openStudyModule(module.studyIdx, { updateHash: false });
        return;
      }

      loadContent(topic.page, topic.label, {
        updateHash: false,
        route: `study/${module.slug}/${topic.slug}`
      });
      return;
    }

    openStudyModule(module.studyIdx, { updateHash: false });
    return;
  }

  const viewId = VIEW_ROUTE_LOOKUP[route];
  if (viewId) {
    showView(viewId, null, { updateHash: false });
    return;
  }

  showView('home-view', null, { updateHash: false });
}

let todoFilter = 'all';
let todos      = [];

function toggleTodoPanel() {
  const panel    = document.getElementById('todo-panel');
  const backdrop = document.getElementById('todo-backdrop');
  const btn      = document.getElementById('todo-toggle-btn');
  const isOpen   = panel.classList.contains('open');
  if (isOpen) {
    panel.classList.remove('open');
    backdrop.classList.remove('open');
    btn.classList.remove('active');
  } else {
    panel.classList.add('open');
    backdrop.classList.add('open');
    btn.classList.add('active');
    fetchTodos();
  }
}

function closeTodoPanel() {
  document.getElementById('todo-panel').classList.remove('open');
  document.getElementById('todo-backdrop').classList.remove('open');
  document.getElementById('todo-toggle-btn').classList.remove('active');
}

function fetchTodos() {
  fetch('/api/todos')
    .then(r => r.json())
    .then(data => { todos = data; renderTodos(); })
    .catch(() => { todos = []; renderTodos(); });
}

function updateProgress() {
  const total = todos.length;
  const done  = todos.filter(t => t.done).length;
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);

  const arc   = document.getElementById('todo-progress-arc');
  const pctEl = document.getElementById('todo-progress-pct');
  const stats = document.getElementById('todo-progress-stats');

  arc.style.strokeDashoffset = 100 - pct;
  pctEl.textContent          = pct + '%';
  stats.textContent          = `${done} of ${total} task${total !== 1 ? 's' : ''} done`;
}

function renderTodos() {
  const list  = document.getElementById('todo-list');
  const empty = document.getElementById('todo-empty');
  const badge = document.getElementById('todo-badge');

  updateProgress();

  const active = todos.filter(t => !t.done).length;
  if (active > 0) {
    badge.textContent = active;
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
  }

  const visible = todos.filter(t => {
    if (todoFilter === 'active') return !t.done;
    if (todoFilter === 'done')   return  t.done;
    return true;
  });

  if (visible.length === 0) {
    list.innerHTML = '';
    empty.classList.add('visible');
  } else {
    empty.classList.remove('visible');
    list.innerHTML = visible.map(t => `
      <li class="todo-item${t.done ? ' done' : ''}" data-id="${t.id}">
        <button class="todo-check" onclick="toggleTodo(${t.id})" title="Toggle complete"></button>
        <span class="todo-item-text">${escapeHtml(t.text)}</span>
        <button class="todo-delete" onclick="deleteTodo(${t.id})" title="Delete">✕</button>
      </li>`).join('');
  }
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function addTodo(e) {
  e.preventDefault();
  const input = document.getElementById('todo-input');
  const text  = input.value.trim();
  if (!text) return;
  fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
    .then(r => r.json())
    .then(todo => { todos.push(todo); input.value = ''; renderTodos(); });
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done: !todo.done })
  })
    .then(r => r.json())
    .then(updated => {
      todos = todos.map(t => t.id === id ? updated : t);
      renderTodos();
    });
}

function deleteTodo(id) {
  fetch(`/api/todos/${id}`, { method: 'DELETE' })
    .then(() => { todos = todos.filter(t => t.id !== id); renderTodos(); });
}

function setFilter(filter, btn) {
  todoFilter = filter;
  document.querySelectorAll('.todo-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTodos();
}

function setupAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;

  const context = canvas.getContext('2d');
  const sparks = [];
  const sparkCount = 36;

  function resizeAmbientCanvas() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function createSpark() {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.8 + 0.8,
      vx: Math.random() * 0.26 + 0.06,
      vy: -(Math.random() * 0.2 + 0.04),
      alpha: Math.random() * 0.22 + 0.04
    };
  }

  function drawSpark(spark) {
    context.beginPath();
    context.fillStyle = `rgba(255, 255, 255, ${Math.min(spark.alpha * 1.25, 0.95)})`;
    context.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.strokeStyle = `rgba(242, 140, 40, ${spark.alpha * 0.45})`;
    context.lineWidth = 1;
    context.moveTo(spark.x, spark.y);
    context.lineTo(spark.x - spark.vx * 26, spark.y - spark.vy * 26);
    context.stroke();
  }

  function renderAmbientCanvas() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    sparks.forEach((spark) => {
      drawSpark(spark);
      spark.x += spark.vx;
      spark.y += spark.vy;

      if (spark.x > window.innerWidth + 40 || spark.y < -40) {
        spark.x = Math.random() * window.innerWidth * 0.4 - 20;
        spark.y = window.innerHeight + Math.random() * 80;
      }
    });

    requestAnimationFrame(renderAmbientCanvas);
  }

  resizeAmbientCanvas();
  for (let i = 0; i < sparkCount; i += 1) sparks.push(createSpark());
  window.addEventListener('resize', resizeAmbientCanvas);
  requestAnimationFrame(renderAmbientCanvas);
}

/* ── Init ───────────────────────────────────────────────── */
setupAmbientCanvas();
renderModuleList();
isApplyingRoute = true;
applyRouteFromHash();
isApplyingRoute = false;
window.addEventListener('hashchange', () => {
  isApplyingRoute = true;
  applyRouteFromHash();
  isApplyingRoute = false;
});
if (typeof loadWeather === 'function') loadWeather();
