const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const holidaysController = require('../controllers/holidays-controller');
const validator = require('../middlewares/validator');

router.get('/holidays', validator, authMiddleware, holidaysController.getHolidays);

module.exports = router;