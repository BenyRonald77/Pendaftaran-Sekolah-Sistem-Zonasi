// Helper format tanggal/angka dalam Bahasa Indonesia, dipakai lintas view.

function formatDateTime(isoString) {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB';
}

function formatDistance(km) {
  if (km === null || km === undefined || Number.isNaN(km)) return '-';
  return `${km.toFixed(2)} km`;
}

function toDatetimeLocalInput(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  // Dikonversi ke WIB (UTC+7) untuk mengisi input type="datetime-local".
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${wib.getUTCFullYear()}-${pad(wib.getUTCMonth() + 1)}-${pad(wib.getUTCDate())}T${pad(
    wib.getUTCHours()
  )}:${pad(wib.getUTCMinutes())}`;
}

const TRACK_LABELS = {
  zonasi: 'Zonasi',
  prestasi: 'Prestasi',
  afirmasi: 'Afirmasi',
};

const STATUS_LABELS = {
  diterima: 'Sementara diterima',
  tidak_diterima: 'Tidak diterima sementara',
};

module.exports = {
  formatDateTime,
  formatDistance,
  toDatetimeLocalInput,
  TRACK_LABELS,
  STATUS_LABELS,
};
