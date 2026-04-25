const express = require('express');
const router = express.Router();
const { updateProfile, getProfile } = require('../controllers/profileController');
const auth = require('../middleware/auth');

router.put('/', auth, updateProfile);
router.get('/', auth, getProfile);

module.exports = router;
