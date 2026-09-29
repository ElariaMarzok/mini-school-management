const express = require('express');
const {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  assignStudents,
} = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getClasses);
router.post('/', authorize('Admin'), createClass);
router.put('/:id', authorize('Admin'), updateClass);
router.delete('/:id', authorize('Admin'), deleteClass);
router.patch('/:id/assign-students', authorize('Admin'), assignStudents);

module.exports = router;