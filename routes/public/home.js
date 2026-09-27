const express = require('express');
const router = express.Router();

const store = require('../../lib/store');
const settingsLib = require('../../lib/settings');
const { formatDateTime } = require('../../lib/format');

router.get('/', (req, res) => {
  try {
    const schools = store.readAll('schools');
    const settings = settingsLib.getAnnouncementSettings();

    res.render('index', {
      title: 'Beranda',
      schools,
      settings,
      releaseAtFormatted: formatDateTime(settings.releaseAt),
      dataError: null,
    });
  } catch (err) {
    res.render('index', {
      title: 'Beranda',
      schools: [],
      settings: { releaseAt: null },
      releaseAtFormatted: null,
      dataError: 'Data sekolah tidak dapat dimuat saat ini. Muat ulang halaman ini beberapa saat lagi.',
    });
  }
});

module.exports = router;
