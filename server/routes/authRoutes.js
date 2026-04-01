const express = require('express');
const router = express.Router();

const { sendOTP, signup, login, logout, getProfile, updateProfile, deleteProfile, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/send-otp', sendOTP);
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', authMiddleware, getProfile);
router.patch('/profile', authMiddleware, updateProfile);
router.patch('/password', authMiddleware, changePassword);
router.delete('/profile', authMiddleware, deleteProfile);

module.exports = router;