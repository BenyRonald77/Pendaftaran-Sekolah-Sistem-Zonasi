# PRD - Pendaftaran Sekolah Sistem Zonasi

## 1. Ringkasan

Aplikasi web untuk mengelola pendaftaran peserta didik baru berbasis sistem zonasi. Dinas/sekolah mengelola data sekolah, kuota per jalur, dan jadwal pengumuman. Calon siswa mendaftar dengan menandai lokasi rumah di peta, memilih sekolah dan jalur pendaftaran. Sistem menghitung jarak rumah ke sekolah secara otomatis, menyusun perangkingan per sekolah per jalur, dan menampilkan hasil kelulusan kepada publik hanya setelah jadwal pengumuman yang ditetapkan admin terlewati.

## 2. Latar Belakang

Penerimaan siswa baru dengan sistem zonasi mensyaratkan bahwa peserta yang rumahnya lebih dekat ke sekolah pada jalur zonasi mendapat prioritas. Proses ini rawan dipersepsikan tidak transparan jika perhitungan jarak dan urutan ranking dilakukan manual atau tidak konsisten. Aplikasi ini menyediakan mekanisme perhitungan jarak yang konsisten (rumus haversine), perangkingan yang selalu dihitung ulang dari data terkini, dan pengumuman hasil yang dikunci waktu agar seluruh peserta menerima informasi pada saat yang sama.

## 3. Tujuan

1. Menyediakan alat bagi dinas/sekolah untuk mengelola data sekolah, kuota jalur, dan jadwal pengumuman tanpa perlu keahlian teknis.
2. Menghitung jarak rumah pendaftar ke sekolah secara otomatis dan konsisten menggunakan formula haversine.
3. Menghasilkan perangkingan per sekolah per jalur yang selalu mencerminkan data pendaftar terkini (tidak memakai cache basi).
4. Menjamin hasil pengumuman hanya dapat dilihat publik setelah waktu rilis yang ditetapkan, diverifikasi di server.

## 4. Peran Pengguna

| Peran | Deskripsi | Akses utama |
|---|---|---|
| Admin Dinas/Sekolah | Petugas yang mengelola data sekolah, kuota jalur, jadwal pengumuman, dan memantau daftar pendaftar | Login area admin (`/admin`), CRUD sekolah, atur jadwal, lihat ranking dan preview hasil kapan saja |
| Pendaftar/Calon Siswa (dan orang tua) | Mendaftar sebagai calon siswa baru dan mengecek hasil kelulusan | Form pendaftaran publik, halaman cek hasil publik (`/hasil`) |

## 5. Ruang Lingkup

### Termasuk (in scope)

- CRUD data sekolah beserta koordinat dan kuota per jalur (zonasi/prestasi/afirmasi).
- Pengaturan jadwal tanggal+jam rilis pengumuman.
- Form pendaftaran publik dengan input koordinat via peta (Leaflet) atau input manual lat/lng.
- Perhitungan jarak otomatis dengan formula haversine.
- Perangkingan otomatis per sekolah per jalur, dihitung ulang penuh setiap perubahan data pendaftar.
- Halaman publik hasil kelulusan yang dikunci waktu berdasarkan jam server.
- Halaman preview internal admin untuk melihat hasil kapan saja, ditandai jelas sebagai preview internal.
- Dashboard ringkasan untuk admin.

### Tidak termasuk (out of scope)

- Autentikasi berlapis/roles granular (admin memakai satu gerbang akses sederhana, bukan sistem akun multi-user dengan izin bertingkat).
- Verifikasi dokumen/berkas fisik pendaftar (akta, KK, dsb).
- Notifikasi email/SMS otomatis.
- Pembayaran atau biaya pendaftaran (pendaftaran sekolah negeri tidak dipungut biaya, sehingga tidak ada modul pembayaran).
- Pengunggahan dan verifikasi sertifikat prestasi (nilai prestasi diinput sebagai angka oleh pendaftar, verifikasi keabsahan dilakukan di luar sistem oleh panitia).

