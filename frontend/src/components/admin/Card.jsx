'use client';

export default function Card({
    children,
    onClick,
    className = '',
    hover = true,
    padding = 'default',
}) {
    const paddingClasses = {
        none: '',
        sm: 'p-3',
        default: 'p-4',
        lg: 'p-6',
    };

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-lg border border-gray-200 shadow-card transition-all ${hover ? 'hover:shadow-md hover:-translate-y-0.5' : ''
                } ${onClick ? 'cursor-pointer' : ''} ${paddingClasses[padding]
                } ${className}`}
        >
            {children}
        </div>
    );
}
