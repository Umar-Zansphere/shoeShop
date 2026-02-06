'use client';

export default function CardGrid({
    children,
    columns = { sm: 1, md: 2, lg: 3 },
    gap = 4,
    className = '',
}) {
    const gapClass = `gap-${gap}`;
    const gridCols = `grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg}`;

    return (
        <div className={`grid ${gridCols} ${gapClass} ${className}`}>
            {children}
        </div>
    );
}
