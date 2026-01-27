'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ordersApi } from '@/lib/adminApi';
import { ArrowLeft, Package, Truck } from 'lucide-react';
import Link from 'next/link';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId;

  const [order, setOrder] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [shipmentData, setShipmentData] = useState({
    courierName: '',
    trackingNumber: '',
    trackingUrl: '',
    status: 'PENDING',
  });

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getOrderById(orderId);
      setOrder(data);

      try {
        const shipmentData = await ordersApi.getShipment(orderId);
        setShipment(shipmentData);
        setShipmentData({
          courierName: shipmentData.courierName || '',
          trackingNumber: shipmentData.trackingNumber || '',
          trackingUrl: shipmentData.trackingUrl || '',
          status: shipmentData.status || 'PENDING',
        });
      } catch (err) {
        // Shipment might not exist yet
      }

      setError('');
    } catch (err) {
      setError('Failed to load order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await ordersApi.updateOrderStatus(orderId, newStatus);
      setOrder(prev => ({ ...prev, status: newStatus }));
      setError('');
    } catch (err) {
      setError('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await ordersApi.updatePaymentStatus(orderId, newStatus);
      setOrder(prev => ({ ...prev, paymentStatus: newStatus }));
      setError('');
    } catch (err) {
      setError('Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  const handleShipmentUpdate = async () => {
    try {
      setUpdating(true);
      await ordersApi.createOrUpdateShipment(orderId, shipmentData);
      fetchOrder();
      setShowShipmentForm(false);
      setError('');
    } catch (err) {
      setError('Failed to update shipment');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      setUpdating(true);
      await ordersApi.cancelOrder(orderId);
      setOrder(prev => ({ ...prev, status: 'CANCELLED' }));
      setError('');
    } catch (err) {
      setError('Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-(--accent) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Link href="/admin/orders" className="flex items-center gap-2 text-(--accent)">
          <ArrowLeft size={20} />
          Back to Orders
        </Link>
        <div className="text-center text-(--text-secondary)">Order not found</div>
      </div>
    );
  }

  const statusOptions = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const paymentOptions = ['PENDING', 'SUCCESS', 'FAILED'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-(--text-primary)">Order {order.orderNumber}</h1>
            <p className="text-sm text-(--text-secondary)">
              {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <button
          onClick={handleCancelOrder}
          disabled={order.status === 'CANCELLED' || order.status === 'DELIVERED'}
          className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          Cancel Order
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-(--accent) rounded-2xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-(--text-primary)">Customer Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-(--text-secondary) font-semibold mb-1">Name</p>
                <p className="text-(--text-primary)">{order.user.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-(--text-secondary) font-semibold mb-1">Email</p>
                <p className="text-(--text-primary)">{order.user.email}</p>
              </div>
              <div>
                <p className="text-xs text-(--text-secondary) font-semibold mb-1">Phone</p>
                <p className="text-(--text-primary)">{order.user.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-(--text-secondary) font-semibold mb-1">Customer ID</p>
                <p className="text-(--text-primary)">{order.user.id}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-(--text-primary)">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between pb-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="font-semibold text-(--text-primary)">
                      {item.variant?.product?.name}
                    </p>
                    <p className="text-sm text-(--text-secondary)">
                      Size: {item.variant?.size} | Color: {item.variant?.color}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-(--text-primary)">Qty: {item.quantity}</p>
                    <p className="font-semibold text-(--text-primary)">${item.subtotal.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipment Info */}
          <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-(--text-primary) flex items-center gap-2">
                <Truck size={20} />
                Shipment Information
              </h2>
              <button
                onClick={() => setShowShipmentForm(!showShipmentForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {shipment ? 'Edit' : 'Add Shipment'}
              </button>
            </div>

            {shipment ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-(--text-secondary) font-semibold mb-1">Courier</p>
                  <p className="text-(--text-primary)">{shipment.courierName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-(--text-secondary) font-semibold mb-1">Tracking #</p>
                  <p className="text-(--text-primary)">{shipment.trackingNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-(--text-secondary) font-semibold mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    shipment.status === 'SHIPPED'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {shipment.status}
                  </span>
                </div>
                {shipment.trackingUrl && (
                  <div>
                    <p className="text-xs text-(--text-secondary) font-semibold mb-1">Tracking URL</p>
                    <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View Tracking
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-(--text-secondary)">No shipment information added yet</p>
            )}

            {showShipmentForm && (
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <input
                  type="text"
                  placeholder="Courier Name"
                  value={shipmentData.courierName}
                  onChange={(e) => setShipmentData(prev => ({ ...prev, courierName: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Tracking Number"
                  value={shipmentData.trackingNumber}
                  onChange={(e) => setShipmentData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
                />
                <input
                  type="url"
                  placeholder="Tracking URL"
                  value={shipmentData.trackingUrl}
                  onChange={(e) => setShipmentData(prev => ({ ...prev, trackingUrl: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
                />
                <select
                  value={shipmentData.status}
                  onChange={(e) => setShipmentData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
                >
                  <option value="PENDING">Pending</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
                <button
                  onClick={handleShipmentUpdate}
                  disabled={updating}
                  className="w-full px-6 py-2 bg-(--accent) text-white rounded-lg font-semibold hover:bg-[#FF5252] transition-colors disabled:opacity-50"
                >
                  Save Shipment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Status & Summary */}
        <div className="space-y-6">
          {/* Order Status */}
          <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-(--text-primary) flex items-center gap-2">
              <Package size={20} />
              Order Status
            </h3>
            <div className="space-y-2">
              <select
                value={order.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                disabled={updating}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <span className={`block px-4 py-2 rounded-lg text-center font-semibold text-sm ${
                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                order.status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
                order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>
                {order.status}
              </span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-(--text-primary)">Payment Status</h3>
            <div className="space-y-2">
              <select
                value={order.paymentStatus}
                onChange={(e) => handlePaymentStatusUpdate(e.target.value)}
                disabled={updating}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
              >
                {paymentOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <span className={`block px-4 py-2 rounded-lg text-center font-semibold text-sm ${
                order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                order.paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-(--text-primary)">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between pb-3 border-b border-gray-100">
                <span className="text-(--text-secondary)">Subtotal</span>
                <span className="text-(--text-primary) font-semibold">${(order.totalAmount - (order.tax || 0) - (order.shipping || 0)).toFixed(2)}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between pb-3 border-b border-gray-100">
                  <span className="text-(--text-secondary)">Tax</span>
                  <span className="text-(--text-primary) font-semibold">${order.tax.toFixed(2)}</span>
                </div>
              )}
              {order.shipping > 0 && (
                <div className="flex justify-between pb-3 border-b border-gray-100">
                  <span className="text-(--text-secondary)">Shipping</span>
                  <span className="text-(--text-primary) font-semibold">${order.shipping.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3">
                <span className="text-lg font-bold text-(--text-primary)">Total</span>
                <span className="text-2xl font-bold text-(--accent)">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
