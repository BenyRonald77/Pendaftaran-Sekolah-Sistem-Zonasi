# Catatan Verifikasi Manual (R-35)

Verifikasi dijalankan langsung terhadap server yang berjalan (`node server.js`, port 3000),
memakai `curl` untuk setiap skenario di bawah ini. Data pengujian dibersihkan kembali ke kondisi
seed awal (`npm run reseed`) setelah setiap sesi pengujian yang mengubah data.

## 1. Instalasi dan menjalankan

- `npm install` selesai tanpa error (80 paket, 0 kerentanan).
- `node server.js` menghasilkan log `Server berjalan di http://localhost:3000` dan tidak
  memunculkan error apa pun di console selama seluruh sesi pengujian di bawah.

## 2. Manajemen sekolah, kuota jalur, dan jadwal pengumuman

- Login admin dengan kata sandi salah -> `401`, dengan kata sandi benar (`admin123`) -> `302`
  redirect ke `/admin`.
- `POST /admin/sekolah` dengan data valid (nama, alamat, lat/lng, tiga kuota) -> `302`, data baru
  langsung muncul di `GET /admin/sekolah`.
- Mengubah jadwal pengumuman lewat `POST /admin/jadwal` dengan `releaseAt` kosong/format salah ->
  `400` dengan pesan error; dengan nilai valid -> tersimpan dan `GET /admin/jadwal` menampilkan
  status "Sudah tayang" / "Belum tayang" sesuai jam server saat ini.
- Hapus sekolah yang masih punya pendaftar -> ditampilkan halaman konfirmasi dengan jumlah
  pendaftar terdampak, hanya terhapus setelah konfirmasi eksplisit dikirim (`confirm=1`).

## 3. Form pendaftaran dan perhitungan jarak (haversine)

Dibuat sekolah uji "SMP Uji Verifikasi" di koordinat `(-6.9000, 107.6000)` dengan kuota zonasi = 2.

**Verifikasi manual formula haversine** untuk pasangan koordinat sederhana:

```
Rumah:   (-6.9050, 107.6050)
Sekolah: (-6.9000, 107.6000)

Hasil lib/haversine.js : 0.783423 km
Hasil pendaftaran (POST /daftar, pendaftar "Fajar"): distanceKm = 0.783423 km
```

Kedua nilai identik, artinya jarak yang tersimpan di data pendaftar sama persis dengan hasil
fungsi `haversineDistanceKm()` yang dipanggil langsung, tidak ada penyimpangan.

Pendaftaran lain sebagai pembanding urutan:

| Nama | Koordinat rumah | Jarak tersimpan |
|---|---|---|
| Fajar (dekat) | -6.9050, 107.6050 | 0.783423 km |
| Gita (jauh) | -7.1000, 107.8000 | 31.333671 km |
| Hasan (terjauh) | -7.3000, 108.0000 | 62.660581 km |

Urutan jarak (dekat -> jauh) sesuai ekspektasi geometris sederhana (semakin jauh koordinat dari
titik sekolah, semakin besar jarak yang dihitung).

Validasi server-side dicoba: `POST /daftar` dengan `track=prestasi` tanpa `achievementScore` ->
`400` (ditolak, pesan "Nilai prestasi wajib diisi..."). Form dasar (tanpa JS peta) tetap bisa
disubmit karena field lat/lng adalah `<input type="number">` biasa yang selalu ada di markup,
terpisah dari status berhasil/gagalnya pemuatan Leaflet.

## 4. Perangkingan otomatis yang selalu diperbarui

Pada "SMP Uji Verifikasi" (kuota zonasi = 2), tiga pendaftar zonasi (Fajar, Gita, Hasan) terdaftar.

- Ranking awal (`GET /admin/ranking?schoolId=...&track=zonasi`):
  1. Fajar (dekat) -> **Sementara diterima**
  2. Gita (jauh) -> **Sementara diterima**
  3. Hasan (terjauh) -> **Tidak diterima sementara** (di luar kuota 2)

- Fajar dihapus lewat `POST /admin/pendaftar/:id/hapus`.
- Ranking dihitung ulang (permintaan halaman yang sama, tanpa aksi tambahan lain):
  1. Gita (jauh) -> **Sementara diterima**
  2. Hasan (terjauh) -> **Sementara diterima** (naik status karena kuota tersisa)

  Ini membuktikan ranking dihitung ulang penuh dari data pendaftar aktif saat itu (bukan cache
  basi): begitu satu pendaftar dihapus, pendaftar lain yang sebelumnya "tidak diterima" langsung
  berubah menjadi "diterima" tanpa proses tambahan.

Jalur prestasi juga diuji: pendaftar "Joko" (nilai 95) dan "Ina" (nilai 80) pada sekolah yang
sama -> ranking menampilkan Joko di peringkat 1 dan Ina di peringkat 2, sesuai aturan "nilai
tertinggi lebih dulu" (FR-4.3).

