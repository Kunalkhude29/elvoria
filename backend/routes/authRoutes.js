const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { sendOtp, verifyOtp } = require('../controllers/authController');

const otpLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 OTP requests per minute
    message: { message: 'Too many OTP requests from this IP, please try again after a minute' }
});

router.post('/user/send-otp', otpLimiter, sendOtp);
router.post('/user/verify-otp', verifyOtp);

module.exports = router;
