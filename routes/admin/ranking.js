const express = require('express');
const router = express.Router();

const store = require('../../lib/store');
const { TRACKS, rankSchoolTrack } = require('../../lib/ranking');
const { TRACK_LABELS, STATUS_LABELS, formatDistance } = require('../../lib/format');

router.get('/', (req, res) => {
  try {
    const schools = store.readAll('schools');
    const registrants = store.readAll('registrants');
    const schoolId = req.query.schoolId || '';
    const track = TRACKS.includes(req.query.track) ? req.query.track : 'zonasi';

    let ranked = [];
    let school = null;
    if (schoolId) {
      school = schools.find((s) => s.id === schoolId) || null;
      if (school) {
        const quota =
          track === 'zonasi' ? school.quotaZonasi : track === 'prestasi' ? school.quotaPrestasi : school.quotaAfirmasi;
        // Dihitung ulang penuh setiap permintaan, tidak ada cache tersimpan.
        ranked = rankSchoolTrack(registrants, schoolId, track, quota || 0);
      }
    }

    res.render('admin/ranking', {
      title: 'Perangkingan',
      schools,
      schoolId,
      track,
      school,
      ranked,
      TRACK_LABELS,
      STATUS_LABELS,
      formatDistance,
      dataError: null,
    });
  } catch (err) {
    res.render('admin/ranking', {
      title: 'Perangkingan',
      schools: [],
      schoolId: '',
      track: 'zonasi',
      school: null,
      ranked: [],
      TRACK_LABELS,
      STATUS_LABELS,
      formatDistance,
      dataError: 'Data ranking tidak dapat dihitung saat ini karena data pendaftar/sekolah gagal dimuat.',
    });
  }
});

module.exports = router;
