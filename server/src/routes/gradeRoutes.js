const express = require('express');
const { getGrades, createGrade, updateGrade, deleteGrade } = require('../controllers/gradeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getGrades);
router.post('/', authorize('Admin'), createGrade);
router.put('/:id', authorize('Admin'), updateGrade);
router.delete('/:id', authorize('Admin'), deleteGrade);

module.exports = router;