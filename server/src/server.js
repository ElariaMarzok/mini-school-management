// require('dotenv').config();

// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const connectDB = require('./config/db');
// require('./models/Class');
// require('./models/User');
// const { notFound, errorHandler } = require('./middleware/error');


// const authRoutes = require('./routes/authRoutes');
// const gradeRoutes = require('./routes/gradeRoutes');
// const classRoutes = require('./routes/classRoutes');
// const studentRoutes = require('./routes/studentRoutes');
// const attendanceRoutes = require('./routes/attendanceRoutes');
// const dashboardRoutes = require('./routes/dashboardRoutes');

// const app = express();

// // ---------- Middlewares ----------
// app.use(helmet());
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || 'http://localhost:5173',
//     credentials: true,
//   })
// );
// app.use(express.json());
// if (process.env.NODE_ENV !== 'production') {
//   app.use(morgan('dev'));
// }

// // ---------- Routes ----------
// app.get('/api/health', (req, res) => {
//   res.status(200).json({ status: 'ok', message: 'School Management API is running' });
// });

// app.use('/api/auth', authRoutes);

// // ---------- Error handling ----------
// app.use(notFound);
// app.use(errorHandler);

// // ---------- Start ----------
// const PORT = process.env.PORT || 5000;

// const start = async () => {
//   try {
//     await connectDB();
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT} (${process.env.NODE_ENV})`);
//     });
//   } catch (error) {
//     console.error('Failed to start server:', error.message);
//     process.exit(1);
//   }
// };

// start();






////////////////////////////////////////////////////////////////////////////////////

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Register models to prevent MissingSchemaError during populate operations
require('./models/Class');
require('./models/User');

const { notFound, errorHandler } = require('./middleware/error');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const classRoutes = require('./routes/classRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// ---------- Middlewares ----------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ---------- Routes ----------
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'School Management API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ---------- Error handling ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (${process.env.NODE_ENV})`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();