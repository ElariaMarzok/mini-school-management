import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';

export default function StudentDetailsPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([api.get(`/students/${id}`), api.get('/attendance', { params: { studentId: id } })])
      .then(([studentRes, historyRes]) => {
        setStudent(studentRes.data.student);
        setHistory(historyRes.data.records);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load student'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/students" className="text-sm text-blue-600 hover:underline">
          ← Back to Students
        </Link>
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">{error}</div>
      </div>
    );
  }

  const stats = {
    present: history.filter((r) => r.status === 'Present').length,
    absent: history.filter((r) => r.status === 'Absent').length,
    late: history.filter((r) => r.status === 'Late').length,
  };

  return (
    <div className="space-y-6">
      <Link to="/students" className="text-sm text-blue-600 hover:underline">
        ← Back to Students
      </Link>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">{student.name}</h1>
          <Badge value={student.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <Info label="Student Code" value={student.studentCode} />
          <Info label="Date of Birth" value={new Date(student.dateOfBirth).toLocaleDateString()} />
          <Info label="Gender" value={student.gender} />
          <Info label="Grade" value={student.gradeId?.name} />
          <Info label="Class" value={student.classId?.name || 'Unassigned'} />
          <Info label="Parent Name" value={student.parentName} />
          <Info label="Parent Phone" value={student.parentPhone} />
          <Info label="Address" value={student.address || '—'} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Present" value={stats.present} color="text-green-600" />
        <SummaryCard label="Absent" value={stats.absent} color="text-red-600" />
        <SummaryCard label="Late" value={stats.late} color="text-yellow-600" />
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-700">Attendance History</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-2">Date</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((r) => (
              <tr key={r._id} className="border-b last:border-0">
                <td className="py-2 text-gray-700">{new Date(r.date).toLocaleDateString()}</td>
                <td className="py-2">
                  <Badge value={r.status} />
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={2} className="py-4 text-center text-gray-400">
                  No attendance records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-gray-400">{label}</p>
      <p className="text-gray-800">{value}</p>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="rounded-xl bg-white p-4 text-center shadow-sm">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}