## 6. User Stories

1. Sebagai admin dinas, saya ingin menambah dan mengubah data sekolah beserta koordinat dan kuota per jalur, supaya data yang dipakai sistem selalu sesuai kondisi terkini.
2. Sebagai admin dinas, saya ingin mengatur tanggal dan jam rilis pengumuman, supaya seluruh pendaftar menerima info pada waktu yang sama dan adil.
3. Sebagai calon siswa/orang tua, saya ingin menandai lokasi rumah saya di peta saat mendaftar, supaya jarak ke sekolah dihitung otomatis tanpa saya perlu menghitung sendiri.
4. Sebagai calon siswa/orang tua yang tidak bisa memakai peta (koneksi lambat/perangkat lama), saya ingin bisa mengisi koordinat lat/lng secara manual, supaya saya tetap bisa mendaftar.
5. Sebagai calon siswa jalur prestasi, saya ingin memasukkan nilai prestasi saya, supaya saya diurutkan berdasarkan nilai tersebut terhadap pendaftar lain di jalur yang sama.
6. Sebagai admin, saya ingin melihat ranking sementara tiap sekolah tiap jalur kapan saja sebagai preview internal, supaya saya bisa memverifikasi kewajaran data sebelum pengumuman resmi.
7. Sebagai calon siswa/orang tua, saya ingin mengecek status kelulusan saya di halaman publik, dan sistem menolak menampilkannya sebelum jadwal resmi, supaya tidak ada pihak yang mendapat informasi lebih awal secara tidak adil.
8. Sebagai admin, saat saya menghapus atau mengedit satu pendaftar, saya ingin seluruh ranking sekolah/jalur terkait otomatis dihitung ulang, supaya data ranking tidak pernah basi.

## 7. Functional Requirements

### Manajemen Sekolah dan Kuota (FR-1.x)

- **FR-1.1** Sistem menyediakan CRUD data sekolah dengan atribut: nama sekolah, alamat, koordinat (latitude, longitude), dan kuota untuk tiga jalur (zonasi, prestasi, afirmasi).
- **FR-1.2** Admin dapat menambah, mengubah, dan menghapus data sekolah melalui halaman admin.
- **FR-1.3** Saat menambah/mengubah sekolah, admin dapat menandai koordinat lewat klik peta (Leaflet) atau mengisi lat/lng secara manual; keduanya harus tetap membuat form valid tersimpan.
- **FR-1.4** Penghapusan sekolah yang masih memiliki pendaftar terdaftar harus meminta konfirmasi eksplisit dan menampilkan jumlah pendaftar yang akan ikut terpengaruh.

### Jadwal Pengumuman (FR-2.x)

- **FR-2.1** Sistem menyimpan satu pengaturan jadwal pengumuman aktif berupa tanggal dan jam rilis (timestamp).
- **FR-2.2** Admin dapat mengubah tanggal dan jam rilis kapan saja melalui halaman pengaturan.
- **FR-2.3** Waktu pembanding pengumuman adalah waktu server saat permintaan diterima, bukan waktu yang dikirim dari client/browser.

### Pendaftaran dan Perhitungan Jarak (FR-3.x)

- **FR-3.1** Form pendaftaran publik meminta: nama lengkap, NISN, koordinat rumah (lat/lng), sekolah tujuan, jalur (zonasi/prestasi/afirmasi), dan nilai prestasi (kondisional).
- **FR-3.2** Nilai prestasi wajib diisi dan divalidasi berupa angka jika jalur yang dipilih adalah prestasi; untuk jalur lain field ini diabaikan.
- **FR-3.3** Koordinat rumah dapat diisi dengan mengklik lokasi pada peta Leaflet (tile OpenStreetMap) yang menampilkan pin dan mengisi field lat/lng secara otomatis, atau diisi langsung secara manual di field lat/lng sebagai fallback bila peta gagal dimuat.
- **FR-3.4** Saat form disimpan, sistem menghitung jarak antara koordinat rumah pendaftar dan koordinat sekolah tujuan menggunakan formula haversine, dihitung di server (bukan hanya di client), dan menyimpan hasilnya dalam satuan kilometer bersama data pendaftar.
- **FR-3.5** Formula haversine diimplementasikan sendiri memakai fungsi trigonometri bawaan bahasa (tanpa pustaka pihak ketiga untuk perhitungan geospasial), dengan radius bumi rata-rata 6371 km:
  ```
  a = sin²(Δlat/2) + cos(lat1) · cos(lat2) · sin²(Δlon/2)
  c = 2 · atan2(√a, √(1−a))
  jarak_km = R · c
  ```
