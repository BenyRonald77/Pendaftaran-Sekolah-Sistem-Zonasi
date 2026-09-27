// Toggle menu navigasi mobile. Murni state toggle (buka/tutup), sesuai dial
// MOTION 1: tanpa animasi hias, hanya umpan balik bahwa tombol berfungsi.

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var links = document.querySelector('[data-nav-links]');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  });
})();
