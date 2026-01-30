'use client';

import { useState, useEffect } from 'react';
import { Eye, Trash2, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/admin/AdminTable';
import Button from '@/components/admin/Button';
import FormInput from '@/components/admin/FormInput';
import FormSelect from '@/components/admin/FormSelect';
import Alert from '@/components/admin/Alert';
import { ordersApi } from '@/lib/adminApi';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
  });
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    skip: 0,
    take: 10,
    total: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [filters, pagination.skip]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await ordersApi.getOrders({
        ...filters,
        search: search || undefined,
        skip: pagination.skip,
        take: pagination.take,
      });

      // Handle different response structures
      let ordersData = [];
      let paginationData = { total: 0, skip: 0, take: 10, pages: 1 };

      if (Array.isArray(response)) {
        ordersData = response;
      } else if (response && Array.isArray(response.data)) {
        ordersData = response.data;
        if (response.pagination) {
          paginationData = response.pagination;
        }
      } else if (response && Array.isArray(response.orders)) {
        ordersData = response.orders;
        if (response.pagination) {
          paginationData = response.pagination;
        }
      }

      console.log('Orders loaded:', ordersData.length);
      setOrders(ordersData);
      setPagination((prev) => ({
        ...prev,
        total: paginationData.total || 0,
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to load orders',
      });
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;

    try {
      await ordersApi.cancelOrder(orderId);
      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Order cancelled successfully',
      });
      fetchOrders();
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to cancel order',
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      PROCESSING: 'bg-blue-100 text-blue-700',
      SHIPPED: 'bg-cyan-100 text-cyan-700',
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      COMPLETED: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (value) => <span className="font-mono text-sm font-semibold">{value.slice(0, 8)}</span>,
    },
    {
      key: 'orderNumber',
      label: 'Order Number',
      sortable: true,
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (value) => <span className="font-semibold text-gray-900">${value}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (value) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value) => {
        const date = new Date(value);
        return <span className="text-gray-600">{date.toLocaleDateString()}</span>;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/admin/orders/${row.id}`)}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          {row.status !== 'CANCELLED' && row.status !== 'DELIVERED' && (
            <button
              onClick={() => handleCancel(row.id)}
              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
              title="Cancel Order"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const currentPage = Math.floor(pagination.skip / pagination.take) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.take);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">Manage and track customer orders</p>
      </div>

      {/* Alerts */}
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Filter size={18} />
          Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormInput
            placeholder="Search by order ID or number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((prev) => ({ ...prev, skip: 0 }));
            }}
          />
          <FormSelect
            placeholder="All Statuses"
            value={filters.status}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, status: e.target.value }));
              setPagination((prev) => ({ ...prev, skip: 0 }));
            }}
            options={[
              { label: 'Pending', value: 'PENDING' },
              { label: 'Processing', value: 'PROCESSING' },
              { label: 'Shipped', value: 'SHIPPED' },
              { label: 'Delivered', value: 'DELIVERED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ]}
          />
          <FormSelect
            placeholder="All Payment Status"
            value={filters.paymentStatus}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, paymentStatus: e.target.value }));
              setPagination((prev) => ({ ...prev, skip: 0 }));
            }}
            options={[
              { label: 'Pending', value: 'PENDING' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Failed', value: 'FAILED' },
              { label: 'Refunded', value: 'REFUNDED' },
            ]}
          />
        </div>
      </div>

      {/* Orders Table */}
      <AdminTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        emptyMessage="No orders found"
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {pagination.skip + 1} to {Math.min(pagination.skip + pagination.take, pagination.total)} of{' '}
            {pagination.total} orders
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.skip === 0}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  skip: Math.max(0, prev.skip - prev.take),
                }))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  skip: prev.skip + prev.take,
                }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
