import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { deleteProfile } from '../authSlice';
import { AlertTriangle, X, Loader } from 'lucide-react';

function DeleteProfileModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await dispatch(deleteProfile()).unwrap();
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Failed to delete profile. Please try again.');
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
            <AlertTriangle size={20} className="text-rose-600" />
          </div>
          <h2 className="text-xl font-black text-zinc-900">Delete Account?</h2>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="ml-auto p-1 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-zinc-600 mb-6">
          This action <span className="font-bold">cannot be undone</span>. Your account and all associated data (submissions, discussions, comments) will be permanently deleted.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-lg">
            <p className="text-sm font-medium text-rose-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 font-bold text-sm text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 font-bold text-sm text-white hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting && <Loader size={16} className="animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteProfileModal;
