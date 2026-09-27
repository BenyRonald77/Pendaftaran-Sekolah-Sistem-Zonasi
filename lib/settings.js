// Pengaturan jadwal pengumuman disimpan sebagai satu dokumen di koleksi
// "settings" dengan id tetap "announcement".

const store = require('./store');

const SETTINGS_ID = 'announcement';
const COLLECTION = 'settings';

function getAnnouncementSettings() {
  const existing = store.findById(COLLECTION, SETTINGS_ID);
  if (existing) return existing;
  // Belum pernah diatur: kembalikan default null supaya halaman bisa
  // menampilkan empty state yang jelas, bukan tanggal palsu.
  return { id: SETTINGS_ID, releaseAt: null, updatedAt: null };
}

function setAnnouncementReleaseAt(releaseAtIso) {
  const items = store.readAll(COLLECTION);
  const idx = items.findIndex((item) => item.id === SETTINGS_ID);
  const now = new Date().toISOString();
  if (idx === -1) {
    items.push({ id: SETTINGS_ID, releaseAt: releaseAtIso, createdAt: now, updatedAt: now });
  } else {
    items[idx] = Object.assign({}, items[idx], { releaseAt: releaseAtIso, updatedAt: now });
  }
  store.writeAll(COLLECTION, items);
  return items.find((item) => item.id === SETTINGS_ID);
}

function isAnnouncementReleased(now) {
  const settings = getAnnouncementSettings();
  if (!settings.releaseAt) return false;
  const releaseDate = new Date(settings.releaseAt);
  if (Number.isNaN(releaseDate.getTime())) return false;
  const compareNow = now instanceof Date ? now : new Date();
  return compareNow.getTime() >= releaseDate.getTime();
}

module.exports = {
  getAnnouncementSettings,
  setAnnouncementReleaseAt,
  isAnnouncementReleased,
  SETTINGS_ID,
};
