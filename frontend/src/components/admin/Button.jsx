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
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-sm hover:shadow-md hover:-translate-y-0.5',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
    outline: 'border-2 border-primary hover:bg-primary text-primary hover:text-white',
    danger: 'bg-error hover:bg-red-600 text-white',
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
