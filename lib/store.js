// JSON file store sinkron. Setiap koleksi disimpan sebagai satu file
// data/<collection>.json berisi array objek. Tidak memakai driver database
// native, sesuai kebutuhan aplikasi ini yang kecil dan mudah dijalankan
// tanpa instalasi database terpisah.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');

function filePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readAll(collection) {
  const fp = filePath(collection);
  if (!fs.existsSync(fp)) return [];
  const raw = fs.readFileSync(fp, 'utf-8');
  if (!raw || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    // File korup/tidak valid: jangan menjatuhkan seluruh aplikasi,
    // kembalikan koleksi kosong dan biarkan halaman menampilkan error state.
    return [];
  }
}

function writeAll(collection, items) {
  ensureDataDir();
  fs.writeFileSync(filePath(collection), JSON.stringify(items, null, 2), 'utf-8');
}

function findById(collection, id) {
  return readAll(collection).find((item) => item.id === id) || null;
}

function insert(collection, doc) {
  const items = readAll(collection);
  const now = new Date().toISOString();
  const record = Object.assign({ id: crypto.randomUUID() }, doc, {
    createdAt: doc.createdAt || now,
    updatedAt: now,
  });
  items.push(record);
  writeAll(collection, items);
  return record;
}

function update(collection, id, patch) {
  const items = readAll(collection);
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  const updated = Object.assign({}, items[idx], patch, {
    id,
    updatedAt: new Date().toISOString(),
  });
  items[idx] = updated;
  writeAll(collection, items);
  return updated;
}

function remove(collection, id) {
  const items = readAll(collection);
  const next = items.filter((item) => item.id !== id);
  const changed = next.length !== items.length;
  if (changed) writeAll(collection, next);
  return changed;
}

module.exports = { readAll, writeAll, findById, insert, update, remove, DATA_DIR };
