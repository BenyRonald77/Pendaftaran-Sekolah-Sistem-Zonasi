const express = require('express');
const router = express.Router();

router.use(require('./home'));
router.use(require('./sekolah'));

module.exports = router;
