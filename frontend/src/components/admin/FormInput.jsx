'use client';

export default function FormInput({
  label,
  error,
  required = false,
  ...props
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`px-4 py-2.5 border rounded-lg focus-ring bg-white text-gray-900 placeholder-gray-500 transition-colors ${
          error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-200 focus:border-red-400'
        } ${props.className || ''}`}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
