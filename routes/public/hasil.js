const express = require('express');
const router = express.Router();

const store = require('../../lib/store');
const settingsLib = require('../../lib/settings');
const { findRegistrantRank } = require('../../lib/ranking');
const { formatDateTime, formatDistance, TRACK_LABELS, STATUS_LABELS } = require('../../lib/format');

router.get('/hasil', (req, res) => {
  const settings = settingsLib.getAnnouncementSettings();
  const now = new Date();
  // Waktu pembanding diambil dari jam server (new Date()), bukan dari input
  // client, sehingga tidak bisa dibypass dengan mengubah jam di browser.
  const released = settingsLib.isAnnouncementReleased(now);
  const nisnQuery = (req.query.nisn || '').trim();

  if (!released) {
    return res.render('hasil', {
      title: 'Cek Hasil Kelulusan',
      released: false,
      releaseAtFormatted: formatDateTime(settings.releaseAt),
      hasSchedule: Boolean(settings.releaseAt),
      searched: false,
      nisnQuery,
      results: [],
      TRACK_LABELS,
      STATUS_LABELS,
      formatDistance,
      dataError: null,
    });
  }

  if (!nisnQuery) {
    return res.render('hasil', {
      title: 'Cek Hasil Kelulusan',
      released: true,
      releaseAtFormatted: formatDateTime(settings.releaseAt),
      hasSchedule: true,
      searched: false,
      nisnQuery: '',
      results: [],
      TRACK_LABELS,
      STATUS_LABELS,
      formatDistance,
      dataError: null,
    });
  }

  try {
    const registrants = store.readAll('registrants');
    const schools = store.readAll('schools');
    const matches = registrants.filter((r) => r.nisn === nisnQuery);
    const results = matches.map((r) => findRegistrantRank(registrants, schools, r)).filter(Boolean);

    res.render('hasil', {
      title: 'Cek Hasil Kelulusan',
      released: true,
      releaseAtFormatted: formatDateTime(settings.releaseAt),
      hasSchedule: true,
      searched: true,
      nisnQuery,
      results,
      TRACK_LABELS,
      STATUS_LABELS,
      formatDistance,
      dataError: null,
    });
  } catch (err) {
    res.render('hasil', {
      title: 'Cek Hasil Kelulusan',
      released: true,
      releaseAtFormatted: formatDateTime(settings.releaseAt),
      hasSchedule: true,
      searched: true,
      nisnQuery,
      results: [],
      TRACK_LABELS,
      STATUS_LABELS,
      formatDistance,
      dataError: 'Data pendaftar tidak dapat dimuat saat ini. Coba lagi beberapa saat lagi.',
    });
  }
});

module.exports = router;
