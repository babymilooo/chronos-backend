const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const holidaysController = require('../controllers/holidays-controller');

router.get('/holidays', authMiddleware, holidaysController.getHolidays);

module.exports = router;