const express = require('express');
const router = express.Router();
const { createOrderRequest, getOrderRequests, updateOrderRequestStatus } = require('../controllers/orderRequestController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/', protect, createOrderRequest);
router.get('/', protect, admin, getOrderRequests);
router.put('/:id', protect, admin, updateOrderRequestStatus);

module.exports = router;
