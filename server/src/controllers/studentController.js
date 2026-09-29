const Student = require('../models/Student');
const Grade = require('../models/Grade');
const Class = require('../models/Class');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @route   GET /api/students?search=&gradeId=&classId=&status=&page=&limit=
// @access  Private (Admin, Teacher - restricted to their class)
const getStudents = asyncHandler(async (req, res) => {
  const { search, gradeId, classId, status } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  const filter = {};

  if (req.user.role === 'Teacher') {
    if (!req.user.assignedClassId) {
      return res.status(200).json({ count: 0, page, pages: 0, students: [] });
    }
    filter.classId = req.user.assignedClassId;
  } else {
    if (classId) filter.classId = classId;
  }

  if (gradeId) filter.gradeId = gradeId;
  if (status) filter.status = status;

  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ name: regex }, { studentCode: regex }, { parentPhone: regex }];
  }

  const [students, total] = await Promise.all([
    Student.find(filter)
      .populate('gradeId', 'name')
      .populate('classId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Student.countDocuments(filter),
  ]);

  res.status(200).json({
    count: total,
    page,
    pages: Math.ceil(total / limit) || 1,
    students,
  });
});

// @route   GET /api/students/:id
// @access  Private (Admin, Teacher - own class only)
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('gradeId', 'name')
    .populate('classId', 'name');

  if (!student) throw new ApiError(404, 'Student not found');

  if (
    req.user.role === 'Teacher' &&
    String(student.classId?._id) !== String(req.user.assignedClassId)
  ) {
    throw new ApiError(403, 'Forbidden: this student is not in your assigned class');
  }

  res.status(200).json({ student });
});

// @route   POST /api/students
// @access  Private (Admin)
const createStudent = asyncHandler(async (req, res) => {
  const {
    studentCode,
    name,
    dateOfBirth,
    gender,
    parentName,
    parentPhone,
    address,
    gradeId,
    classId,
  } = req.body;

  if (!studentCode || !name || !dateOfBirth || !gender || !parentName || !parentPhone || !gradeId) {
    throw new ApiError(
      400,
      'studentCode, name, dateOfBirth, gender, parentName, parentPhone and gradeId are required'
    );
  }

  const grade = await Grade.findById(gradeId);
  if (!grade) throw new ApiError(404, 'Grade not found');

  if (classId) {
    const cls = await Class.findById(classId);
    if (!cls) throw new ApiError(404, 'Class not found');
    if (String(cls.gradeId) !== String(gradeId)) {
      throw new ApiError(400, 'The selected class does not belong to the selected grade');
    }
  }

  const student = await Student.create({
    studentCode: studentCode.trim(),
    name: name.trim(),
    dateOfBirth,
    gender,
    parentName: parentName.trim(),
    parentPhone: parentPhone.trim(),
    address,
    gradeId,
    classId: classId || null,
  });

  res.status(201).json({ student });
});

// @route   PUT /api/students/:id
// @access  Private (Admin)
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new ApiError(404, 'Student not found');

  const allowedFields = [
    'studentCode',
    'name',
    'dateOfBirth',
    'gender',
    'parentName',
    'parentPhone',
    'address',
    'gradeId',
    'classId',
    'status',
  ];

  if (req.body.gradeId) {
    const grade = await Grade.findById(req.body.gradeId);
    if (!grade) throw new ApiError(404, 'Grade not found');
  }
  if (req.body.classId) {
    const cls = await Class.findById(req.body.classId);
    if (!cls) throw new ApiError(404, 'Class not found');
  }

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) student[field] = req.body[field];
  });

  await student.save();
  res.status(200).json({ student });
});

// @route   DELETE /api/students/:id
// @access  Private (Admin)
// Soft-delete: sets status to "Deactivated" instead of removing the document
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) throw new ApiError(404, 'Student not found');

  student.status = 'Deactivated';
  await student.save();

  res.status(200).json({ message: 'Student deactivated successfully', student });
});

module.exports = { getStudents, getStudentById, createStudent, updateStudent, deleteStudent };