/* ── Home: Module List ──────────────────────────────────── */
const MODULES = [
  {
    icon: '📋',
    slug: 'tarkvara-arendusprotsess',
    name: 'Tarkvara Arendusprotsess',
    desc: 'Software development lifecycle, models, diagrams and CASE tools.',
    topics: ['Agile', 'Waterfall', 'DevOps', 'SDLC', 'Spiral', 'UML', 'ERD', 'Flowchart'],
    count: '17 topics',
    studyIdx: 0,
    sections: [
      {
        title: 'Arendusmudelid',
        items: [
          { slug: 'agile', label: 'Agile', page: './content/TarkvaraArendusprotsess/Arendusmudelid/agile.html' },
          { slug: 'bigbang', label: 'Big Bang', page: './content/TarkvaraArendusprotsess/Arendusmudelid/bigbang.html' },
          { slug: 'devops', label: 'DevOps', page: './content/TarkvaraArendusprotsess/Arendusmudelid/devops.html' },
          { slug: 'extreme-programming', label: 'Extreme Programming', page: './content/TarkvaraArendusprotsess/Arendusmudelid/extreme-programming.html' },
          { slug: 'incremental', label: 'Incremental', page: './content/TarkvaraArendusprotsess/Arendusmudelid/incremental.html' },
          { slug: 'prototype', label: 'Prototype', page: './content/TarkvaraArendusprotsess/Arendusmudelid/prototype.html' },
          { slug: 'sdlc', label: 'SDLC', page: './content/TarkvaraArendusprotsess/Arendusmudelid/sdlc.html' },
          { slug: 'spiral', label: 'Spiral', page: './content/TarkvaraArendusprotsess/Arendusmudelid/spiral.html' },
          { slug: 'v-shape', label: 'V-Shape', page: './content/TarkvaraArendusprotsess/Arendusmudelid/v-shape.html' },
          { slug: 'waterfall', label: 'Waterfall', page: './content/TarkvaraArendusprotsess/Arendusmudelid/waterfall.html' }
        ]
      },
      {
        title: 'Diagrammikeeled',
        items: [
          { slug: 'erd', label: 'Entity Relationship Diagram', page: './content/TarkvaraArendusprotsess/Diagrammikeeled/erd.html' },
          { slug: 'flowchart', label: 'Flowchart', page: './content/TarkvaraArendusprotsess/Diagrammikeeled/flowchart.html' },
          { slug: 'uml', label: 'UML', page: './content/TarkvaraArendusprotsess/Diagrammikeeled/uml.html' }
        ]
      },
      {
        title: 'Project Libre',
        items: [
          { slug: 'projekt', label: 'Projekt', page: './content/TarkvaraArendusprotsess/Projekt/Projekt.html' }
        ]
      },
      {
        title: 'CASE',
        items: [
          { slug: 'case-index', label: 'Uldiselt', page: './content/TarkvaraArendusprotsess/CASE/index.html' },
          { slug: 'lowercase', label: 'Lowercase', page: './content/TarkvaraArendusprotsess/CASE/lowercase.html' },
          { slug: 'uppercase', label: 'Uppercase', page: './content/TarkvaraArendusprotsess/CASE/uppercase.html' }
        ]
      }
    ]
  },
  {
    icon: '🎬',
    slug: 'multimeedia',
    name: 'Multimeedia',
    desc: 'Creative media tools — animation, video editing, illustration and photo editing.',
    topics: ['Animate', 'DaVinci Resolve', 'Illustrator', 'Photoshop'],
    count: '4 topics',
    studyIdx: 1,
    sections: [
      {
        title: 'Topics',
        items: [
          { slug: 'animate', label: 'Animate', page: './content/Multimeedia/animate.html' },
          { slug: 'davinci', label: 'DaVinci Resolve', page: './content/Multimeedia/davinci.html' },
          { slug: 'illustrator', label: 'Illustrator', page: './content/Multimeedia/illustrator.html' },
          { slug: 'photoshop', label: 'Photoshop', page: './content/Multimeedia/photoshop.html' }
        ]
      }
    ]
  },
  {
    icon: '🏢',
    slug: 'it-juhtimine',
    name: 'IT Juhtimine',
    desc: 'IT organization management, infrastructure and organizational structures.',
    topics: ['IT Basics', 'MIS', 'Management Theory', 'Org Structures'],
    count: '1 topic',
    studyIdx: 2,
    sections: [
      {
        title: 'Topics',
        items: [
          { slug: 'konspekt', label: 'Konspekt', page: './content/ITJuhtimine/main.html' }
        ]
      }
    ]
  },
  {
    icon: '💬',
    slug: 'klienditeenindus',
    name: 'Klienditeenindus',
    desc: 'Communication, client interaction and conflict resolution skills.',
    topics: ['Communication', 'Listening Skills', 'Conflict Resolution', 'Assertiveness'],
    count: '1 topic',
    studyIdx: 3,
    sections: [
      {
        title: 'Topics',
        items: [
          { slug: 'konspekt', label: 'Konspekt', page: './content/Klienditeenindus ja suhtlus/osa1.html' }
        ]
      }
    ]
  },
  {
    icon: '🤖',
    slug: 'robootika',
    name: 'Robootika',
    desc: 'Arduino robotics — hardware, programming and hands-on experiments.',
    topics: ['Traffic Light', 'Potentiometer', 'Arduino', 'Robotics Essay'],
    count: '3 topics',
    studyIdx: 4,
    sections: [
      {
        title: 'Topics',
        items: [
          { slug: 'referaat', label: 'Referaat', page: './content/Robootika/referaat.html' },
          { slug: 'valgusfoor', label: 'Valgusfoor', page: './content/Robootika/valgusfoor.html' },
          { slug: 'potensiomeeter', label: 'Potensiomeeter', page: './content/Robootika/potensiomeeter.html' },
          { slug: 'oolamp', label: 'Öölamp', page: './content/Robootika/oolamp.html'},
          { slug: 'servo', label: 'Servo ja Temp andur', page: './content/Robootika/servo.html'},
          { slug: 'ilmajaam', label: 'Ilmajaam', page: './content/Robootika/ilmajaam.html'}
        ]
      }
    ]
  }
];

function findModuleBySlug(slug) {
  return MODULES.find(module => module.slug === slug);
}

function findModuleTopic(module, topicSlug) {
  if (!module) return null;
  for (const section of module.sections) {
    const item = section.items.find(entry => entry.slug === topicSlug);
    if (item) return item;
  }
  return null;
}

function openStudyModule(index, options = {}) {
  const { updateHash = true, replaceHistory = false } = options;
  const module = MODULES[index];
  if (!module) return;

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('content-view').classList.add('active');
  document.getElementById('hero-section').style.display = 'none';
  document.getElementById('content-view-title').textContent = module.name;
  document.querySelectorAll('.menu-link').forEach(b => b.classList.remove('active-page'));
  setActiveNavByView('content-view');
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
              <button class="study-topic-card" onclick="loadContent('${item.page}', '${escapeHtml(item.label)}', { route: 'study/${module.slug}/${item.slug}' })">
                <span class="study-topic-card-title">${escapeHtml(item.label)}</span>
                <span class="study-topic-card-arrow">→</span>
              </button>
            `).join('')}
          </div>
        </section>
      `).join('')}
    </div>
  `;

  if (updateHash) updateRoute(`study/${module.slug}`, { replace: replaceHistory });
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
