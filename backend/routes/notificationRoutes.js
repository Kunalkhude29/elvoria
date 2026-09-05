const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/subscribe', protect, subscribe);
router.delete('/subscribe', protect, unsubscribe);

module.exports = router;
