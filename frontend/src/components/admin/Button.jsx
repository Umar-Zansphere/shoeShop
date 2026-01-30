'use client';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  ...props
}) {
  const variants = {
    primary: 'bg-red-600 hover:bg-red-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
    danger: 'bg-red-600/10 hover:bg-red-600/20 text-red-600',
    ghost: 'hover:bg-gray-100 text-gray-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      disabled={disabled || isLoading}
      {...props}
      className={`
        rounded-lg font-semibold transition-colors flex items-center gap-2 justify-center
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${props.className || ''}
      `}
    >
      {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>}
      {children}
    </button>
  );
}
