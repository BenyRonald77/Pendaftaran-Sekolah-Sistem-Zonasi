const express = require('express');
const router = express.Router();

const { requireAdmin } = require('../../lib/admin-auth');

router.use(require('./auth'));

router.use(requireAdmin);

router.use('/', require('./dashboard'));
router.use('/sekolah', require('./sekolah'));
router.use('/jadwal', require('./jadwal'));

module.exports = router;
