const path = require('path');
const express = require('express');
const session = require('express-session');

const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'zonasi-sekolah-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 4 },
  })
);

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.isAdmin = Boolean(req.session && req.session.isAdmin);
  next();
});

app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Halaman tidak ditemukan',
    statusCode: 404,
    message: 'Halaman yang Anda cari tidak tersedia atau sudah dipindahkan. Periksa kembali alamat yang Anda tuju.',
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', {
    title: 'Terjadi kesalahan',
    statusCode: 500,
    message: 'Terjadi kesalahan pada server saat memproses permintaan Anda. Silakan coba lagi beberapa saat lagi.',
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
