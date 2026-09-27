const express = require('express');
const router = express.Router();

const store = require('../../lib/store');

router.get('/sekolah', (req, res) => {
  try {
    const schools = store.readAll('schools');
    res.render('sekolah-list', { title: 'Daftar Sekolah', schools, dataError: null });
  } catch (err) {
    res.render('sekolah-list', {
      title: 'Daftar Sekolah',
      schools: [],
      dataError: 'Data sekolah tidak dapat dimuat saat ini. Muat ulang halaman ini beberapa saat lagi.',
    });
  }
});

module.exports = router;
