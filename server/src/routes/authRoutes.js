const express = require('express');
const { login, register, getMe } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/register', protect, authorize('Admin'), register);
router.get('/me', protect, getMe);

module.exports = router;