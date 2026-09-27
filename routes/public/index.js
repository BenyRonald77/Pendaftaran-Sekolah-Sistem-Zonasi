const express = require('express');
const router = express.Router();

router.use(require('./home'));
router.use(require('./sekolah'));
router.use(require('./daftar'));

module.exports = router;
