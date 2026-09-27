const express = require('express');
const router = express.Router();
const { ADMIN_PASSWORD } = require('../../lib/admin-auth');

router.get('/login', (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect('/admin');
  res.render('admin/login', { title: 'Masuk Admin', error: null });
});

router.post('/login', (req, res) => {
  const password = (req.body.password || '').trim();
  if (password && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }
  res.status(401).render('admin/login', {
    title: 'Masuk Admin',
    error: 'Kata sandi salah. Coba lagi.',
  });
});

router.post('/logout', (req, res) => {
  if (!req.session) return res.redirect('/admin/login');
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

module.exports = router;
