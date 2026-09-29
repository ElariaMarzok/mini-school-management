import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const linkClass = ({ isActive }) =>
  `block rounded-md px-4 py-2 text-sm font-medium ${
    isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
  }`;

export default function Sidebar() {
  const { isAdmin } = useAuth();

  return (
    <aside className="w-56 shrink-0 border-r bg-white p-4">
      <nav className="space-y-1">
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
        {isAdmin && (
          <NavLink to="/grades-classes" className={linkClass}>
            Grades & Classes
          </NavLink>
        )}
        <NavLink to="/students" className={linkClass}>
          Students
        </NavLink>
        <NavLink to="/attendance" className={linkClass}>
          Attendance
        </NavLink>
      </nav>
    </aside>
  );
}