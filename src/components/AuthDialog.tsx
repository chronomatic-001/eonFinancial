import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ isOpen, onClose, message }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-xl animate-fadeIn">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
            <LogIn className="w-6 h-6 text-primary-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Sign in Required
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400">
            {message}
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/signin', { replace: true });
              }}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthDialog;