const Student = require('../models/Student');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const asyncHandler = require('../utils/asyncHandler');

const startOfDay = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// @route   GET /api/dashboard
// @access  Private (Admin)
const getDashboard = asyncHandler(async (req, res) => {
  const today = startOfDay(new Date());

  const [totalStudents, totalClasses, todayRecords] = await Promise.all([
    Student.countDocuments({ status: 'Active' }),
    Class.countDocuments(),
    Attendance.find({ date: today }),
  ]);

  const todayPresent = todayRecords.filter((r) => r.status === 'Present' || r.status === 'Late').length;
  const todayAbsent = todayRecords.filter((r) => r.status === 'Absent').length;

  // Last 7 days (including today) attendance breakdown for the chart
  const sevenDaysAgo = startOfDay(new Date());
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

  const weekRecords = await Attendance.find({ date: { $gte: sevenDaysAgo, $lte: today } });

  const byDay = new Map();
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(sevenDaysAgo);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, { date: key, present: 0, absent: 0, late: 0 });
  }

  weekRecords.forEach((r) => {
    const key = r.date.toISOString().slice(0, 10);
    const entry = byDay.get(key);
    if (!entry) return;
    if (r.status === 'Present') entry.present += 1;
    if (r.status === 'Absent') entry.absent += 1;
    if (r.status === 'Late') entry.late += 1;
  });

  res.status(200).json({
    totalStudents,
    totalClasses,
    todayAttendance: todayPresent,
    todayAbsence: todayAbsent,
    last7Days: Array.from(byDay.values()),
  });
});

module.exports = { getDashboard };