- **FR-3.6** Sistem melakukan validasi input dasar (nama tidak kosong, NISN berupa digit, lat/lng dalam rentang valid -90..90 dan -180..180, sekolah dan jalur harus dipilih dari data yang ada) sebelum data pendaftar disimpan.

### Perangkingan Otomatis (FR-4.x)

- **FR-4.1** Sistem menghasilkan ranking terpisah untuk setiap kombinasi sekolah x jalur.
- **FR-4.2** Jalur zonasi diurutkan berdasarkan jarak rumah ke sekolah, dari yang terdekat ke yang terjauh.
- **FR-4.3** Jalur prestasi diurutkan berdasarkan nilai prestasi, dari yang tertinggi ke yang terendah.
- **FR-4.4** Jalur afirmasi diurutkan berdasarkan waktu pendaftaran, dari yang paling awal mendaftar ke yang paling akhir.
- **FR-4.5** Pendaftar pada posisi urutan yang masih berada dalam kuota jalur tersebut berstatus "Sementara diterima"; pendaftar di luar kuota berstatus "Tidak diterima sementara".
- **FR-4.6** Ranking dihitung ulang secara penuh (bukan menggunakan nilai cache lama) setiap kali ada pendaftar baru ditambahkan, diedit, atau dihapus pada kombinasi sekolah+jalur terkait, sehingga status setiap pendaftar selalu konsisten dengan data pendaftar aktif saat itu.
- **FR-4.7** Jika terdapat nilai yang sama persis pada kriteria pengurutan (jarak atau nilai prestasi), urutan lanjutan ditentukan oleh waktu pendaftaran paling awal sebagai pemecah seri (tie-breaker), supaya urutan tetap deterministik dan dapat direproduksi.

### Pengumuman Hasil Terjadwal (FR-5.x)

- **FR-5.1** Halaman publik hasil kelulusan hanya menampilkan status dan ranking pendaftar jika waktu server saat ini sudah melewati (>=) waktu jadwal pengumuman yang diset admin.
- **FR-5.2** Pengecekan waktu dilakukan di server pada setiap permintaan halaman/endpoint hasil; client tidak dapat memaksa tampil dengan mengubah jam di browser.
- **FR-5.3** Sebelum jadwal terlewati, halaman publik menampilkan pesan "Belum waktunya pengumuman" beserta tanggal dan jam rilis yang dijadwalkan.
- **FR-5.4** Admin memiliki halaman preview internal terpisah yang menampilkan hasil ranking kapan saja tanpa terikat jadwal, dan halaman ini diberi label yang jelas sebagai "Preview internal - bukan tampilan publik".
- **FR-5.5** Pendaftar mencari hasil miliknya di halaman publik dengan memasukkan NISN dan/atau memilih sekolah, tanpa perlu login.

## 8. Data Model

### Tabel `schools`

| Field | Tipe | Keterangan |
|---|---|---|
| id | string (uuid) | Primary key |
| name | string | Nama sekolah |
| address | string | Alamat sekolah |
| lat | number | Latitude lokasi sekolah |
| lng | number | Longitude lokasi sekolah |
| quotaZonasi | number | Kuota jalur zonasi |
| quotaPrestasi | number | Kuota jalur prestasi |
| quotaAfirmasi | number | Kuota jalur afirmasi |
| createdAt | string (ISO datetime) | Waktu dibuat |
| updatedAt | string (ISO datetime) | Waktu diubah terakhir |

