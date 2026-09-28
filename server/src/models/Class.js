const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      required: [true, 'Grade is required'],
      index: true,
    },
  },
  { timestamps: true }
);

// A class name must be unique within the same grade (e.g. only one "Class A" in Grade 1)
classSchema.index({ name: 1, gradeId: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);