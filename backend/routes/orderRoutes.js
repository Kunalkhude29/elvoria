const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/').post(protect, createOrder).get(protect, admin, getOrders);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

module.exports = router;
