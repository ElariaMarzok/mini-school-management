import Modal from './Modal';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = true }) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="mb-6 text-sm text-gray-600">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
            danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
}