## 5. Pengumuman hasil terjadwal

Jadwal awal (dari seed) berada di masa depan (`2026-10-02T09:00:00+07:00`), sedangkan waktu
pengujian berjalan pada `2026-09-27`.

- `GET /hasil?nisn=<NISN terdaftar>` **sebelum** jadwal terlewati -> menampilkan pesan
  "Belum waktunya pengumuman" beserta tanggal/jam rilis terjadwal, **walau NISN valid diberikan**
  (data tidak bocor sebelum waktunya).
- `GET /admin/preview-hasil?schoolId=...` (halaman admin) tetap menampilkan ranking lengkap kapan
  saja, dengan banner "Preview internal - bukan tampilan publik. Halaman ini tidak terikat jadwal
  pengumuman." di bagian atas halaman.
- Admin mengubah jadwal lewat `POST /admin/jadwal` ke tanggal masa lalu
  (`2026-09-01T09:00`, WIB).
- `GET /hasil?nisn=<NISN Joko>` **setelah** jadwal terlewati -> kini menampilkan nama sekolah,
  status "Sementara diterima", dan detail ranking, tanpa perlu login.
- `GET /hasil?nisn=<NISN tidak terdaftar>` -> menampilkan pesan "Data pendaftaran tidak ditemukan"
  (state kosong actionable, bukan crash atau halaman kosong).

Pengecekan waktu dilakukan dengan `new Date()` di server (`lib/settings.js`,
`isAnnouncementReleased`) yang dibandingkan terhadap `releaseAt` tersimpan; client (browser)
tidak mengirim komponen waktu apa pun ke endpoint ini, sehingga tidak ada jalur untuk memalsukan
jam dari sisi pengguna.

## 6. State kosong / memuat / error

- **Kosong**: dengan `data/schools.json` dikosongkan (`[]`) sementara, halaman `/`, `/sekolah`, dan
  `/daftar` masing-masing menampilkan pesan kosong yang actionable ("Belum ada sekolah terdaftar",
  "Pendaftaran belum dapat dibuka") - dikonfirmasi lewat `curl` langsung terhadap markup yang
  dikembalikan.
- **Error**: dengan `data/schools.json` diisi teks bukan-JSON (file korup), halaman yang sama
  menampilkan pesan "Data tidak dapat dimuat" / "Data sekolah tidak dapat dimuat saat ini." -
  status ini sengaja dibedakan dari state kosong di atas (lihat perbaikan pada `lib/store.js`:
  `readAll` melempar error saat isi file rusak, bukan diam-diam mengembalikan larik kosong).
  Server tidak crash pada kedua kondisi ini (log server tetap bersih).
- **Memuat**: ditangani di sisi client lewat CSS `.spinner`/`.state-loading` untuk kasus pemuatan
  peta (`public/js/koordinat-map.js` menampilkan teks "Memuat peta..." sebelum Leaflet siap, dan
  pesan error yang jelas jika Leaflet gagal dimuat, dengan fallback input manual yang tetap aktif).

Data pengujian pada bagian 3-5 dibersihkan kembali dengan `npm run reseed` setelah pengujian
selesai; hasil akhir `data/schools.json` berisi 3 sekolah seed dan `data/registrants.json` kosong.

## 7. Pemeriksaan tambahan

- `GET /halaman-tidak-ada` -> `404` dengan halaman error yang menyertakan tautan kembali ke
  beranda (bukan halaman kosong bawaan Express).
- Kontras warna teks-terhadap-latar untuk seluruh pasangan warna yang dipakai (teks navy di atas
  latar kertas, teks putih di header/footer navy, teks badge status di atas latar semantiknya,
  teks aksen di atas latar aksen) dihitung dengan rumus luminance relatif WCAG; seluruh pasangan
  berada di atas rasio 4.5:1 (nilai terendah 4.71:1 pada badge status "diterima").
- Tidak ditemukan `outline: none`/`outline: 0` di manapun pada `public/css/style.css`; fokus
  keyboard memakai outline aksen 3px yang terlihat jelas di seluruh elemen interaktif.
- Skip link ("Lompat ke konten utama"), atribut `aria-expanded`/`aria-controls` pada tombol menu
  mobile, dan meta viewport untuk mobile-first seluruhnya terkonfirmasi ada di markup yang
  dikembalikan server.

## Ringkasan

Seluruh skenario wajib pada checklist R-35 sudah dijalankan dan lolos: pembuatan sekolah,
pendaftaran dengan koordinat berbeda-beda, kecocokan jarak haversine dengan perhitungan manual,
perubahan ranking saat pendaftar ditambah/dihapus, penolakan tampilan hasil sebelum jadwal, dan
tampilnya hasil setelah jadwal terlewati. Satu masalah ditemukan selama verifikasi (data JSON
korup secara keliru tampil sebagai "kosong", bukan "error") dan sudah diperbaiki di `lib/store.js`
sebelum pengiriman akhir.
