const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const normalizeDate = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new ApiError(400, 'Invalid date');
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const assertTeacherOwnsClass = (req, classId) => {
  if (req.user.role === 'Teacher' && String(classId) !== String(req.user.assignedClassId)) {
    throw new ApiError(403, 'Forbidden: this class is not assigned to you');
  }
};

// @route   GET /api/attendance?date=&gradeId=&classId=&studentId=
// @access  Private (Admin, Teacher - own class only)
// - date + classId  -> daily attendance sheet for that class
// - studentId only  -> full attendance history for that student
const getAttendance = asyncHandler(async (req, res) => {
  const { date, gradeId, classId, studentId } = req.query;

  // Case 1: single student's history
  if (studentId && !date) {
    const student = await Student.findById(studentId);
    if (!student) throw new ApiError(404, 'Student not found');
    if (req.user.role === 'Teacher') assertTeacherOwnsClass(req, student.classId);

    const records = await Attendance.find({ studentId }).sort({ date: -1 });
    return res.status(200).json({ count: records.length, records });
  }

  // Case 2: daily sheet by date + grade/class
  if (!date) throw new ApiError(400, 'date is required (or provide studentId for history)');
  if (!classId) throw new ApiError(400, 'classId is required');

  assertTeacherOwnsClass(req, classId);

  const studentFilter = { classId, status: 'Active' };
  if (gradeId) studentFilter.gradeId = gradeId;

  const students = await Student.find(studentFilter).select('name studentCode').sort({ name: 1 });
  const day = normalizeDate(date);

  const records = await Attendance.find({
    date: day,
    studentId: { $in: students.map((s) => s._id) },
  });
  const recordMap = new Map(records.map((r) => [String(r.studentId), r.status]));

  const sheet = students.map((s) => ({
    studentId: s._id,
    studentCode: s.studentCode,
    name: s.name,
    status: recordMap.get(String(s._id)) || null, // null = not recorded yet
  }));

  res.status(200).json({ date: day, classId, count: sheet.length, sheet });
});

// @route   POST /api/attendance
// @access  Private (Admin, Teacher - own class only)
// body: { date, classId, records: [{ studentId, status }, ...] }
// Upserts each record so calling it twice for the same day edits, not duplicates.
const saveAttendance = asyncHandler(async (req, res) => {
  const { date, classId, records } = req.body;

  if (!date || !classId || !Array.isArray(records) || records.length === 0) {
    throw new ApiError(400, 'date, classId and a non-empty records array are required');
  }

  assertTeacherOwnsClass(req, classId);

  const day = normalizeDate(date);
  const validStatuses = ['Present', 'Absent', 'Late'];

  // Make sure every student actually belongs to this class
  const studentIds = records.map((r) => r.studentId);
  const studentsInClass = await Student.find({ _id: { $in: studentIds }, classId }).select('_id');
  const validIdSet = new Set(studentsInClass.map((s) => String(s._id)));

  const operations = records.map(({ studentId, status }) => {
    if (!validIdSet.has(String(studentId))) {
      throw new ApiError(400, `Student ${studentId} does not belong to class ${classId}`);
    }
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status "${status}" for student ${studentId}`);
    }
    return {
      updateOne: {
        filter: { studentId, date: day },
        update: { $set: { status } },
        upsert: true,
      },
    };
  });

  await Attendance.bulkWrite(operations);

  const saved = await Attendance.find({ date: day, studentId: { $in: studentIds } });
  res.status(200).json({ message: 'Attendance saved successfully', date: day, records: saved });
});

// @route   PUT /api/attendance/:id
// @access  Private (Admin, Teacher - own class only)
const updateAttendance = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Present', 'Absent', 'Late'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'status must be one of Present, Absent, Late');
  }

  const record = await Attendance.findById(req.params.id);
  if (!record) throw new ApiError(404, 'Attendance record not found');

  const student = await Student.findById(record.studentId);
  if (req.user.role === 'Teacher') assertTeacherOwnsClass(req, student?.classId);

  record.status = status;
  await record.save();

  res.status(200).json({ record });
});

module.exports = { getAttendance, saveAttendance, updateAttendance };