// Perangkingan pendaftar per sekolah per jalur. Selalu dihitung ulang penuh
// dari data pendaftar aktif saat fungsi ini dipanggil (tidak ada cache),
// sehingga hasil selalu konsisten dengan penambahan/edit/penghapusan terbaru.

const TRACKS = ['zonasi', 'prestasi', 'afirmasi'];

function compareByTrack(track, a, b) {
  if (track === 'zonasi') {
    if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
  } else if (track === 'prestasi') {
    const scoreA = Number(a.achievementScore);
    const scoreB = Number(b.achievementScore);
    if (scoreA !== scoreB) return scoreB - scoreA;
  }
  // Jalur afirmasi murni memakai waktu daftar tercepat, dan untuk jalur lain
  // dipakai sebagai tie-breaker deterministik saat nilai utama sama persis.
  return new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime();
}

/**
 * @param {Array} registrants seluruh pendaftar (belum difilter)
 * @param {string} schoolId
 * @param {string} track salah satu dari TRACKS
 * @param {number} quota kuota jalur ini di sekolah tsb
 * @returns {Array} pendaftar pada sekolah+jalur ini, terurut, dengan field rank & status
 */
function rankSchoolTrack(registrants, schoolId, track, quota) {
  const filtered = registrants.filter(
    (r) => r.schoolId === schoolId && r.track === track
  );
  const sorted = [...filtered].sort((a, b) => compareByTrack(track, a, b));
  return sorted.map((registrant, index) => ({
    ...registrant,
    rank: index + 1,
    status: index < quota ? 'diterima' : 'tidak_diterima',
  }));
}

/**
 * Menghitung ranking untuk seluruh jalur pada satu sekolah.
 * @returns {{ zonasi: Array, prestasi: Array, afirmasi: Array }}
 */
function rankSchoolAllTracks(registrants, school) {
  const result = {};
  for (const track of TRACKS) {
    const quota =
      track === 'zonasi'
        ? school.quotaZonasi
        : track === 'prestasi'
        ? school.quotaPrestasi
        : school.quotaAfirmasi;
    result[track] = rankSchoolTrack(registrants, school.id, track, quota || 0);
  }
  return result;
}

/**
 * Mencari status ranking satu pendaftar tertentu (dipakai halaman hasil).
 */
function findRegistrantRank(registrants, schools, registrant) {
  const school = schools.find((s) => s.id === registrant.schoolId);
  if (!school) return null;
  const quota =
    registrant.track === 'zonasi'
      ? school.quotaZonasi
      : registrant.track === 'prestasi'
      ? school.quotaPrestasi
      : school.quotaAfirmasi;
  const ranked = rankSchoolTrack(registrants, school.id, registrant.track, quota || 0);
  const found = ranked.find((r) => r.id === registrant.id);
  return found ? { ...found, school, quota } : null;
}

module.exports = { TRACKS, rankSchoolTrack, rankSchoolAllTracks, findRegistrantRank };
