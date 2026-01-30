'use client';

import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export default function AdminTable({
  columns,
  data,
  onRowClick,
  isLoading,
  emptyMessage = 'No data found',
  sortConfig,
  onSort,
  selectedRows = [],
  onSelectRow,
}) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-smooth border border-gray-200">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => column.sortable && onSort?.(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && (
                    <div className="text-gray-400">
                      {sortConfig?.key === column.key ? (
                        sortConfig?.direction === 'asc' ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )
                      ) : (
                        <ChevronsUpDown size={16} />
                      )}
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.id || idx}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-sm text-gray-700">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
