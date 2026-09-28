// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema(
//   {
//     username: {
//       type: String,
//       required: [true, 'Username is required'],
//       unique: true,
//       trim: true,
//       lowercase: true,
//       minlength: [3, 'Username must be at least 3 characters'],
//     },
//     password: {
//       type: String,
//       required: [true, 'Password is required'],
//       minlength: [6, 'Password must be at least 6 characters'],
//       select: false, // never returned in queries unless explicitly requested
//     },
//     role: {
//       type: String,
//       enum: {
//         values: ['Admin', 'Teacher'],
//         message: 'Role must be either Admin or Teacher',
//       },
//       default: 'Teacher',
//     },
//     // The class a teacher is responsible for (used to restrict what a Teacher can see/record)
//     assignedClassId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Class',
//       default: null,
//     },
//   },
//   { timestamps: true }
// );

// // Hash password before saving (only if modified)
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// // Compare a plain password with the stored hash
// userSchema.methods.comparePassword = function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries unless explicitly requested
    },
    role: {
      type: String,
      enum: {
        values: ['Admin', 'Teacher'],
        message: 'Role must be either Admin or Teacher',
      },
      default: 'Teacher',
    },
    // The class a teacher is responsible for (used to restrict what a Teacher can see/record)
    assignedClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving (only if modified)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare a plain password with the stored hash
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 