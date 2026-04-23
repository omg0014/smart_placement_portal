const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// All notification routes are protected
router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
