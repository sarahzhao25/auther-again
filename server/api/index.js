const router = require('express').Router();

router.use('/users', require('./user'));

router.use('/stories', require('./story'));

router.use('/auth', require('./auth'));

module.exports = router;
