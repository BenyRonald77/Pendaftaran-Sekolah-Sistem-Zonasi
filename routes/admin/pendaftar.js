const express = require('express');
const router = express.Router();

const store = require('../../lib/store');
const { haversineDistanceKm } = require('../../lib/haversine');
const { validateRegistrantForm } = require('../../lib/validate');
const { TRACK_LABELS, formatDistance } = require('../../lib/format');

router.get('/', (req, res) => {
  try {
    const schools = store.readAll('schools');
    const registrants = store.readAll('registrants');
    const schoolId = req.query.schoolId || '';
    const track = req.query.track || '';

    let filtered = registrants;
    if (schoolId) filtered = filtered.filter((r) => r.schoolId === schoolId);
    if (track) filtered = filtered.filter((r) => r.track === track);

    filtered = [...filtered].sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

    const withSchool = filtered.map((r) => ({
      ...r,
      school: schools.find((s) => s.id === r.schoolId) || null,
    }));

    res.render('admin/pendaftar-list', {
      title: 'Data Pendaftar',
      schools,
      registrants: withSchool,
      schoolId,
      track,
      TRACK_LABELS,
      formatDistance,
      dataError: null,
    });
  } catch (err) {
    res.render('admin/pendaftar-list', {
      title: 'Data Pendaftar',
      schools: [],
      registrants: [],
      schoolId: '',
      track: '',
      TRACK_LABELS,
      formatDistance,
      dataError: 'Data pendaftar tidak dapat dimuat saat ini.',
    });
  }
});

router.get('/baru', (req, res) => {
  const schools = store.readAll('schools');
  res.render('admin/pendaftar-form', {
    title: 'Tambah Pendaftar',
    mode: 'create',
    schools,
    registrant: null,
    errors: {},
    values: { name: '', nisn: '', lat: '', lng: '', schoolId: '', track: '', achievementScore: '' },
    TRACK_LABELS,
  });
});

router.post('/', (req, res) => {
  const schools = store.readAll('schools');
  const { errors, values } = validateRegistrantForm(req.body, schools);

  if (Object.keys(errors).length > 0) {
    return res.status(400).render('admin/pendaftar-form', {
      title: 'Tambah Pendaftar',
      mode: 'create',
      schools,
      registrant: null,
      errors,
      values: req.body,
      TRACK_LABELS,
    });
  }

  const distanceKm = haversineDistanceKm(values.lat, values.lng, values.school.lat, values.school.lng);
  const now = new Date().toISOString();

  store.insert('registrants', {
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

  res.redirect('/admin/pendaftar');
});

router.get('/:id/edit', (req, res) => {
  const registrant = store.findById('registrants', req.params.id);
  if (!registrant) {
    return res.status(404).render('error', {
      title: 'Pendaftar tidak ditemukan',
      statusCode: 404,
      message: 'Data pendaftar yang ingin Anda ubah tidak ditemukan. Mungkin sudah dihapus.',
    });
  }
  const schools = store.readAll('schools');
  res.render('admin/pendaftar-form', {
    title: 'Ubah Pendaftar',
    mode: 'edit',
    schools,
    registrant,
    errors: {},
    values: registrant,
    TRACK_LABELS,
  });
});

router.post('/:id', (req, res) => {
  const registrant = store.findById('registrants', req.params.id);
  if (!registrant) {
    return res.status(404).render('error', {
      title: 'Pendaftar tidak ditemukan',
      statusCode: 404,
      message: 'Data pendaftar yang ingin Anda ubah tidak ditemukan. Mungkin sudah dihapus.',
    });
  }
  const schools = store.readAll('schools');
  const { errors, values } = validateRegistrantForm(req.body, schools);

  if (Object.keys(errors).length > 0) {
    return res.status(400).render('admin/pendaftar-form', {
      title: 'Ubah Pendaftar',
      mode: 'edit',
      schools,
      registrant,
      errors,
      values: req.body,
      TRACK_LABELS,
    });
  }

  const distanceKm = haversineDistanceKm(values.lat, values.lng, values.school.lat, values.school.lng);

  // Ranking dihitung ulang penuh saat dibaca (lihat lib/ranking.js di fitur
  // berikutnya), jadi di sini cukup menyimpan data pendaftar yang diperbarui.
  store.update('registrants', req.params.id, {
    name: values.name,
    nisn: values.nisn,
    lat: values.lat,
    lng: values.lng,
    schoolId: values.schoolId,
    track: values.track,
    achievementScore: values.track === 'prestasi' ? values.achievementScore : null,
    distanceKm,
  });

  res.redirect('/admin/pendaftar');
});

router.post('/:id/hapus', (req, res) => {
  store.remove('registrants', req.params.id);
  res.redirect('/admin/pendaftar');
});

module.exports = router;
