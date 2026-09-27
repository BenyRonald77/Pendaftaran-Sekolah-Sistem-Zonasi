const express = require('express');
const router = express.Router();

const store = require('../../lib/store');
const { validateSchoolForm } = require('../../lib/validate');

router.get('/', (req, res) => {
  try {
    const schools = store.readAll('schools');
    res.render('admin/sekolah-list', { title: 'Kelola Sekolah', schools, dataError: null });
  } catch (err) {
    res.render('admin/sekolah-list', {
      title: 'Kelola Sekolah',
      schools: [],
      dataError: 'Data sekolah tidak dapat dimuat saat ini.',
    });
  }
});

router.get('/baru', (req, res) => {
  res.render('admin/sekolah-form', {
    title: 'Tambah Sekolah',
    mode: 'create',
    school: null,
    errors: {},
    values: {
      name: '',
      address: '',
      lat: '',
      lng: '',
      quotaZonasi: '',
      quotaPrestasi: '',
      quotaAfirmasi: '',
    },
  });
});

router.post('/', (req, res) => {
  const { errors, values } = validateSchoolForm(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).render('admin/sekolah-form', {
      title: 'Tambah Sekolah',
      mode: 'create',
      school: null,
      errors,
      values: req.body,
    });
  }
  store.insert('schools', values);
  res.redirect('/admin/sekolah');
});

router.get('/:id/edit', (req, res) => {
  const school = store.findById('schools', req.params.id);
  if (!school) {
    return res.status(404).render('error', {
      title: 'Sekolah tidak ditemukan',
      statusCode: 404,
      message: 'Data sekolah yang ingin Anda ubah tidak ditemukan. Mungkin sudah dihapus.',
    });
  }
  res.render('admin/sekolah-form', {
    title: 'Ubah Sekolah',
    mode: 'edit',
    school,
    errors: {},
    values: school,
  });
});

router.post('/:id', (req, res) => {
  const school = store.findById('schools', req.params.id);
  if (!school) {
    return res.status(404).render('error', {
      title: 'Sekolah tidak ditemukan',
      statusCode: 404,
      message: 'Data sekolah yang ingin Anda ubah tidak ditemukan. Mungkin sudah dihapus.',
    });
  }
  const { errors, values } = validateSchoolForm(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).render('admin/sekolah-form', {
      title: 'Ubah Sekolah',
      mode: 'edit',
      school,
      errors,
      values: req.body,
    });
  }
  store.update('schools', req.params.id, values);
  res.redirect('/admin/sekolah');
});

router.get('/:id/hapus', (req, res) => {
  const school = store.findById('schools', req.params.id);
  if (!school) {
    return res.status(404).render('error', {
      title: 'Sekolah tidak ditemukan',
      statusCode: 404,
      message: 'Data sekolah yang ingin Anda hapus tidak ditemukan. Mungkin sudah dihapus.',
    });
  }
  const registrants = store.readAll('registrants');
  const affectedCount = registrants.filter((r) => r.schoolId === school.id).length;
  res.render('admin/sekolah-hapus', { title: 'Hapus Sekolah', school, affectedCount });
});

router.post('/:id/hapus', (req, res) => {
  const school = store.findById('schools', req.params.id);
  if (!school) return res.redirect('/admin/sekolah');
  const registrants = store.readAll('registrants');
  const affectedCount = registrants.filter((r) => r.schoolId === school.id).length;

  if (affectedCount > 0 && req.body.confirm !== '1') {
    return res.render('admin/sekolah-hapus', { title: 'Hapus Sekolah', school, affectedCount });
  }

  store.remove('schools', school.id);
  res.redirect('/admin/sekolah');
});

module.exports = router;
