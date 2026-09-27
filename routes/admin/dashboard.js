const express = require('express');
const router = express.Router();

const store = require('../../lib/store');
const settingsLib = require('../../lib/settings');
const { formatDateTime } = require('../../lib/format');

router.get('/', (req, res) => {
  try {
    const schools = store.readAll('schools');
    const settings = settingsLib.getAnnouncementSettings();

    res.render('admin/dashboard', {
      title: 'Dasbor Admin',
      totalSchools: schools.length,
      schools,
      settings,
      releaseAtFormatted: formatDateTime(settings.releaseAt),
      released: settingsLib.isAnnouncementReleased(new Date()),
      dataError: null,
    });
  } catch (err) {
    res.render('admin/dashboard', {
      title: 'Dasbor Admin',
      totalSchools: 0,
      schools: [],
      settings: { releaseAt: null },
      releaseAtFormatted: null,
      released: false,
      dataError: 'Data tidak dapat dimuat saat ini. Muat ulang halaman ini beberapa saat lagi.',
    });
  }
});

module.exports = router;
