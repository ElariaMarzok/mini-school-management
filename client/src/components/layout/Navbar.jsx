import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <span className="font-semibold text-gray-800">Mini School Management</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user?.username} <span className="text-gray-400">({user?.role})</span>
        </span>
        <button
          onClick={logout}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Logout
        </button>
      </div>
    </header>
  );
}