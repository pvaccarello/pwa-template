import React, { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const icons = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const colors = {
  success: 'bg-green-100 dark:bg-green-500 dark:bg-opacity-10 text-green-600 dark:text-green-300 border-green-200 dark:border-green-500 dark:border-opacity-20',
  error: 'bg-red-100 dark:bg-red-500 dark:bg-opacity-10 text-red-600 dark:text-red-300 border-red-200 dark:border-red-500 dark:border-opacity-20',
  warning: 'bg-yellow-100 dark:bg-yellow-500 dark:bg-opacity-10 text-yellow-600 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500 dark:border-opacity-20',
  info: 'bg-blue-100 dark:bg-blue-500 dark:bg-opacity-10 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-500 dark:border-opacity-20',
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      const removeTimer = setTimeout(onClose, 300);
      return () => clearTimeout(removeTimer);
    }, 4700);
    return () => clearTimeout(exitTimer);
  }, [onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        relative w-full max-w-sm p-4 rounded-xl shadow-lg flex items-start gap-3 border
        ${colors[type]}
        transition-all duration-300 ease-in-out transform
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      style={{ animation: 'toast-enter 0.3s ease-out forwards' }}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={handleClose} className="flex-shrink-0 p-1 -m-1 rounded-full hover:bg-black hover:bg-opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <style>{`
        @keyframes toast-enter {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default Toast;
