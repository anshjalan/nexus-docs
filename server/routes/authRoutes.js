const express = require('express');
const router = express.Router();

const { sendOTP, signup, login, logout, updateProfile, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/send-otp', sendOTP);
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.patch('/profile', authMiddleware, updateProfile);
router.patch('/password', authMiddleware, changePassword);

module.exports = router;