/* ── Theme ─────────────────────────────────────────────── */
const html = document.documentElement;
const themeBtn = document.getElementById('theme-btn');
let currentTheme = localStorage.getItem('theme') || 'auto';

function applyTheme(theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'auto' && prefersDark);
  if (isDark) {
    html.setAttribute('data-theme', 'dark');
    if (themeBtn) themeBtn.textContent = '☀️';
  } else {
    html.setAttribute('data-theme', 'light');
    if (themeBtn) themeBtn.textContent = '🌙';
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

  if (id === 'gallery-view') loadGallery();
  if (id === 'home-view')   loadWeather();

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

  const contentTitle = typeof element === 'string'
    ? element
    : (element ? element.textContent.trim() : 'Content');
  document.getElementById('content-view-title').textContent = contentTitle;

  const contentEl = document.getElementById('content');
  contentEl.innerHTML = '<div class="content-loading"><div class="spinner"></div> Loading…</div>';

  document.querySelectorAll('.menu-link').forEach(b => b.classList.remove('active-page'));
  if (element && typeof element !== 'string') element.classList.add('active-page');
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

/* ── Gallery ────────────────────────────────────────────── */
let galleryData  = { categories: [], pictures: [] };
let galActiveCat = 'all';
let galActiveSub = 'all';
let galSearch    = '';

async function loadGallery() {
  try {
    const res  = await fetch('/api/gallery');
    galleryData = await res.json();
  } catch {
    galleryData = { categories: [], pictures: [] };
  }
  renderGalFilters();
  renderGalGrid();
}

function renderGalFilters() {
  const catsEl = document.getElementById('gallery-cats');
  if (!catsEl) return;
  const cats = [{ id: 'all', name: 'All' }, ...(galleryData.categories || [])];
  catsEl.innerHTML = cats.map(c =>
    `<button class="gallery-cat-btn${c.id === galActiveCat ? ' active' : ''}" onclick="setGalCat('${c.id}')">${c.name}</button>`
  ).join('');
  renderGalSubFilter();
}

function renderGalSubFilter() {
  const subsEl = document.getElementById('gallery-subs');
  if (!subsEl) return;
  if (galActiveCat === 'all') { subsEl.innerHTML = ''; return; }
  const cat = (galleryData.categories || []).find(c => c.id === galActiveCat);
  if (!cat || !cat.subcategories.length) { subsEl.innerHTML = ''; return; }
  const subs = [{ id: 'all', name: 'All' }, ...cat.subcategories.map(s => ({ id: s, name: s }))];
  subsEl.innerHTML = subs.map(s =>
    `<button class="gallery-cat-btn gallery-sub-btn${s.id === galActiveSub ? ' active' : ''}" onclick="setGalSub('${s.id}')">${s.name}</button>`
  ).join('');
}

function setGalCat(catId) {
  galActiveCat = catId;
  galActiveSub = 'all';
  renderGalFilters();
  renderGalGrid();
}

function setGalSub(sub) {
  galActiveSub = sub;
  renderGalSubFilter();
  renderGalGrid();
}

function filterGallery(val) {
  galSearch = val;
  renderGalGrid();
}

function renderGalGrid() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  let pics = galleryData.pictures || [];
  if (galActiveCat !== 'all') pics = pics.filter(p => p.category    === galActiveCat);
  if (galActiveSub !== 'all') pics = pics.filter(p => p.subcategory === galActiveSub);
  if (galSearch)              pics = pics.filter(p => (p.alt || p.label || '').toLowerCase().includes(galSearch.toLowerCase()));

  if (!pics.length) {
    grid.innerHTML = '<p style="color:var(--text-muted);padding:20px;">No images found.</p>';
    return;
  }
  grid.innerHTML = pics.map(p => `
    <div class="gallery-item" data-alt="${escapeHtml(p.alt || p.label || '')}" data-url="${escapeHtml(p.url)}" onclick="openLightbox(this.dataset.url)">
      <img src="${escapeHtml(p.url)}" alt="${escapeHtml(p.alt || p.label || '')}" loading="lazy" />
      <div class="gallery-item-overlay"></div>
      <div class="gallery-item-label">${escapeHtml(p.label || p.alt || '')}</div>
    </div>`).join('');
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

/* ── Gallery Add Modal ──────────────────────────────────── */
function openGalleryAdd() {
  const sel = document.getElementById('gad-cat-select');
  if (sel) {
    const cats = galleryData.categories || [];
    sel.innerHTML = cats.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`).join('');
    if (!cats.length) sel.innerHTML = '<option value="other">Other</option>';
  }
  document.getElementById('gad-error').textContent = '';
  document.getElementById('gallery-add-form').reset();
  updateSubSuggestions();
  document.getElementById('gallery-add-modal').classList.add('open');
}

function closeGalleryAdd(e) {
  if (e && e.target !== document.getElementById('gallery-add-modal')) return;
  document.getElementById('gallery-add-modal').classList.remove('open');
}

async function submitGalleryAdd(e) {
  e.preventDefault();
  const btn = document.getElementById('gad-submit');
  const err = document.getElementById('gad-error');
  btn.disabled = true;
  btn.textContent = 'Adding…';
  err.textContent = '';

  const body = {
    url:         document.getElementById('gad-url').value.trim(),
    label:       document.getElementById('gad-label-input').value.trim(),
    category:    document.getElementById('gad-cat-select').value,
    subcategory: document.getElementById('gad-sub-input').value.trim()
  };

  try {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const data = await res.json();
      err.textContent = data.error || 'Failed to add image.';
    } else {
      const pic = await res.json();
      galleryData.pictures.push(pic);
      document.getElementById('gallery-add-modal').classList.remove('open');
      galActiveCat = pic.category;
      galActiveSub = 'all';
      renderGalFilters();
      renderGalGrid();
    }
  } catch {
    err.textContent = 'Network error.';
  }

  btn.disabled = false;
  btn.textContent = 'Add Image';
}

/* ── Category Modal ──────────────────────────────────────── */
function openCatModal() {
  renderCatList();
  document.getElementById('cat-name-err').textContent = '';
  document.getElementById('cat-add-form').reset();
  document.getElementById('cat-modal').classList.add('open');
}

function closeCatModal(e) {
  if (e && e.target !== document.getElementById('cat-modal')) return;
  document.getElementById('cat-modal').classList.remove('open');
}

function renderCatList() {
  const el   = document.getElementById('cat-list');
  const cats = galleryData.categories || [];
  if (!cats.length) {
    el.innerHTML = '<p class="cat-empty">No categories yet. Create one below.</p>';
    return;
  }
  el.innerHTML = cats.map(c => `
    <div class="cat-item">
      <span class="cat-item-name">${escapeHtml(c.name)}</span>
      <div class="cat-item-subs">
        ${c.subcategories.length
          ? c.subcategories.map(s => `<span class="cat-sub-tag">${escapeHtml(s)}</span>`).join('')
          : '<span class="cat-no-subs">no subcategories</span>'}
      </div>
    </div>`).join('');
}

async function submitNewCat(e) {
  e.preventDefault();
  const errEl = document.getElementById('cat-name-err');
  const btn   = document.getElementById('cat-submit-btn');
  const name  = document.getElementById('cat-name-input').value.trim();
  const raw   = document.getElementById('cat-subs-input').value.trim();
  const subcategories = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];

  errEl.textContent = '';
  btn.disabled = true;
  btn.textContent = 'Creating…';

  try {
    const res  = await fetch('/api/gallery/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, subcategories })
    });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.error || 'Failed to create category.';
    } else {
      galleryData.categories.push(data);
      renderGalFilters();
      renderCatList();
      document.getElementById('cat-add-form').reset();
    }
  } catch {
    errEl.textContent = 'Network error.';
  }

  btn.disabled = false;
  btn.textContent = 'Create Category';
}

function updateSubSuggestions() {
  const catId = document.getElementById('gad-cat-select').value;
  const cat   = (galleryData.categories || []).find(c => c.id === catId);
  const dl    = document.getElementById('gad-sub-list');
  if (dl) dl.innerHTML = (cat?.subcategories || []).map(s => `<option value="${escapeHtml(s)}">`).join('');
  document.getElementById('gad-sub-input').value = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('lightbox').classList.remove('open');
    document.getElementById('gallery-add-modal').classList.remove('open');
    document.getElementById('cat-modal').classList.remove('open');
    closeTodoPanel();
  }
});

/* ── Home: Module List ──────────────────────────────────── */
const MODULES = [
  {
    icon: '📋',
    name: 'Tarkvara Arendusprotsess',
    desc: 'Software development lifecycle, models, diagrams and CASE tools.',
    topics: ['Agile', 'Waterfall', 'DevOps', 'SDLC', 'Spiral', 'UML', 'ERD', 'Flowchart'],
    count: '17 topics',
    studyIdx: 0,
    sections: [
      {
        title: 'Arendusmudelid',
        items: [
          { label: 'Agile', page: './content/TarkvaraArendusprotsess/Arendusmudelid/agile.html' },
          { label: 'Big Bang', page: './content/TarkvaraArendusprotsess/Arendusmudelid/bigbang.html' },
          { label: 'DevOps', page: './content/TarkvaraArendusprotsess/Arendusmudelid/devops.html' },
          { label: 'Extreme Programming', page: './content/TarkvaraArendusprotsess/Arendusmudelid/extreme-programming.html' },
          { label: 'Incremental', page: './content/TarkvaraArendusprotsess/Arendusmudelid/incremental.html' },
          { label: 'Prototype', page: './content/TarkvaraArendusprotsess/Arendusmudelid/prototype.html' },
          { label: 'SDLC', page: './content/TarkvaraArendusprotsess/Arendusmudelid/sdlc.html' },
          { label: 'Spiral', page: './content/TarkvaraArendusprotsess/Arendusmudelid/spiral.html' },
          { label: 'V-Shape', page: './content/TarkvaraArendusprotsess/Arendusmudelid/v-shape.html' },
          { label: 'Waterfall', page: './content/TarkvaraArendusprotsess/Arendusmudelid/waterfall.html' }
        ]
      },
      {
        title: 'Diagrammikeeled',
        items: [
          { label: 'Entity Relationship Diagram', page: './content/TarkvaraArendusprotsess/Diagrammikeeled/erd.html' },
          { label: 'Flowchart', page: './content/TarkvaraArendusprotsess/Diagrammikeeled/flowchart.html' },
          { label: 'UML', page: './content/TarkvaraArendusprotsess/Diagrammikeeled/uml.html' }
        ]
      },
      {
        title: 'Project Libre',
        items: [
          { label: 'Projekt', page: './content/TarkvaraArendusprotsess/Projekt/Projekt.html' }
        ]
      },
      {
        title: 'CASE',
        items: [
          { label: 'Uldiselt', page: './content/TarkvaraArendusprotsess/CASE/index.html' },
          { label: 'Lowercase', page: './content/TarkvaraArendusprotsess/CASE/lowercase.html' },
          { label: 'Uppercase', page: './content/TarkvaraArendusprotsess/CASE/uppercase.html' }
        ]
      }
    ]
  },
  {
    icon: '🎬',
    name: 'Multimeedia',
    desc: 'Creative media tools — animation, video editing, illustration and photo editing.',
    topics: ['Animate', 'DaVinci Resolve', 'Illustrator', 'Photoshop'],
    count: '4 topics',
    studyIdx: 1,
    sections: [
      {
        title: 'Topics',
        items: [
          { label: 'Animate', page: './content/Multimeedia/animate.html' },
          { label: 'DaVinci Resolve', page: './content/Multimeedia/davinci.html' },
          { label: 'Illustrator', page: './content/Multimeedia/illustrator.html' },
          { label: 'Photoshop', page: './content/Multimeedia/photoshop.html' }
        ]
      }
    ]
  },
  {
    icon: '🏢',
    name: 'IT Juhtimine',
    desc: 'IT organization management, infrastructure and organizational structures.',
    topics: ['IT Basics', 'MIS', 'Management Theory', 'Org Structures'],
    count: '1 topic',
    studyIdx: 2,
    sections: [
      {
        title: 'Topics',
        items: [
          { label: 'Konspekt', page: './content/ITJuhtimine/main.html' }
        ]
      }
    ]
  },
  {
    icon: '💬',
    name: 'Klienditeenindus',
    desc: 'Communication, client interaction and conflict resolution skills.',
    topics: ['Communication', 'Listening Skills', 'Conflict Resolution', 'Assertiveness'],
    count: '1 topic',
    studyIdx: 3,
    sections: [
      {
        title: 'Topics',
        items: [
          { label: 'Konspekt', page: './content/Klienditeenindus ja suhtlus/osa1.html' }
        ]
      }
    ]
  },
  {
    icon: '🤖',
    name: 'Robootika',
    desc: 'Arduino robotics — hardware, programming and hands-on experiments.',
    topics: ['Traffic Light', 'Potentiometer', 'Arduino', 'Robotics Essay'],
    count: '3 topics',
    studyIdx: 4,
    sections: [
      {
        title: 'Topics',
        items: [
          { label: 'Referaat', page: './content/Robootika/referaat.html' },
          { label: 'Valgusfoor', page: './content/Robootika/valgusfoor.html' },
          { label: 'Potensiomeeter', page: './content/Robootika/potensiomeeter.html' }
        ]
      }
    ]
  }
];

function openStudyModule(index) {
  const module = MODULES[index];
  if (!module) return;

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('content-view').classList.add('active');
  document.getElementById('hero-section').style.display = 'none';
  document.getElementById('content-view-title').textContent = module.name;
  document.querySelectorAll('.menu-link').forEach(b => b.classList.remove('active-page'));
  closeAllDropdowns();
  closeMobileNav();

  const contentEl = document.getElementById('content');
  contentEl.innerHTML = `
    <div class="study-topic-menu">
      <div class="study-topic-intro">
        <div class="study-topic-icon">${module.icon}</div>
        <div>
          <h2>${escapeHtml(module.name)}</h2>
          <p>${escapeHtml(module.desc)}</p>
        </div>
      </div>
      ${module.sections.map(section => `
        <section class="study-topic-section">
          <div class="study-topic-section-title">${escapeHtml(section.title)}</div>
          <div class="study-topic-grid">
            ${section.items.map(item => `
              <button class="study-topic-card" onclick="loadContent('${item.page}', '${escapeHtml(item.label)}')">
                <span class="study-topic-card-title">${escapeHtml(item.label)}</span>
                <span class="study-topic-card-arrow">→</span>
              </button>
            `).join('')}
          </div>
        </section>
      `).join('')}
    </div>
  `;

  window.scrollTo(0, 0);
}

function renderModuleList() {
  const el = document.getElementById('module-list');
  if (!el) return;
  el.innerHTML = MODULES.map(m => `
    <div class="mod-card" onclick="openStudyModule(${m.studyIdx})">
      <div class="mod-icon">${m.icon}</div>
      <div class="mod-body">
        <div class="mod-name">${escapeHtml(m.name)}</div>
        <div class="mod-desc">${escapeHtml(m.desc)}</div>
        <div class="mod-topics">
          ${m.topics.map(t => `<span class="mod-topic">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
      <span class="mod-count">${m.count}</span>
    </div>`).join('');
}

/* ── Home: Weather ──────────────────────────────────────── */
const WMO = {
  0:  { desc: 'Clear sky',            icon: '☀️'  },
  1:  { desc: 'Mainly clear',         icon: '🌤️' },
  2:  { desc: 'Partly cloudy',        icon: '⛅'  },
  3:  { desc: 'Overcast',             icon: '☁️'  },
  45: { desc: 'Foggy',                icon: '🌫️' },
  48: { desc: 'Icy fog',              icon: '🌫️' },
  51: { desc: 'Light drizzle',        icon: '🌦️' },
  53: { desc: 'Drizzle',              icon: '🌦️' },
  55: { desc: 'Heavy drizzle',        icon: '🌧️' },
  61: { desc: 'Light rain',           icon: '🌧️' },
  63: { desc: 'Rain',                 icon: '🌧️' },
  65: { desc: 'Heavy rain',           icon: '🌧️' },
  71: { desc: 'Light snow',           icon: '🌨️' },
  73: { desc: 'Snow',                 icon: '❄️'  },
  75: { desc: 'Heavy snow',           icon: '❄️'  },
  77: { desc: 'Snow grains',          icon: '🌨️' },
  80: { desc: 'Light showers',        icon: '🌦️' },
  81: { desc: 'Showers',              icon: '🌧️' },
  82: { desc: 'Heavy showers',        icon: '⛈️'  },
  85: { desc: 'Snow showers',         icon: '🌨️' },
  86: { desc: 'Heavy snow showers',   icon: '🌨️' },
  95: { desc: 'Thunderstorm',         icon: '⛈️'  },
  96: { desc: 'Thunderstorm + hail',  icon: '⛈️'  },
  99: { desc: 'Severe thunderstorm',  icon: '⛈️'  }
};

let wxLoaded = false;

async function loadWeather() {
  if (wxLoaded) return;
  try {
    let lat = 59.3569, lon = 24.9370, city = 'Kiili, Estonia';

    const pos = await new Promise((ok, fail) => {
      if (!navigator.geolocation) { fail(); return; }
      navigator.geolocation.getCurrentPosition(ok, fail, { timeout: 5000 });
    }).catch(() => null);

    if (pos) {
      lat  = pos.coords.latitude;
      lon  = pos.coords.longitude;
      try {
        const geo = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
          { headers: { 'Accept-Language': 'en' } }
        ).then(r => r.json());
        city = geo.address.city || geo.address.town || geo.address.village
             || geo.address.county || 'Your location';
      } catch { city = 'Your location'; }
    }

    document.getElementById('wx-city').textContent = city;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
      + `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`
      + `&wind_speed_unit=kmh&timezone=auto`;

    const data = await fetch(url).then(r => r.json());
    const cur  = data.current;
    const wmo  = WMO[cur.weather_code] || { desc: 'Unknown', icon: '❓' };

    document.getElementById('wx-icon').textContent     = wmo.icon;
    document.getElementById('wx-temp').textContent     = Math.round(cur.temperature_2m) + '°C';
    document.getElementById('wx-desc').textContent     = wmo.desc;
    document.getElementById('wx-feels').textContent    = Math.round(cur.apparent_temperature) + '°C';
    document.getElementById('wx-wind').textContent     = Math.round(cur.wind_speed_10m) + ' km/h';
    document.getElementById('wx-humidity').textContent = cur.relative_humidity_2m + '%';

    wxLoaded = true;
  } catch {
    document.getElementById('wx-desc').textContent = 'Could not load weather.';
  }
}

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
loadWeather();
