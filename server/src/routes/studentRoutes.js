const express = require('express');
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', authorize('Admin'), createStudent);
router.put('/:id', authorize('Admin'), updateStudent);
router.delete('/:id', authorize('Admin'), deleteStudent);

module.exports = router;