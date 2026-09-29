const mongoose = require('mongoose');
const Class = require('../models/Class');
const Grade = require('../models/Grade');
const Student = require('../models/Student');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @route   GET /api/classes?gradeId=xxx
// @access  Private (Admin, Teacher)
const getClasses = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.gradeId) filter.gradeId = req.query.gradeId;

  // Teacher only sees their own assigned class
  if (req.user.role === 'Teacher') {
    filter._id = req.user.assignedClassId;
  }

  const classes = await Class.find(filter).populate('gradeId', 'name').sort({ name: 1 });

  // Attach live student counts (Active students only)
  const counts = await Student.aggregate([
    { $match: { status: 'Active', classId: { $ne: null } } },
    { $group: { _id: '$classId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  const result = classes.map((c) => ({
    ...c.toObject(),
    studentCount: countMap.get(String(c._id)) || 0,
  }));

  res.status(200).json({ count: result.length, classes: result });
});

// @route   POST /api/classes
// @access  Private (Admin)
const createClass = asyncHandler(async (req, res) => {
  const { name, gradeId } = req.body;
  if (!name || !gradeId) throw new ApiError(400, 'Class name and gradeId are required');

  const grade = await Grade.findById(gradeId);
  if (!grade) throw new ApiError(404, 'Grade not found');

  const newClass = await Class.create({ name: name.trim(), gradeId });
  res.status(201).json({ class: newClass });
});

// @route   PUT /api/classes/:id
// @access  Private (Admin)
const updateClass = asyncHandler(async (req, res) => {
  const { name, gradeId } = req.body;
  const cls = await Class.findById(req.params.id);
  if (!cls) throw new ApiError(404, 'Class not found');

  if (gradeId) {
    const grade = await Grade.findById(gradeId);
    if (!grade) throw new ApiError(404, 'Grade not found');
    cls.gradeId = gradeId;
  }
  if (name) cls.name = name.trim();

  await cls.save();
  res.status(200).json({ class: cls });
});

// @route   DELETE /api/classes/:id
// @access  Private (Admin)
const deleteClass = asyncHandler(async (req, res) => {
  const cls = await Class.findById(req.params.id);
  if (!cls) throw new ApiError(404, 'Class not found');

  const studentCount = await Student.countDocuments({ classId: cls._id });
  if (studentCount > 0) {
    throw new ApiError(409, 'Cannot delete a class that still has students assigned to it');
  }

  await cls.deleteOne();
  res.status(200).json({ message: 'Class deleted successfully' });
});

// @route   PATCH /api/classes/:id/assign-students
// @access  Private (Admin)
// body: { studentIds: [id1, id2, ...] }
const assignStudents = asyncHandler(async (req, res) => {
  const { studentIds } = req.body;
  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    throw new ApiError(400, 'studentIds must be a non-empty array');
  }
  const invalid = studentIds.find((id) => !mongoose.Types.ObjectId.isValid(id));
  if (invalid) throw new ApiError(400, `Invalid student id: ${invalid}`);

  const cls = await Class.findById(req.params.id);
  if (!cls) throw new ApiError(404, 'Class not found');

  const result = await Student.updateMany(
    { _id: { $in: studentIds } },
    { $set: { classId: cls._id, gradeId: cls.gradeId } }
  );

  res.status(200).json({
    message: 'Students assigned successfully',
    matched: result.matchedCount,
    modified: result.modifiedCount,
  });
});

module.exports = { getClasses, createClass, updateClass, deleteClass, assignStudents };