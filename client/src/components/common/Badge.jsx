const styles = {
  Active: 'bg-green-100 text-green-700',
  Deactivated: 'bg-gray-100 text-gray-500',
  Present: 'bg-green-100 text-green-700',
  Absent: 'bg-red-100 text-red-700',
  Late: 'bg-yellow-100 text-yellow-700',
};

export default function Badge({ value }) {
  if (!value) return <span className="text-xs text-gray-400">—</span>;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[value] || 'bg-gray-100 text-gray-600'}`}>
      {value}
    </span>
  );
}