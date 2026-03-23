const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');

// public routes
router.post('/signup', signup);
router.post('/login', login);

// protected route — need to be logged in
router.get('/me', auth, getMe);

module.exports = router;
