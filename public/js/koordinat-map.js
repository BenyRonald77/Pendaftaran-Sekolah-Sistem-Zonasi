// Inisialisasi peta Leaflet untuk memilih koordinat (rumah pendaftar atau
// lokasi sekolah). Jika Leaflet/tile OpenStreetMap gagal dimuat (mis. CDN
// diblokir jaringan), peta disembunyikan dan digantikan pesan yang mengarahkan
// pengguna mengisi latitude/longitude secara manual. Input manual selalu ada
// di markup terlepas dari berhasil-tidaknya peta, sehingga form tetap bisa
// disubmit tanpa JS peta.

(function () {
  function setStatus(mapId, message, isError) {
    var status = document.querySelector('[data-map-status-for="' + mapId + '"]');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('map-status--error', Boolean(isError));
  }

  function initMap(container) {
    var latInput = document.getElementById(container.dataset.latInput);
    var lngInput = document.getElementById(container.dataset.lngInput);
    if (!latInput || !lngInput) return;

    var defaultLat = parseFloat(container.dataset.defaultLat || '-6.9147');
    var defaultLng = parseFloat(container.dataset.defaultLng || '107.6098');
    var startLat = parseFloat(latInput.value);
    var startLng = parseFloat(lngInput.value);
    if (Number.isNaN(startLat)) startLat = defaultLat;
    if (Number.isNaN(startLng)) startLng = defaultLng;

    var map = L.map(container.id).setView([startLat, startLng], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    var marker = L.marker([startLat, startLng], { draggable: true }).addTo(map);

    function applyLatLng(latlng) {
      latInput.value = latlng.lat.toFixed(6);
      lngInput.value = latlng.lng.toFixed(6);
      marker.setLatLng(latlng);
    }

    map.on('click', function (event) {
      applyLatLng(event.latlng);
    });

    marker.on('dragend', function () {
      applyLatLng(marker.getLatLng());
    });

    setStatus(container.id, 'Peta siap. Klik peta atau geser pin untuk mengatur lokasi.', false);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var containers = document.querySelectorAll('[data-koordinat-map]');
    containers.forEach(function (container) {
      try {
        if (typeof L === 'undefined') {
          throw new Error('Pustaka peta (Leaflet) tidak termuat');
        }
        initMap(container);
      } catch (err) {
        container.style.display = 'none';
        setStatus(
          container.id,
          'Peta tidak dapat dimuat. Isi koordinat latitude/longitude secara manual di bawah ini.',
          true
        );
      }
    });
  });
})();