### Tabel `registrants`

| Field | Tipe | Keterangan |
|---|---|---|
| id | string (uuid) | Primary key |
| name | string | Nama lengkap pendaftar |
| nisn | string | Nomor Induk Siswa Nasional |
| lat | number | Latitude rumah pendaftar |
| lng | number | Longitude rumah pendaftar |
| schoolId | string (uuid) | Referensi ke `schools.id` |
| track | enum | `zonasi` \| `prestasi` \| `afirmasi` |
| achievementScore | number \| null | Nilai prestasi, wajib jika track = prestasi |
| distanceKm | number | Hasil hitung haversine terhadap sekolah tujuan |
| registeredAt | string (ISO datetime) | Waktu pendaftaran, dipakai untuk urutan afirmasi & tie-breaker |
| createdAt | string (ISO datetime) | Waktu data dibuat |
| updatedAt | string (ISO datetime) | Waktu data diubah |

### Tabel `settings` (dokumen tunggal)

| Field | Tipe | Keterangan |
|---|---|---|
| id | string | Konstanta `"announcement"` |
| releaseAt | string (ISO datetime) | Tanggal+jam rilis pengumuman |
| updatedAt | string (ISO datetime) | Waktu pengaturan terakhir diubah |

## 9. Non-Functional Requirements

- **NFR-1 Akurasi perhitungan jarak.** Implementasi haversine harus konsisten dengan perhitungan manual untuk pasangan koordinat uji (didokumentasikan di `VERIFICATION.md`), dengan toleransi selisih kecil akibat pembulatan floating point.
- **NFR-2 Keadilan perangkingan.** Untuk kombinasi sekolah+jalur yang sama, seluruh pendaftar diurutkan dengan kriteria yang identik dan konsisten (tidak ada pengecualian per-pendaftar), dan hasil perangkingan harus dapat direproduksi ulang dari data yang sama (deterministik, termasuk saat terjadi nilai seri lewat tie-breaker FR-4.7).
- **NFR-3 Anti-bypass jadwal.** Waktu pembanding pengumuman diambil dari jam server, bukan dari input/header yang dikirim client, supaya tidak dapat direkayasa dari browser.
- **NFR-4 Aksesibilitas.** Kontras teks memenuhi WCAG AA, seluruh elemen interaktif dapat dijangkau dan dioperasikan dengan keyboard, ukuran target sentuh minimal 44px, dan form dasar (tanpa peta) tetap dapat disubmit bila JavaScript peta gagal dimuat.
- **NFR-5 Kejelasan status.** Setiap halaman yang menampilkan data (daftar sekolah, ranking, hasil pengumuman) menyediakan tiga kondisi tampilan: kosong (empty), memuat (loading), dan gagal (error) yang actionable (menyertakan penyebab dan langkah lanjutan bila memungkinkan).

## 10. Batasan (Constraints)

- Penyimpanan data memakai file JSON sinkron per koleksi di `data/`, tanpa database eksternal; cocok untuk skala uji coba/simulasi, bukan untuk volume transaksi tinggi bersamaan (concurrent write) dalam produksi sesungguhnya.
- Tidak ada sistem akun/login berjenjang untuk admin; akses admin memakai satu kredensial sederhana yang dikonfigurasi lewat variabel lingkungan, bukan manajemen pengguna penuh.
- Peta memakai tile OpenStreetMap publik via CDN; aplikasi bergantung pada ketersediaan CDN tersebut untuk fitur peta interaktif (fallback input manual disediakan agar fungsi inti form tidak bergantung pada peta).
- Tidak ada mekanisme anti-duplikasi pendaftaran lintas sekolah (satu NISN secara teknis dapat mendaftar ke lebih dari satu sekolah); penanganan kebijakan itu berada di luar cakupan sistem ini.
