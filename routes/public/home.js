const express = require('express');
const router = express.Router();

const store = require('../../lib/store');
const settingsLib = require('../../lib/settings');
const { formatDateTime } = require('../../lib/format');

router.get('/', (req, res) => {
  try {
    const schools = store.readAll('schools');
    const registrants = store.readAll('registrants');
    const settings = settingsLib.getAnnouncementSettings();

    const countByTrack = { zonasi: 0, prestasi: 0, afirmasi: 0 };
    for (const r of registrants) {
      if (countByTrack[r.track] !== undefined) countByTrack[r.track] += 1;
    }

    res.render('index', {
      title: 'Beranda',
      schools,
      totalRegistrants: registrants.length,
      countByTrack,
      settings,
      releaseAtFormatted: formatDateTime(settings.releaseAt),
      dataError: null,
    });
  } catch (err) {
    res.render('index', {
      title: 'Beranda',
      schools: [],
      totalRegistrants: 0,
      countByTrack: { zonasi: 0, prestasi: 0, afirmasi: 0 },
      settings: { releaseAt: null },
      releaseAtFormatted: null,
      dataError: 'Data sekolah tidak dapat dimuat saat ini. Muat ulang halaman ini beberapa saat lagi.',
    });
  }
});

module.exports = router;
