const express = require('express');
const { getAttendance, saveAttendance, updateAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Admin', 'Teacher')); // both roles allowed, ownership checked inside controller

router.get('/', getAttendance);
router.post('/', saveAttendance);
router.put('/:id', updateAttendance);

module.exports = router;