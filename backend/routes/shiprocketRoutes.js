const express = require('express');
const router = express.Router();
const { pushOrderToShiprocket, webhook, checkServiceability, trackOrder } = require('../controllers/shiprocketController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/order/:id', protect, admin, pushOrderToShiprocket);
router.post('/webhook', webhook);
router.get('/serviceability', checkServiceability);
router.get('/track/:awb', trackOrder);

module.exports = router;
