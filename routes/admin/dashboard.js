const express = require('express');
const router = express.Router();

const store = require('../../lib/store');
const settingsLib = require('../../lib/settings');
const { TRACKS, rankSchoolAllTracks } = require('../../lib/ranking');
const { formatDateTime } = require('../../lib/format');

router.get('/', (req, res) => {
  try {
    const schools = store.readAll('schools');
    const registrants = store.readAll('registrants');
    const settings = settingsLib.getAnnouncementSettings();

    const countByTrack = { zonasi: 0, prestasi: 0, afirmasi: 0 };
    for (const r of registrants) {
      if (countByTrack[r.track] !== undefined) countByTrack[r.track] += 1;
    }

    const schoolSummaries = schools.map((school) => {
      const ranking = rankSchoolAllTracks(registrants, school);
      const acceptedCount = TRACKS.reduce(
        (sum, track) => sum + ranking[track].filter((r) => r.status === 'diterima').length,
        0
      );
      const totalCount = TRACKS.reduce((sum, track) => sum + ranking[track].length, 0);
      return { school, acceptedCount, totalCount };
    });

    res.render('admin/dashboard', {
      title: 'Dasbor Admin',
      totalSchools: schools.length,
      totalRegistrants: registrants.length,
      countByTrack,
      schools,
      schoolSummaries,
      settings,
      releaseAtFormatted: formatDateTime(settings.releaseAt),
      released: settingsLib.isAnnouncementReleased(new Date()),
      dataError: null,
    });
  } catch (err) {
    res.render('admin/dashboard', {
      title: 'Dasbor Admin',
      totalSchools: 0,
      totalRegistrants: 0,
      countByTrack: { zonasi: 0, prestasi: 0, afirmasi: 0 },
      schools: [],
      schoolSummaries: [],
      settings: { releaseAt: null },
      releaseAtFormatted: null,
      released: false,
      dataError: 'Data tidak dapat dimuat saat ini. Muat ulang halaman ini beberapa saat lagi.',
    });
  }
});

module.exports = router;
