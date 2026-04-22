/* ── Theme ─────────────────────────────────────────────── */
const html = document.documentElement;
const themeBtn = document.getElementById('theme-btn');
let currentTheme = localStorage.getItem('theme') || 'auto';

function applyTheme(theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'auto' && prefersDark);
  if (isDark) {
    html.setAttribute('data-theme', 'dark');
    themeBtn.textContent = '☀️';
  } else {
    html.setAttribute('data-theme', 'light');
    themeBtn.textContent = '🌙';
  }
  currentTheme = theme;
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const isDarkNow = html.getAttribute('data-theme') === 'dark';
  applyTheme(isDarkNow ? 'light' : 'dark');
}

applyTheme(currentTheme);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (currentTheme === 'auto') applyTheme('auto');
});

/* ── View Routing ───────────────────────────────────────── */
let prevView = null;

function showView(id, btn) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  prevView = null;

  document.querySelectorAll('.topbar-nav .nav-btn, .topbar-nav .nav-link').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.getElementById('hero-section').style.display = (id === 'home-view') ? '' : 'none';

  if (id === 'home-view') {
    document.querySelectorAll('.smenu-children, .smenu-leaves').forEach(c => c.classList.remove('open'));
    document.querySelectorAll('.smenu-btn, .smenu-sub-btn').forEach(b => b.classList.remove('open'));
  }

  window.scrollTo(0, 0);
}

function goBack() {
  showView('home-view', null);
  document.getElementById('hero-section').style.display = '';
}

/* ── Content Loader ─────────────────────────────────────── */
function loadContent(page, element) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('content-view').classList.add('active');
  document.getElementById('hero-section').style.display = 'none';

  document.getElementById('content-view-title').textContent = element ? element.textContent.trim() : 'Content';

  const contentEl = document.getElementById('content');
  contentEl.innerHTML = '<div class="content-loading"><div class="spinner"></div> Loading…</div>';

  document.querySelectorAll('.menu-link').forEach(b => b.classList.remove('active-page'));
  if (element) element.classList.add('active-page');

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

  window.scrollTo(0, 0);
}

/* ── Sidebar Accordion ──────────────────────────────────── */
function toggleSidebarMenu(btn) {
  const children = btn.nextElementSibling;
  const isOpen = children.classList.contains('open');
  document.querySelectorAll('.smenu-children').forEach(c => c.classList.remove('open'));
  document.querySelectorAll('.smenu-btn').forEach(b => b.classList.remove('open'));
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

function openSidebarSection(index) {
  const btns = document.querySelectorAll('.smenu-btn');
  if (btns[index]) {
    toggleSidebarMenu(btns[index]);
    document.getElementById('sidebar').classList.add('mobile-open');
  }
  window.scrollTo(0, 0);
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

function toggleSidebarMobile() {
  document.getElementById('sidebar').classList.toggle('mobile-open');
}

/* ── Dropdown ───────────────────────────────────────────── */
function toggleDropdown(id, e) {
  e.stopPropagation();
  document.getElementById(id).classList.toggle('open');
}

function closeAllDropdowns() {
  document.querySelectorAll('.topbar-nav > li').forEach(li => li.classList.remove('open'));
}

document.addEventListener('click', closeAllDropdowns);

/* ── Gallery ────────────────────────────────────────────── */
function filterGallery(val) {
  const q = val.toLowerCase();
  document.querySelectorAll('#gallery-grid .gallery-item').forEach(item => {
    const alt = item.getAttribute('data-alt').toLowerCase();
    item.style.display = alt.includes(q) ? '' : 'none';
  });
}

function openLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.add('open');
}

function closeLightbox(e) {
  if (e.target === document.getElementById('lightbox') || e.target === document.getElementById('lightbox-close')) {
    document.getElementById('lightbox').classList.remove('open');
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('lightbox').classList.remove('open');
    closeTodoPanel();
  }
});

/* ── Todo Panel ─────────────────────────────────────────── */
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
