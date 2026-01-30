'use client';

import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Alert({
  type = 'info',
  title,
  message,
  onClose,
  closeable = true,
}) {
  const icons = {
    info: <Info size={20} />,
    success: <CheckCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    error: <AlertCircle size={20} />,
  };

  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  const iconColors = {
    info: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
  };

  return (
    <div className={`border rounded-lg p-4 flex gap-3 items-start ${colors[type]}`}>
      <div className={`mt-0.5 ${iconColors[type]}`}>{icons[type]}</div>
      <div className="flex-1 min-w-0">
        {title && <h3 className="font-semibold mb-1">{title}</h3>}
        {message && <p className="text-sm opacity-90">{message}</p>}
      </div>
      {closeable && onClose && (
        <button
          onClick={onClose}
          className="mt-0.5 opacity-50 hover:opacity-100 transition-opacity"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
