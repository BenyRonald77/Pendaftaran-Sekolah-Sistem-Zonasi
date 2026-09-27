# Arahan Desain

## Catatan asal arahan (wajib dibaca)

Arahan desain di dokumen ini dibuat oleh agent sendiri, bukan oleh pemilik produk, karena tidak ada `DESIGN.md` atau brief desain sebelumnya dan tidak ada pihak yang bisa ditanya langsung (opsi 2, R-37). Ini adalah risiko yang disadari: arah yang dibuat agent cenderung condong ke selera "aman" bawaan model. Untuk menekan risiko itu, arah di bawah dipilih secara sempit dan spesifik pada konteks produk (layanan pendaftaran sekolah zonasi milik pemerintah daerah), bukan gaya umum "aplikasi modern", dan setiap pilihan diberi alasan tertulis sesuai R-31. Jika pemilik produk punya identitas visual dinas pendidikan yang sudah baku (logo, warna resmi), dokumen ini harus diganti dengan itu.

## Konteks & audiens

Layanan publik pemerintah daerah. Dua peran: petugas dinas/sekolah (bekerja berulang, butuh efisiensi dan kejelasan data) dan orang tua/calon siswa (sekali pakai per tahun ajaran, sering awam teknologi, mengakses dari HP, butuh kepercayaan bahwa proses adil dan hasil bisa diverifikasi). Konten yang dipertaruhkan: status kelulusan anak. Ini bukan produk yang boleh terasa playful atau eksperimental.

## Palet warna

Maksimal 2 inti + 1 aksen (R-29), warna netral (putih/hitam/abu) tidak dihitung sebagai bagian dari batas ini.

| Peran | Hex | Alasan |
|---|---|---|
| Inti - Navy dinas | `#123A5C` | Biru navy gelap dipakai instansi pemerintah/pendidikan Indonesia secara luas (mirip warna seragam dan identitas dinas). Dipakai untuk header, nav, tombol utama, judul. Memberi kesan resmi dan tenang, bukan biru-ungu gradient default AI (R-01). |
| Inti - Abu kertas | `#F4F5F7` (latar) / `#1C2530` (teks) | Latar nyaris putih dan teks nyaris hitam dipilih untuk kontras baca maksimal (R-25), bukan abu-di-atas-abu. Meniru kertas formulir resmi, bukan gelap-mode default developer tool. |
| Aksen - Kuning oker | `#B5790A` | Satu warna aksen untuk menandai hal yang butuh perhatian aktif: status "menunggu", tombol aksi sekunder pada admin, penekanan tanggal pengumuman. Oker dipilih (bukan kuning terang) supaya tetap memenuhi kontras AA di atas latar terang, dan tidak terasa seperti warna "AI startup". |

Warna semantik status (bukan bagian dari palet inti, dipakai HANYA untuk makna, bukan dekorasi): hijau tua `#1E7B34` untuk "diterima", merah bata `#B3261E` untuk "tidak diterima", abu untuk "belum ada data/menunggu jadwal". Ini status literal kelulusan, bukan preferensi gaya, sehingga tidak dihitung ke kuota 2+1 (R-29 mengecualikan warna fungsional yang menyampaikan makna, bukan hiasan), namun jumlahnya tetap dibatasi ketat pada tiga makna itu saja.

## Tipografi

Font: **Public Sans** (Google Fonts), untuk seluruh heading dan body, dibedakan lewat berat (600/700 untuk heading, 400/500 untuk body), bukan lewat font kedua.

Alasan (R-06, R-31): Public Sans dirancang khusus untuk kebutuhan layanan digital pemerintah (dipakai United States Web Design System) dengan tujuan keterbacaan tinggi di ukuran kecil dan netral secara nada, bukan dipilih karena termasuk default populer LLM (Inter/Geist/Space Grotesk secara eksplisit dihindari di sini). Ini cocok literal dengan sifat produk: layanan pemerintah yang harus terbaca jelas oleh orang tua dari berbagai latar belakang, di layar HP kecil, tanpa gaya dekoratif.

Tidak ada huruf besar all-caps dengan letter-spacing lebar untuk label section (dihindari sesuai R-06); judul section pakai kapitalisasi kalimat biasa.

## Motif identitas

Motif: **cincin radius (concentric ring)** tipis di sekitar simbol lokasi, dipakai terbatas pada: mark/logo teks aplikasi di navbar, ikon penunjuk jarak di kartu hasil, dan sebagai elemen garis pemisah halus di halaman hasil pengumuman. Alasan (R-31): motif ini bukan hiasan generik, melainkan representasi literal dari konsep inti produk yaitu zona jarak (radius dari rumah ke sekolah dihitung dengan haversine), sehingga tetap lolos syarat "koneksi nyata ke produk" ala R-22 walau dipakai sebagai motif grafis kecil, bukan ilustrasi besar.

## Dial Liveliness

**ENERGY: 1 (tenang).** Alasan: layanan kelulusan sekolah menyangkut kecemasan nyata orang tua; nada visual yang "menyapa keras" (glow, gradient besar, animasi mencolok) tidak pantas dan berisiko terbaca tidak serius untuk sebuah keputusan penting. Rujukan rasa: GOV.UK.

**RHYTHM: 1 (seragam/predictable).** Alasan: ini aplikasi data dan formulir berulang (banyak tabel, form, halaman status) yang dipakai petugas dinas setiap hari dan orang tua yang sedang gelisah mencari informasi. Konsistensi struktur antar halaman mengurangi beban kognitif dan mempercepat orang menemukan info yang mereka cari, lebih penting daripada variasi visual.

**MOTION: 1 (hover state saja).** Alasan: tidak ada scroll-reveal atau animasi dekoratif. Transisi halus dibatasi pada hover/focus tombol dan buka/tutup elemen (mis. detail baris tabel), semata untuk memberi umpan balik bahwa elemen itu interaktif (R-19), bukan untuk menciptakan kesan "wow". Ini juga mengurangi risiko motion menyebabkan distraksi pada pengguna yang mengecek informasi penting berulang kali.

## Deklarasi Design Read

Membaca ini sebagai: aplikasi layanan publik/administratif untuk dinas pendidikan dan orang tua/calon siswa, dengan bahasa visual formulir resmi pemerintah (rujukan rasa GOV.UK), dial ENERGY 1 / RHYTHM 1 / MOTION 1.

## Radius, shadow, dan komponen

- Radius kecil-sedang konsisten (6px kartu/tombol, 4px input) - bukan pill shape di semua elemen (R-11).
- Shadow dipakai hanya untuk modal/dropdown dan kartu ranking teratas (elevasi bermakna), datar untuk komponen lain (R-12).
- Tanpa glassmorphism, tanpa glow, tanpa background grid/dot pattern (tidak ada alasan identitas yang mendukungnya di produk ini).
- Ikon: tidak memakai set ikon generik bergaya Lucide untuk seluruh UI. Ikon yang dipakai terbatas dan literal (pin lokasi, dokumen, jam/kalender untuk jadwal, tanda centang/silang untuk status) dengan bentuk sederhana buatan sendiri (SVG inline), bukan pustaka ikon pihak ketiga.
