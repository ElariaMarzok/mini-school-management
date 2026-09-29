const Grade = require('../models/Grade');
const Class = require('../models/Class');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @route   GET /api/grades
// @access  Private (Admin, Teacher)
const getGrades = asyncHandler(async (req, res) => {
  const grades = await Grade.find().sort({ name: 1 });
  res.status(200).json({ count: grades.length, grades });
});

// @route   POST /api/grades
// @access  Private (Admin)
const createGrade = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) throw new ApiError(400, 'Grade name is required');

  const grade = await Grade.create({ name: name.trim() });
  res.status(201).json({ grade });
});

// @route   PUT /api/grades/:id
// @access  Private (Admin)
const updateGrade = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const grade = await Grade.findById(req.params.id);
  if (!grade) throw new ApiError(404, 'Grade not found');

  if (name) grade.name = name.trim();
  await grade.save();

  res.status(200).json({ grade });
});

// @route   DELETE /api/grades/:id
// @access  Private (Admin)
const deleteGrade = asyncHandler(async (req, res) => {
  const grade = await Grade.findById(req.params.id);
  if (!grade) throw new ApiError(404, 'Grade not found');

  const classCount = await Class.countDocuments({ gradeId: grade._id });
  if (classCount > 0) {
    throw new ApiError(409, 'Cannot delete a grade that still has classes assigned to it');
  }

  await grade.deleteOne();
  res.status(200).json({ message: 'Grade deleted successfully' });
});

module.exports = { getGrades, createGrade, updateGrade, deleteGrade };