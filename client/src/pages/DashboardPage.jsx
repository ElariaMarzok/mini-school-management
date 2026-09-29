import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <TeacherDashboard />;
}

// ---------------- Admin view ----------------
function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard')
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">{error}</div>;
  }

  const chartData = data.last7Days.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={data.totalStudents} accent="blue" />
        <StatCard label="Total Classes" value={data.totalClasses} accent="purple" />
        <StatCard label="Today's Attendance" value={data.todayAttendance} accent="green" />
        <StatCard label="Today's Absence" value={data.todayAbsence} accent="red" />
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-700">
          Attendance — Last 7 Days
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="present" name="Present" fill="#16a34a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="late" name="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="absent" name="Absent" fill="#dc2626" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---------------- Teacher view ----------------
// The /api/dashboard endpoint is Admin-only in the backend, so Teachers get a
// lighter summary built from their own assigned class's attendance for today.
function TeacherDashboard() {
  const { user } = useAuth();
  const [sheet, setSheet] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!user?.assignedClassId) {
      setLoading(false);
      return;
    }
    api
      .get('/attendance', { params: { date: today, classId: user.assignedClassId } })
      .then(({ data }) => setSheet(data.sheet))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load attendance'))
      .finally(() => setLoading(false));
  }, [user, today]);

  if (loading) return <LoadingSpinner />;

  if (!user?.assignedClassId) {
    return (
      <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-700">
        You don't have an assigned class yet. Please contact the administrator.
      </div>
    );
  }

  const present = sheet.filter((s) => s.status === 'Present').length;
  const absent = sheet.filter((s) => s.status === 'Absent').length;
  const late = sheet.filter((s) => s.status === 'Late').length;
  const notRecorded = sheet.filter((s) => !s.status).length;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Welcome, {user.username}</h1>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={sheet.length} accent="blue" />
        <StatCard label="Present Today" value={present} accent="green" />
        <StatCard label="Absent Today" value={absent} accent="red" />
        <StatCard label="Late Today" value={late} accent="purple" />
      </div>

      {notRecorded > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-600">
            {notRecorded} student(s) don't have today's attendance recorded yet.
          </p>
          <Link
            to="/attendance"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Record Attendance
          </Link>
        </div>
      )}
    </div>
  );
}