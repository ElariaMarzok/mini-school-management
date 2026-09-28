const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sanitizeUser = (user) => ({
  _id: user._id,
  username: user.username,
  role: user.role,
  assignedClassId: user.assignedClassId,
});

// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ApiError(400, 'Username and password are required');
  }

  const user = await User.findOne({ username: String(username).toLowerCase().trim() }).select(
    '+password'
  );

  // Same message for both cases so we don't reveal which usernames exist
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid username or password');
  }

  res.status(200).json({
    token: generateToken(user),
    user: sanitizeUser(user),
  });
});

// @route   POST /api/auth/register
// @access  Private (Admin only) - used to create Teachers / other Admins
const register = asyncHandler(async (req, res) => {
  const { username, password, role, assignedClassId } = req.body;

  if (!username || !password) {
    throw new ApiError(400, 'Username and password are required');
  }

  const user = await User.create({
    username,
    password,
    role,
    assignedClassId: assignedClassId || null,
  });

  res.status(201).json({ user: sanitizeUser(user) });
});

// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('assignedClassId', 'name gradeId');
  res.status(200).json({ user });
});

module.exports = { login, register, getMe };