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
    info: 'bg-info-light border-info/30 text-info',
    success: 'bg-success-light border-success/30 text-success',
    warning: 'bg-warning-light border-warning/30 text-warning',
    error: 'bg-error-light border-error/30 text-error',
  };

  const iconColors = {
    info: 'text-info',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
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
