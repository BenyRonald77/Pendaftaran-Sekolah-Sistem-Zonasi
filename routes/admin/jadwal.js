const express = require('express');
const router = express.Router();

const settingsLib = require('../../lib/settings');
const { formatDateTime, toDatetimeLocalInput } = require('../../lib/format');

router.get('/', (req, res) => {
  const settings = settingsLib.getAnnouncementSettings();
  res.render('admin/jadwal', {
    title: 'Jadwal Pengumuman',
    settings,
    releaseAtFormatted: formatDateTime(settings.releaseAt),
    releaseAtLocalInput: toDatetimeLocalInput(settings.releaseAt),
    released: settingsLib.isAnnouncementReleased(new Date()),
    error: null,
    success: false,
  });
});

router.post('/', (req, res) => {
  const raw = (req.body.releaseAt || '').trim();
  // input type="datetime-local" mengembalikan format YYYY-MM-DDTHH:mm tanpa
  // zona waktu; ditafsirkan sebagai waktu Indonesia Barat (WIB, UTC+7).
  const withOffset = raw ? `${raw}:00+07:00` : '';
  const parsed = withOffset ? new Date(withOffset) : null;

  if (!raw || !parsed || Number.isNaN(parsed.getTime())) {
    const settings = settingsLib.getAnnouncementSettings();
    return res.status(400).render('admin/jadwal', {
      title: 'Jadwal Pengumuman',
      settings,
      releaseAtFormatted: formatDateTime(settings.releaseAt),
      releaseAtLocalInput: raw,
      released: settingsLib.isAnnouncementReleased(new Date()),
      error: 'Tanggal dan jam rilis wajib diisi dengan format yang valid.',
      success: false,
    });
  }

  const updated = settingsLib.setAnnouncementReleaseAt(parsed.toISOString());
  res.render('admin/jadwal', {
    title: 'Jadwal Pengumuman',
    settings: updated,
    releaseAtFormatted: formatDateTime(updated.releaseAt),
    releaseAtLocalInput: toDatetimeLocalInput(updated.releaseAt),
    released: settingsLib.isAnnouncementReleased(new Date()),
    error: null,
    success: true,
  });
});

module.exports = router;
