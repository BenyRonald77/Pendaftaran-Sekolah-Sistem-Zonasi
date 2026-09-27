const express = require('express');
const router = express.Router();

const store = require('../../lib/store');
const { haversineDistanceKm } = require('../../lib/haversine');
const { validateRegistrantForm } = require('../../lib/validate');
const { TRACK_LABELS, formatDistance } = require('../../lib/format');

router.get('/daftar', (req, res) => {
  const schools = store.readAll('schools');
  res.render('daftar', {
    title: 'Formulir Pendaftaran',
    schools,
    errors: {},
    values: { name: '', nisn: '', lat: '', lng: '', schoolId: '', track: '', achievementScore: '' },
    TRACK_LABELS,
  });
});

router.post('/daftar', (req, res) => {
  const schools = store.readAll('schools');

  if (schools.length === 0) {
    return res.status(400).render('daftar', {
      title: 'Formulir Pendaftaran',
      schools,
      errors: { _general: 'Belum ada data sekolah yang bisa dipilih. Hubungi dinas pendidikan setempat.' },
      values: req.body,
      TRACK_LABELS,
    });
  }

  const { errors, values } = validateRegistrantForm(req.body, schools);

  if (Object.keys(errors).length > 0) {
    return res.status(400).render('daftar', {
      title: 'Formulir Pendaftaran',
      schools,
      errors,
      values: req.body,
      TRACK_LABELS,
    });
  }

  // Jarak dihitung di server (bukan hanya di client) memakai rumus haversine,
  // supaya hasil selalu konsisten dan tidak bisa dimanipulasi dari browser.
  const distanceKm = haversineDistanceKm(values.lat, values.lng, values.school.lat, values.school.lng);
  const now = new Date().toISOString();

  const registrant = store.insert('registrants', {
    name: values.name,
    nisn: values.nisn,
    lat: values.lat,
    lng: values.lng,
    schoolId: values.schoolId,
    track: values.track,
    achievementScore: values.track === 'prestasi' ? values.achievementScore : null,
    distanceKm,
    registeredAt: now,
  });

  res.redirect(`/daftar/berhasil/${registrant.id}`);
});

router.get('/daftar/berhasil/:id', (req, res) => {
  const registrant = store.findById('registrants', req.params.id);
  if (!registrant) {
    return res.status(404).render('error', {
      title: 'Data pendaftaran tidak ditemukan',
      statusCode: 404,
      message:
        'Konfirmasi pendaftaran ini tidak ditemukan. Jika Anda baru saja mendaftar, simpan NISN Anda dan gunakan halaman Cek Hasil nanti.',
    });
  }
  const school = store.findById('schools', registrant.schoolId);
  res.render('daftar-sukses', {
    title: 'Pendaftaran Berhasil',
    registrant,
    school,
    TRACK_LABELS,
    formatDistance,
  });
});

module.exports = router;
