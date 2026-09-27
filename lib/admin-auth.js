// Gerbang akses admin sederhana: satu kata sandi yang dikonfigurasi lewat
// variabel lingkungan ADMIN_PASSWORD (lihat README). Ini bukan sistem akun
// berjenjang, sesuai batasan yang tertulis di PRD.

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.redirect('/admin/login');
}

module.exports = { ADMIN_PASSWORD, requireAdmin };
