'use client';

import { useState, useEffect } from 'react';
import { Eye, Trash2, Filter, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Card from '@/components/admin/Card';
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
    take: 12,
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

      let ordersData = [];
      let paginationData = { total: 0, skip: 0, take: 12, pages: 1 };

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

      setOrders(ordersData);
      console.log('Fetched orders:', ordersData);
      setPagination((prev) => ({
        ...prev,
        total: paginationData.total || 0,
      }));
    } catch (error) {
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
      PENDING: 'bg-warning-light text-warning',
      PROCESSING: 'bg-info-light text-info',
      SHIPPED: 'bg-info-light text-info',
      DELIVERED: 'bg-success-light text-success',
      CANCELLED: 'bg-error-light text-error',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      PENDING: 'text-warning',
      PROCESSING: 'text-info',
      SHIPPED: 'text-info',
      DELIVERED: 'text-success',
      CANCELLED: 'text-error',
    };
    return colors[status] || 'text-gray-700';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-warning-light text-warning',
      COMPLETED: 'bg-success-light text-success',
      FAILED: 'bg-error-light text-error',
      REFUNDED: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentStatusTextColor = (status) => {
    const colors = {
      PENDING: 'text-warning',
      COMPLETED: 'text-success',
      FAILED: 'text-error',
      REFUNDED: 'text-gray-700',
    };
    return colors[status] || 'text-gray-700';
  };

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
      <Card>
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
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
            searchable
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
            searchable
          />
        </div>
      </Card>

      {/* Orders Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-48 animate-pulse">
              <div className="h-full bg-gray-100 rounded"></div>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-12">
          <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">Try adjusting your filters</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <Card key={order.id} hover className="flex flex-col">
              {/* Order Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order ID</p>
                    <p className="font-mono font-semibold text-gray-900 text-sm truncate">
                      {order.orderNumber || order.id.slice(0, 12)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-evenly">
                    <p className="text-xs text-gray-600 font-medium">Order Status</p>
                    <span className={`text-xs font-semibold ${getStatusTextColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-evenly">
                    <p className="text-xs text-gray-600 font-medium">Payment</p>
                    <span className={`text-xs font-semibold ${getPaymentStatusTextColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items Summary */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-2">Items ({order.items?.length || 0})</p>
                <div className="space-y-2">
                  {order.items && order.items.length > 0 ? (
                    order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="text-sm text-gray-700">
                        <p className="font-medium truncate">{item.productName}</p>
                        <p className="text-xs text-gray-500">
                          Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No items</p>
                  )}
                  {order.items && order.items.length > 2 && (
                    <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                      +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="font-bold text-gray-900">₹{parseFloat(order.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Method</span>
                  <span className="text-sm font-medium text-gray-900">{order.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Order Date</span>
                  <span className="text-sm text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                {order.user && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Customer</span>
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                      {order.user.name || order.user.phoneNumber || 'Guest'}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-100 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="flex-1 gap-2"
                >
                  <Eye size={16} />
                  View
                </Button>
                {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleCancel(order.id)}
                    className="gap-2"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

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
