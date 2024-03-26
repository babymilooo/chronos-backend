const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const adminOrOwnerMiddleware = require('../middlewares/admin-or-owner-middleware');
const eventController = require('../controllers/event-controller');
const validator = require('../middlewares/validator');

router.get('/events/event/:id', validator, authMiddleware, eventController.getEventById);
router.get('/events', validator, authMiddleware, eventController.getYearlyEventsForUser);
router.post('/events', authMiddleware, eventController.createEvent);
router.patch('/events/update/:id', validator, authMiddleware, adminOrOwnerMiddleware, eventController.updateEventById);
router.delete('/events/delete/:id', validator, authMiddleware, adminOrOwnerMiddleware, eventController.deleteEventById);
module.exports = router;