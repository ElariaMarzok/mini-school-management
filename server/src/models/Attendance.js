const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      // Normalize to the start of the day (UTC) so one record = one student per day
      set: (value) => {
        const d = new Date(value);
        d.setUTCHours(0, 0, 0, 0);
        return d;
      },
    },
    status: {
      type: String,
      enum: {
        values: ['Present', 'Absent', 'Late'],
        message: 'Status must be Present, Absent or Late',
      },
      required: [true, 'Attendance status is required'],
    },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for the same student on the same day
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
// Speeds up "attendance by date" and dashboard queries
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);