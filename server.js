const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app       = express();
const PORT      = 3000;
const DATA_FILE    = path.join(__dirname, 'data', 'todos.json');
const GALLERY_FILE = path.join(__dirname, 'data', 'gallery.json');

app.use(express.json());
app.use(express.static(__dirname));

function readTodos() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}

function writeTodos(todos) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

function readGallery() {
  if (!fs.existsSync(GALLERY_FILE)) return { categories: [], pictures: [] };
  try { return JSON.parse(fs.readFileSync(GALLERY_FILE, 'utf8')); }
  catch { return { categories: [], pictures: [] }; }
}

function writeGallery(data) {
  fs.mkdirSync(path.dirname(GALLERY_FILE), { recursive: true });
  fs.writeFileSync(GALLERY_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/todos', (_req, res) => {
  res.json(readTodos());
});

app.post('/api/todos', (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ error: 'Text required' });
  const todos = readTodos();
  const todo = { id: Date.now(), text, done: false };
  todos.push(todo);
  writeTodos(todos);
  res.status(201).json(todo);
});

app.put('/api/todos/:id', (req, res) => {
  const todos = readTodos();
  const idx   = todos.findIndex(t => t.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  todos[idx] = { ...todos[idx], ...req.body, id: todos[idx].id };
  writeTodos(todos);
  res.json(todos[idx]);
});

app.delete('/api/todos/:id', (req, res) => {
  const todos = readTodos().filter(t => t.id !== Number(req.params.id));
  writeTodos(todos);
  res.json({ ok: true });
});

/* ── Gallery routes ─────────────────────────────────────── */

app.get('/api/gallery/categories', (_req, res) => {
  res.json(readGallery().categories);
});

app.get('/api/gallery', (req, res) => {
  const { categories, pictures } = readGallery();
  let list = pictures;
  if (req.query.category)    list = list.filter(p => p.category    === req.query.category);
  if (req.query.subcategory) list = list.filter(p => p.subcategory === req.query.subcategory);
  res.json({ categories, pictures: list });
});

app.post('/api/gallery', (req, res) => {
  const { url, label, alt, category, subcategory } = req.body;
  if (!url || !url.trim()) return res.status(400).json({ error: 'url required' });
  const data = readGallery();
  const picture = {
    id: Date.now(),
    url: url.trim(),
    label: (label || alt || '').trim(),
    alt:   (alt   || label || '').trim(),
    category:    (category    || 'other').trim(),
    subcategory: (subcategory || '').trim()
  };
  data.pictures.push(picture);
  writeGallery(data);
  res.status(201).json(picture);
});

app.delete('/api/gallery/:id', (req, res) => {
  const data = readGallery();
  data.pictures = data.pictures.filter(p => p.id !== Number(req.params.id));
  writeGallery(data);
  res.json({ ok: true });
});

app.post('/api/gallery/categories', (req, res) => {
  const { name, subcategories } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name required' });
  const data = readGallery();
  const id   = name.trim().toLowerCase().replace(/\s+/g, '-');
  if (data.categories.find(c => c.id === id)) return res.status(409).json({ error: 'Category already exists' });
  const cat = { id, name: name.trim(), subcategories: Array.isArray(subcategories) ? subcategories : [] };
  data.categories.push(cat);
  writeGallery(data);
  res.status(201).json(cat);
});

app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));
