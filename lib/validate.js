// Validasi input formulir dilakukan di server (bukan hanya di client) supaya
// data yang tersimpan selalu konsisten terlepas dari apakah JavaScript
// client aktif atau form dikirim manual.

const TRACKS = ['zonasi', 'prestasi', 'afirmasi'];

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function validateSchoolForm(body) {
  const errors = {};
  const name = (body.name || '').trim();
  if (!name) errors.name = 'Nama sekolah tidak boleh kosong.';

  const address = (body.address || '').trim();
  if (!address) errors.address = 'Alamat tidak boleh kosong.';

  const lat = parseFloat(body.lat);
  const lng = parseFloat(body.lng);
  if (!isFiniteNumber(lat) || lat < -90 || lat > 90) {
    errors.lat = 'Latitude harus berupa angka di antara -90 dan 90.';
  }
  if (!isFiniteNumber(lng) || lng < -180 || lng > 180) {
    errors.lng = 'Longitude harus berupa angka di antara -180 dan 180.';
  }

  const quotaZonasi = parseInt(body.quotaZonasi, 10);
  const quotaPrestasi = parseInt(body.quotaPrestasi, 10);
  const quotaAfirmasi = parseInt(body.quotaAfirmasi, 10);
  if (!Number.isInteger(quotaZonasi) || quotaZonasi < 0) {
    errors.quotaZonasi = 'Kuota zonasi harus angka bulat 0 atau lebih.';
  }
  if (!Number.isInteger(quotaPrestasi) || quotaPrestasi < 0) {
    errors.quotaPrestasi = 'Kuota prestasi harus angka bulat 0 atau lebih.';
  }
  if (!Number.isInteger(quotaAfirmasi) || quotaAfirmasi < 0) {
    errors.quotaAfirmasi = 'Kuota afirmasi harus angka bulat 0 atau lebih.';
  }

  return {
    errors,
    values: { name, address, lat, lng, quotaZonasi, quotaPrestasi, quotaAfirmasi },
  };
}

function validateRegistrantForm(body, schools) {
  const errors = {};

  const name = (body.name || '').trim();
  if (!name) errors.name = 'Nama tidak boleh kosong.';

  const nisn = (body.nisn || '').trim();
  if (!/^\d{5,20}$/.test(nisn)) {
    errors.nisn = 'NISN harus berupa angka, 5 sampai 20 digit.';
  }

  const lat = parseFloat(body.lat);
  const lng = parseFloat(body.lng);
  if (!isFiniteNumber(lat) || lat < -90 || lat > 90) {
    errors.lat = 'Latitude harus berupa angka di antara -90 dan 90.';
  }
  if (!isFiniteNumber(lng) || lng < -180 || lng > 180) {
    errors.lng = 'Longitude harus berupa angka di antara -180 dan 180.';
  }

  const schoolId = body.schoolId || '';
  const school = schools.find((s) => s.id === schoolId) || null;
  if (!school) errors.schoolId = 'Pilih sekolah tujuan yang valid.';

  const track = body.track || '';
  if (!TRACKS.includes(track)) {
    errors.track = 'Pilih jalur pendaftaran (zonasi, prestasi, atau afirmasi).';
  }

  let achievementScore = null;
  if (track === 'prestasi') {
    achievementScore = parseFloat(body.achievementScore);
    if (!isFiniteNumber(achievementScore) || achievementScore < 0) {
      errors.achievementScore = 'Nilai prestasi wajib diisi berupa angka untuk jalur prestasi.';
    }
  }

  return {
    errors,
    values: { name, nisn, lat, lng, schoolId, school, track, achievementScore },
  };
}

module.exports = { validateSchoolForm, validateRegistrantForm, TRACKS };
