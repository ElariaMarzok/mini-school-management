import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const todayStr = () => new Date().toISOString().slice(0, 10);
const statuses = ['Present', 'Absent', 'Late'];

export default function AttendancePage() {
  const { isAdmin, user } = useAuth();

  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [date, setDate] = useState(todayStr());
  const [gradeId, setGradeId] = useState('');
  const [classId, setClassId] = useState(isAdmin ? '' : user?.assignedClassId || '');

  const [sheet, setSheet] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isAdmin) {
      Promise.all([api.get('/grades'), api.get('/classes')]).then(([g, c]) => {
        setGrades(g.data.grades);
        setClasses(c.data.classes);
      });
    }
  }, [isAdmin]);

  const loadSheet = useCallback(async () => {
    if (!classId || !date) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const { data } = await api.get('/attendance', { params: { date, classId, gradeId: gradeId || undefined } });
      setSheet(data.sheet);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load attendance sheet');
      setSheet([]);
    } finally {
      setLoading(false);
    }
  }, [date, classId, gradeId]);

  useEffect(() => {
    loadSheet();
  }, [loadSheet]);

  const setStatus = (studentId, status) => {
    setSheet((prev) => prev.map((s) => (s.studentId === studentId ? { ...s, status } : s)));
  };

  const markAll = (status) => {
    setSheet((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSave = async () => {
    const unrecorded = sheet.filter((s) => !s.status);
    if (unrecorded.length > 0) {
      if (!window.confirm(`${unrecorded.length} student(s) have no status selected and will be skipped. Continue?`)) {
        return;
      }
    }
    const records = sheet.filter((s) => s.status).map((s) => ({ studentId: s.studentId, status: s.status }));
    if (records.length === 0) return;

    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.post('/attendance', { date, classId, records });
      setSuccessMsg('Attendance saved successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const classesForFilter = classes.filter((c) => !gradeId || c.gradeId?._id === gradeId);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Attendance</h1>

      <div className="flex flex-wrap items-end gap-4 rounded-xl bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {isAdmin && (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Grade</label>
              <select
                value={gradeId}
                onChange={(e) => {
                  setGradeId(e.target.value);
                  setClassId('');
                }}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Select grade</option>
                {grades.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Class</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Select class</option>
                {classesForFilter.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {sheet.length > 0 && (
          <div className="ml-auto flex gap-2">
            <QuickButton label="Mark all Present" onClick={() => markAll('Present')} color="green" />
            <QuickButton label="Mark all Absent" onClick={() => markAll('Absent')} color="red" />
          </div>
        )}
      </div>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">{error}</div>}
      {successMsg && <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">{successMsg}</div>}

      {!classId ? (
        <p className="text-sm text-gray-400">
          {isAdmin ? 'Select a grade and class to view the attendance sheet.' : 'No class assigned to your account.'}
        </p>
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-2">Code</th>
                <th className="py-2">Student Name</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {sheet.map((s) => (
                <tr key={s.studentId} className="border-b last:border-0">
                  <td className="py-2 text-gray-600">{s.studentCode}</td>
                  <td className="py-2 font-medium text-gray-800">{s.name}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      {statuses.map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatus(s.studentId, st)}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            s.status === st
                              ? statusActiveClass(st)
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {sheet.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-400">
                    No active students in this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {sheet.length > 0 && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-5 w-full rounded-md bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto sm:px-8"
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function statusActiveClass(status) {
  if (status === 'Present') return 'bg-green-600 text-white';
  if (status === 'Absent') return 'bg-red-600 text-white';
  return 'bg-yellow-500 text-white';
}

function QuickButton({ label, onClick, color }) {
  const colors = {
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    red: 'bg-red-50 text-red-700 hover:bg-red-100',
  };
  return (
    <button onClick={onClick} className={`rounded-md px-3 py-2 text-xs font-medium ${colors[color]}`}>
      {label}
    </button>
  );
}