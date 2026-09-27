# Pendaftaran Sekolah Sistem Zonasi

Aplikasi web untuk mengelola pendaftaran peserta didik baru berbasis sistem zonasi: dinas/sekolah
mengelola data sekolah, kuota jalur, dan jadwal pengumuman; calon siswa mendaftar dengan menandai
lokasi rumah di peta; sistem menghitung jarak dan menyusun perangkingan otomatis; hasil kelulusan
tayang ke publik hanya setelah jadwal yang ditetapkan admin terlewati.

Dokumen terkait: [`PRD.md`](./PRD.md) untuk kebutuhan fungsional lengkap, [`DESIGN.md`](./DESIGN.md)
untuk arah desain, [`VERIFICATION.md`](./VERIFICATION.md) untuk catatan pengujian manual.

## Instalasi dan Menjalankan

Kebutuhan: Node.js v22 ke atas.

```bash
npm install
npm start
```

Server berjalan di `http://localhost:3000` (port dapat diubah lewat variabel lingkungan `PORT`).

Login admin ada di `http://localhost:3000/admin/login`. Kata sandi default adalah `admin123`,
dikonfigurasi lewat variabel lingkungan `ADMIN_PASSWORD`:

```bash
ADMIN_PASSWORD=kata-sandi-anda PORT=4000 npm start
```

## Mengembalikan Data Contoh (Reseed)

Data disimpan sebagai file JSON di `data/`. Untuk mengembalikan ke data contoh awal (3 sekolah di
Bandung, jadwal pengumuman di masa depan, dan daftar pendaftar kosong):

```bash
npm run reseed
```

Perintah ini menimpa `data/schools.json`, `data/registrants.json`, dan `data/settings.json`.

## Struktur Proyek

```
server.js              Entry point Express, mendaftarkan middleware & router
lib/                    Logika inti: store JSON, haversine, ranking, validasi, format
routes/public/          Route publik: beranda, daftar sekolah, formulir pendaftaran, cek hasil
routes/admin/           Route admin: login, dasbor, sekolah, jadwal, pendaftar, ranking, preview
views/                  Template EJS (partial head/foot dipakai bersama di semua halaman)
public/                 CSS, dan JavaScript client (peta koordinat, toggle navigasi)
data/                   Data JSON: schools.json, registrants.json, settings.json
scripts/reseed.js       Skrip mengembalikan data ke kondisi contoh
```

## Alasan Teknis

**Mengapa rumus haversine ditulis sendiri?** Jarak rumah pendaftar ke sekolah tujuan adalah dasar
pengurutan jalur zonasi (FR-3.4, FR-3.5 di PRD), sehingga harus konsisten dan dapat diverifikasi.
Haversine adalah formula matematika baku untuk jarak antar dua titik koordinat di permukaan bumi;
mengimplementasikannya langsung dengan `Math.sin`/`Math.cos`/`Math.atan2` bawaan JavaScript (lihat
`lib/haversine.js`) menghindari ketergantungan pada pustaka geospasial pihak ketiga untuk perhitungan
yang sebenarnya sederhana, sekaligus membuat logikanya mudah diaudit dan diuji.

**Mengapa Leaflet + OpenStreetMap?** Pendaftar perlu cara yang mudah dipahami orang awam untuk
menunjukkan lokasi rumahnya, dan admin perlu cara yang sama untuk menandai lokasi sekolah. Leaflet
adalah pustaka peta interaktif ringan yang dimuat sebagai aset statis dari CDN publik (bukan API
berbayar), dipasangkan dengan tile OpenStreetMap yang terbuka dan tidak memerlukan kunci API. Karena
peta hanya bersifat bantu-isi, setiap halaman yang memakainya tetap menyediakan input latitude/longitude
manual yang berfungsi penuh meski skrip peta gagal dimuat (lihat `public/js/koordinat-map.js`).

**Mengapa penyimpanan file JSON, bukan database?** Skala aplikasi ini (uji coba/simulasi sistem
zonasi tingkat dinas) tidak memerlukan mesin database terpisah. `lib/store.js` menyediakan operasi
CRUD sinkron sederhana di atas file JSON per koleksi, dengan id `crypto.randomUUID()`. Ini
memudahkan menjalankan aplikasi tanpa instalasi tambahan, dengan konsekuensi yang didokumentasikan
di PRD bagian Batasan (bukan untuk volume transaksi tinggi bersamaan dalam produksi sesungguhnya).

**Mengapa ranking dihitung ulang penuh, bukan disimpan sebagai cache?** Supaya status "sementara
diterima" / "tidak diterima sementara" selalu mencerminkan data pendaftar yang aktif saat itu,
termasuk setelah ada pendaftar baru, pendaftar diedit, atau pendaftar dihapus (FR-4.6). Menyimpan
hasil ranking sebagai cache berisiko menjadi basi dan menyesatkan; `lib/ranking.js` selalu membaca
ulang seluruh data pendaftar dan menghitung urutan dari awal setiap dipanggil.

**Mengapa waktu pengumuman dicek di server?** Supaya tidak bisa dilewati dengan mengubah jam pada
perangkat pengguna. Halaman `/hasil` membandingkan jam server (`new Date()`) dengan jadwal yang
tersimpan di `data/settings.json`, bukan menerima input waktu dari client (FR-5.1, FR-5.2).

## Kriteria Perangkingan per Jalur

- **Zonasi**: diurutkan berdasarkan jarak rumah ke sekolah, terdekat lebih dulu.
- **Prestasi**: diurutkan berdasarkan nilai prestasi, tertinggi lebih dulu.
- **Afirmasi**: diurutkan berdasarkan waktu pendaftaran, tercepat lebih dulu.
- Jika ada nilai yang sama persis pada kriteria utama, urutan lanjutan ditentukan oleh waktu
  pendaftaran paling awal (tie-breaker deterministik).

Pendaftar pada urutan yang masih di dalam kuota jalur tersebut berstatus "Sementara diterima";
di luar kuota berstatus "Tidak diterima sementara".

## Catatan Keamanan Akses Admin

Area admin memakai satu kata sandi (bukan sistem akun berjenjang), sesuai batasan yang tertulis di
`PRD.md`. Jangan pakai kata sandi default `admin123` di lingkungan yang benar-benar diakses publik;
selalu atur `ADMIN_PASSWORD` sebelum deployment sungguhan.
