const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const adminMiddleware = require('../middlewares/admin-middleware');
const ownerMiddleware = require('../middlewares/owner-middleware');
const adminOrOwnerMiddleware = require('../middlewares/admin-or-owner-middleware');
const eventController = require('../controllers/event-controller');

router.get('/events/event/:id', authMiddleware, eventController.getEventById);
router.get('/events', authMiddleware, eventController.getYearlyEventsForUser);
router.post('/events', authMiddleware, eventController.createEvent);
router.patch('/events/update/:id', authMiddleware, adminOrOwnerMiddleware, eventController.updateEventById);
router.delete('/events/delete/:id', authMiddleware, adminOrOwnerMiddleware, eventController.deleteEventById);

module.exports = router;