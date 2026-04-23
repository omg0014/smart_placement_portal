const express = require('express');
const router = express.Router();
const { signup, login, getMe, sendOtp, verifyOtp } = require('../controllers/authController');
const auth = require('../middleware/auth');

// public routes
router.post('/signup', signup);
router.post('/login', login);

// OTP-based signup flow (MojoAuth)
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// protected route — need to be logged in
router.get('/me', auth, getMe);

module.exports = router;
