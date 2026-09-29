import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';

const emptyForm = {
  studentCode: '',
  name: '',
  dateOfBirth: '',
  gender: 'Male',
  parentName: '',
  parentPhone: '',
  address: '',
  gradeId: '',
  classId: '',
};

export default function StudentsPage() {
  const { isAdmin } = useAuth();

  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [modal, setModal] = useState({ open: false, editing: null, form: emptyForm });
  const [confirm, setConfirm] = useState({ open: false, id: null, label: '' });

  const loadLookups = useCallback(async () => {
    const [gradesRes, classesRes] = await Promise.all([api.get('/grades'), api.get('/classes')]);
    setGrades(gradesRes.data.grades);
    setClasses(classesRes.data.classes);
  }, []);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/students', {
        params: {
          search: search || undefined,
          gradeId: gradeFilter || undefined,
          classId: classFilter || undefined,
          page,
          limit: 10,
        },
      });
      setStudents(data.students);
      setPages(data.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [search, gradeFilter, classFilter, page]);

  useEffect(() => {
    if (isAdmin) loadLookups();
  }, [isAdmin, loadLookups]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, gradeFilter, classFilter]);

  const openAdd = () => setModal({ open: true, editing: null, form: emptyForm });

  const openEdit = (s) => {
    setModal({
      open: true,
      editing: s._id,
      form: {
        studentCode: s.studentCode,
        name: s.name,
        dateOfBirth: s.dateOfBirth?.slice(0, 10) || '',
        gender: s.gender,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        address: s.address || '',
        gradeId: s.gradeId?._id || '',
        classId: s.classId?._id || '',
      },
    });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    const payload = { ...modal.form, classId: modal.form.classId || null };
    try {
      if (modal.editing) {
        await api.put(`/students/${modal.editing}`, payload);
      } else {
        await api.post('/students', payload);
      }
      setModal({ open: false, editing: null, form: emptyForm });
      loadStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save student');
    }
  };

  const handleDeactivate = async () => {
    try {
      await api.delete(`/students/${confirm.id}`);
      setConfirm({ open: false, id: null, label: '' });
      loadStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate student');
      setConfirm({ open: false, id: null, label: '' });
    }
  };

  const classesForForm = classes.filter(
    (c) => !modal.form.gradeId || c.gradeId?._id === modal.form.gradeId
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-800">Students</h1>
        {isAdmin && (
          <button
            onClick={openAdd}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Student
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search by name, code or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[220px] flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {isAdmin && (
          <>
            <select
              value={gradeFilter}
              onChange={(e) => {
                setGradeFilter(e.target.value);
                setClassFilter('');
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Grades</option>
              {grades.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name}
                </option>
              ))}
            </select>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Classes</option>
              {classes
                .filter((c) => !gradeFilter || c.gradeId?._id === gradeFilter)
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </>
        )}
      </div>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="overflow-x-auto rounded-xl bg-white p-5 shadow-sm">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-2">Code</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Grade</th>
                  <th className="py-2">Class</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id} className="border-b last:border-0">
                    <td className="py-2 text-gray-600">{s.studentCode}</td>
                    <td className="py-2 font-medium text-gray-800">
                      <Link to={`/students/${s._id}`} className="hover:underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className="py-2 text-gray-600">{s.gradeId?.name}</td>
                    <td className="py-2 text-gray-600">{s.classId?.name || '—'}</td>
                    <td className="py-2 text-gray-600">{s.parentPhone}</td>
                    <td className="py-2">
                      <Badge value={s.status} />
                    </td>
                    <td className="py-2 text-right">
                      <Link to={`/students/${s._id}`} className="mr-3 text-blue-600 hover:underline">
                        View
                      </Link>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => openEdit(s)}
                            className="mr-3 text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          {s.status === 'Active' && (
                            <button
                              onClick={() => setConfirm({ open: true, id: s._id, label: s.name })}
                              className="text-red-600 hover:underline"
                            >
                              Deactivate
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-400">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination page={page} pages={pages} onChange={setPage} />
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, editing: null, form: emptyForm })}
        title={modal.editing ? 'Edit Student' : 'Add Student'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={submitForm} className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Student Code</label>
            <input
              type="text"
              required
              value={modal.form.studentCode}
              onChange={(e) =>
                setModal((s) => ({ ...s, form: { ...s.form, studentCode: e.target.value } }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              required
              value={modal.form.name}
              onChange={(e) => setModal((s) => ({ ...s, form: { ...s.form, name: e.target.value } }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              required
              value={modal.form.dateOfBirth}
              onChange={(e) =>
                setModal((s) => ({ ...s, form: { ...s.form, dateOfBirth: e.target.value } }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
            <select
              value={modal.form.gender}
              onChange={(e) => setModal((s) => ({ ...s, form: { ...s.form, gender: e.target.value } }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Parent Name</label>
            <input
              type="text"
              required
              value={modal.form.parentName}
              onChange={(e) =>
                setModal((s) => ({ ...s, form: { ...s.form, parentName: e.target.value } }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Parent Phone</label>
            <input
              type="text"
              required
              value={modal.form.parentPhone}
              onChange={(e) =>
                setModal((s) => ({ ...s, form: { ...s.form, parentPhone: e.target.value } }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={modal.form.address}
              onChange={(e) =>
                setModal((s) => ({ ...s, form: { ...s.form, address: e.target.value } }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Grade</label>
            <select
              required
              value={modal.form.gradeId}
              onChange={(e) =>
                setModal((s) => ({
                  ...s,
                  form: { ...s.form, gradeId: e.target.value, classId: '' },
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Class</label>
            <select
              value={modal.form.classId}
              onChange={(e) =>
                setModal((s) => ({ ...s, form: { ...s.form, classId: e.target.value } }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Unassigned</option>
              {classesForForm.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="col-span-2 mt-2 w-full rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700"
          >
            Save
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        title="Deactivate Student"
        message={`Are you sure you want to deactivate "${confirm.label}"? Their records will be kept but they'll be marked inactive.`}
        onConfirm={handleDeactivate}
        onCancel={() => setConfirm({ open: false, id: null, label: '' })}
      />
    </div>
  );
}