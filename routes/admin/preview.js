const express = require('express');
const router = express.Router();

const store = require('../../lib/store');
const { rankSchoolAllTracks } = require('../../lib/ranking');
const { TRACK_LABELS, STATUS_LABELS, formatDistance } = require('../../lib/format');

// Halaman ini SENGAJA tidak terikat jadwal pengumuman: dipakai admin untuk
// memverifikasi kewajaran data kapan saja, dan ditandai jelas sebagai
// preview internal di halaman itu sendiri (bukan tampilan publik).
router.get('/', (req, res) => {
  try {
    const schools = store.readAll('schools');
    const registrants = store.readAll('registrants');
    const schoolId = req.query.schoolId || '';

    let school = null;
    let ranking = null;
    if (schoolId) {
      school = schools.find((s) => s.id === schoolId) || null;
      if (school) ranking = rankSchoolAllTracks(registrants, school);
    }

    res.render('admin/preview-hasil', {
      title: 'Preview Hasil (Internal)',
      schools,
      schoolId,
      school,
      ranking,
      TRACK_LABELS,
      STATUS_LABELS,
      formatDistance,
      dataError: null,
    });
  } catch (err) {
    res.render('admin/preview-hasil', {
      title: 'Preview Hasil (Internal)',
      schools: [],
      schoolId: '',
      school: null,
      ranking: null,
      TRACK_LABELS,
      STATUS_LABELS,
      formatDistance,
      dataError: 'Data tidak dapat dimuat saat ini.',
    });
  }
});

module.exports = router;
