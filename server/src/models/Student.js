const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentCode: {
      type: String,
      required: [true, 'Student code is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: {
        values: ['Male', 'Female'],
        message: 'Gender must be Male or Female',
      },
      required: [true, 'Gender is required'],
    },
    parentName: {
      type: String,
      required: [true, 'Parent name is required'],
      trim: true,
    },
    parentPhone: {
      type: String,
      required: [true, 'Parent phone is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      required: [true, 'Grade is required'],
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      default: null, // a student can be created first, then assigned to a class
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Deactivated'],
        message: 'Status must be Active or Deactivated',
      },
      default: 'Active',
    },
  },
  { timestamps: true } // createdAt + updatedAt
);

// Helps the search feature (name / phone)
studentSchema.index({ name: 1 });
studentSchema.index({ parentPhone: 1 });

module.exports = mongoose.model('Student', studentSchema);