import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function GradesClassesPage() {
  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedGradeId, setSelectedGradeId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Grade modal state
  const [gradeModal, setGradeModal] = useState({ open: false, editing: null, name: '' });
  // Class modal state
  const [classModal, setClassModal] = useState({ open: false, editing: null, name: '', gradeId: '' });
  // Delete confirmation
  const [confirm, setConfirm] = useState({ open: false, type: null, id: null, label: '' });

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [gradesRes, classesRes] = await Promise.all([api.get('/grades'), api.get('/classes')]);
      setGrades(gradesRes.data.grades);
      setClasses(classesRes.data.classes);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---------- Grade actions ----------
  const submitGrade = async (e) => {
    e.preventDefault();
    try {
      if (gradeModal.editing) {
        await api.put(`/grades/${gradeModal.editing}`, { name: gradeModal.name });
      } else {
        await api.post('/grades', { name: gradeModal.name });
      }
      setGradeModal({ open: false, editing: null, name: '' });
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save grade');
    }
  };

  // ---------- Class actions ----------
  const submitClass = async (e) => {
    e.preventDefault();
    try {
      if (classModal.editing) {
        await api.put(`/classes/${classModal.editing}`, {
          name: classModal.name,
          gradeId: classModal.gradeId,
        });
      } else {
        await api.post('/classes', { name: classModal.name, gradeId: classModal.gradeId });
      }
      setClassModal({ open: false, editing: null, name: '', gradeId: '' });
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save class');
    }
  };

  // ---------- Delete ----------
  const handleDelete = async () => {
    try {
      const url = confirm.type === 'grade' ? `/grades/${confirm.id}` : `/classes/${confirm.id}`;
      await api.delete(url);
      setConfirm({ open: false, type: null, id: null, label: '' });
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
      setConfirm({ open: false, type: null, id: null, label: '' });
    }
  };

  if (loading) return <LoadingSpinner />;

  const visibleClasses =
    selectedGradeId === 'all' ? classes : classes.filter((c) => c.gradeId?._id === selectedGradeId);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-gray-800">Grades & Classes</h1>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      {/* Grades section */}
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-700">Grades</h2>
          <button
            onClick={() => setGradeModal({ open: true, editing: null, name: '' })}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Grade
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {grades.map((g) => (
            <div
              key={g._id}
              className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm"
            >
              <span className="text-gray-700">{g.name}</span>
              <button
                onClick={() => setGradeModal({ open: true, editing: g._id, name: g.name })}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirm({ open: true, type: 'grade', id: g._id, label: g.name })}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
          {grades.length === 0 && <p className="text-sm text-gray-400">No grades yet.</p>}
        </div>
      </section>

      {/* Classes section */}
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-700">Classes</h2>
          <div className="flex items-center gap-3">
            <select
              value={selectedGradeId}
              onChange={(e) => setSelectedGradeId(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            >
              <option value="all">All Grades</option>
              {grades.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                setClassModal({ open: true, editing: null, name: '', gradeId: grades[0]?._id || '' })
              }
              disabled={grades.length === 0}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              + Add Class
            </button>
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-2">Class</th>
              <th className="py-2">Grade</th>
              <th className="py-2">Students</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleClasses.map((c) => (
              <tr key={c._id} className="border-b last:border-0">
                <td className="py-2 font-medium text-gray-800">{c.name}</td>
                <td className="py-2 text-gray-600">{c.gradeId?.name}</td>
                <td className="py-2 text-gray-600">{c.studentCount}</td>
                <td className="py-2 text-right">
                  <button
                    onClick={() =>
                      setClassModal({
                        open: true,
                        editing: c._id,
                        name: c.name,
                        gradeId: c.gradeId?._id,
                      })
                    }
                    className="mr-3 text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirm({ open: true, type: 'class', id: c._id, label: c.name })}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {visibleClasses.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-400">
                  No classes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Grade Modal */}
      <Modal
        open={gradeModal.open}
        onClose={() => setGradeModal({ open: false, editing: null, name: '' })}
        title={gradeModal.editing ? 'Edit Grade' : 'Add Grade'}
      >
        <form onSubmit={submitGrade}>
          <label className="mb-1 block text-sm font-medium text-gray-700">Grade Name</label>
          <input
            type="text"
            required
            value={gradeModal.name}
            onChange={(e) => setGradeModal((s) => ({ ...s, name: e.target.value }))}
            className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700"
          >
            Save
          </button>
        </form>
      </Modal>

      {/* Class Modal */}
      <Modal
        open={classModal.open}
        onClose={() => setClassModal({ open: false, editing: null, name: '', gradeId: '' })}
        title={classModal.editing ? 'Edit Class' : 'Add Class'}
      >
        <form onSubmit={submitClass}>
          <label className="mb-1 block text-sm font-medium text-gray-700">Class Name</label>
          <input
            type="text"
            required
            value={classModal.name}
            onChange={(e) => setClassModal((s) => ({ ...s, name: e.target.value }))}
            className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
          <label className="mb-1 block text-sm font-medium text-gray-700">Grade</label>
          <select
            required
            value={classModal.gradeId}
            onChange={(e) => setClassModal((s) => ({ ...s, gradeId: e.target.value }))}
            className="mb-6 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            {grades.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700"
          >
            Save
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        title={`Delete ${confirm.type === 'grade' ? 'Grade' : 'Class'}`}
        message={`Are you sure you want to delete "${confirm.label}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, type: null, id: null, label: '' })}
      />
    </div>
  );
}