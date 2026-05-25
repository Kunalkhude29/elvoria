const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment, createCODOrder } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

// UPI / Online payment via Razorpay (TEST MODE)
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

// Cash on Delivery
router.post('/cod/create-order', protect, createCODOrder);

module.exports = router;
