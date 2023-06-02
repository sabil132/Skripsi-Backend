const router = require('express').Router();

router.use('/employee', require('./employee'));
router.use('/presence', require('./presence'));
router.use('/position', require('./position'));
router.use('/unit', require('./unit'));
router.use('/auth', require('./auth'));

module.exports = router;