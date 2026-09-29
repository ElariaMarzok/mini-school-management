export default function StatCard({ label, value, accent = 'blue' }) {
  const accents = {
    blue: 'border-blue-500 text-blue-600',
    green: 'border-green-500 text-green-600',
    red: 'border-red-500 text-red-600',
    purple: 'border-purple-500 text-purple-600',
  };

  return (
    <div className={`rounded-xl border-t-4 bg-white p-5 shadow-sm ${accents[accent]}`}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}