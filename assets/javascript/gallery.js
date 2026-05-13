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

  const catMap = Object.fromEntries((galleryData.categories || []).map(c => [c.id, c.name]));

  grid.innerHTML = pics.map(p => {
    const catName = catMap[p.category] || p.category || '';
    const subName = p.subcategory || '';
    const meta    = [catName, subName].filter(Boolean).join(' / ');
    return `
    <div class="gallery-item" data-id="${p.id}" data-url="${escapeHtml(p.url)}" onclick="openLightbox(this.dataset.url)">
      <img src="${escapeHtml(p.url)}" alt="${escapeHtml(p.alt || p.label || '')}" loading="lazy" />
      <div class="gallery-item-overlay"></div>
      <div class="gallery-item-info">
        ${p.label || p.alt ? `<span class="gii-name">${escapeHtml(p.label || p.alt)}</span>` : ''}
        ${meta              ? `<span class="gii-cat">${escapeHtml(meta)}</span>`               : ''}
      </div>
      <button class="gallery-item-edit-btn" onclick="event.stopPropagation();openGalleryEdit(${p.id})" title="Edit">✎</button>
    </div>`;
  }).join('');
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

/* ── Gallery Add / Edit Modal ───────────────────────────── */
let editingPictureId = null;

function _populateCatSelect(selectedId) {
  const sel  = document.getElementById('gad-cat-select');
  const cats = galleryData.categories || [];
  sel.innerHTML = cats.map(c =>
    `<option value="${escapeHtml(c.id)}"${c.id === selectedId ? ' selected' : ''}>${escapeHtml(c.name)}</option>`
  ).join('');
  if (!cats.length) sel.innerHTML = '<option value="other">Other</option>';
}

function openGalleryAdd() {
  editingPictureId = null;
  document.querySelector('.gad-title').textContent     = 'Add Image';
  document.getElementById('gad-submit').textContent    = 'Add Image';
  document.getElementById('gad-url').readOnly          = false;
  document.getElementById('gad-error').textContent     = '';
  document.getElementById('gallery-add-form').reset();
  _populateCatSelect(null);
  updateSubSuggestions();
  document.getElementById('gallery-add-modal').classList.add('open');
}

function openGalleryEdit(id) {
  const pic = (galleryData.pictures || []).find(p => p.id === id);
  if (!pic) return;
  editingPictureId = id;
  document.querySelector('.gad-title').textContent  = 'Edit Image';
  document.getElementById('gad-submit').textContent = 'Save Changes';
  document.getElementById('gad-url').readOnly       = false;
  document.getElementById('gad-error').textContent  = '';
  document.getElementById('gad-url').value          = pic.url        || '';
  document.getElementById('gad-label-input').value  = pic.label      || '';
  _populateCatSelect(pic.category);
  updateSubSuggestions();
  document.getElementById('gad-sub-input').value    = pic.subcategory || '';
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
  btn.textContent = editingPictureId ? 'Saving…' : 'Adding…';
  err.textContent = '';

  const body = {
    url:         document.getElementById('gad-url').value.trim(),
    label:       document.getElementById('gad-label-input').value.trim(),
    category:    document.getElementById('gad-cat-select').value,
    subcategory: document.getElementById('gad-sub-input').value.trim()
  };

  try {
    const isEdit = editingPictureId !== null;
    const res = await fetch(isEdit ? `/api/gallery/${editingPictureId}` : '/api/gallery', {
      method:  isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(isEdit ? { label: body.label, category: body.category, subcategory: body.subcategory } : body)
    });
    if (!res.ok) {
      const data = await res.json();
      err.textContent = data.error || 'Failed.';
    } else {
      const pic = await res.json();
      if (isEdit) {
        galleryData.pictures = galleryData.pictures.map(p => p.id === editingPictureId ? pic : p);
      } else {
        galleryData.pictures.push(pic);
        galActiveCat = pic.category;
        galActiveSub = 'all';
      }
      document.getElementById('gallery-add-modal').classList.remove('open');
      renderGalFilters();
      renderGalGrid();
    }
  } catch {
    err.textContent = 'Network error.';
  }

  btn.disabled = false;
  btn.textContent = editingPictureId ? 'Save Changes' : 'Add Image';
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
      <div class="cat-item-header">
        <span class="cat-item-name">${escapeHtml(c.name)}</span>
        <button class="cat-delete-btn" onclick="deleteCategory('${escapeHtml(c.id)}')" title="Delete category">✕</button>
      </div>
      <div class="cat-item-subs">
        ${c.subcategories.length
          ? c.subcategories.map(s => `<span class="cat-sub-tag">${escapeHtml(s)}</span>`).join('')
          : '<span class="cat-no-subs">no subcategories</span>'}
      </div>
      <div class="cat-sub-add-row">
        <input class="gad-input cat-sub-new-input" type="text" id="new-sub-${escapeHtml(c.id)}" placeholder="Add subcategory…" />
        <button class="gad-btn gad-btn-submit cat-sub-add-btn" onclick="addSubcategory('${escapeHtml(c.id)}')">+</button>
      </div>
    </div>`).join('');
}

async function deleteCategory(catId) {
  if (!confirm('Delete this category? Images in it will keep their category tag.')) return;
  try {
    const res = await fetch(`/api/gallery/categories/${catId}`, { method: 'DELETE' });
    if (res.ok) {
      galleryData.categories = galleryData.categories.filter(c => c.id !== catId);
      renderGalFilters();
      renderCatList();
    }
  } catch { /* silent */ }
}

async function addSubcategory(catId) {
  const input = document.getElementById(`new-sub-${catId}`);
  const sub   = input.value.trim();
  if (!sub) return;
  try {
    const res = await fetch(`/api/gallery/categories/${catId}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ subcategory: sub })
    });
    if (res.ok) {
      const updated = await res.json();
      galleryData.categories = galleryData.categories.map(c => c.id === catId ? updated : c);
      renderGalFilters();
      renderCatList();
    }
  } catch { /* silent */ }
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
