'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Truck, Package, AlertCircle } from 'lucide-react';
import Button from '@/components/admin/Button';
import FormSelect from '@/components/admin/FormSelect';
import FormInput from '@/components/admin/FormInput';
import FormTextarea from '@/components/admin/FormTextarea';
import Alert from '@/components/admin/Alert';
import Modal from '@/components/admin/Modal';
import { ordersApi } from '@/lib/adminApi';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [shipment, setShipment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);

  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [shipmentForm, setShipmentForm] = useState({
    trackingNumber: '',
    carrier: '',
    estimatedDelivery: '',
  });

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const [orderRes, itemsRes, shipmentRes] = await Promise.all([
        ordersApi.getOrderById(orderId),
        ordersApi.getOrderItems(orderId),
        ordersApi.getShipment(orderId),
      ]);

      // Handle different response structures
      const orderData = orderRes?.data ? orderRes.data : orderRes;
      const itemsData = Array.isArray(itemsRes) ? itemsRes : (itemsRes?.data ? itemsRes.data : []);
      const shipmentData = shipmentRes?.data ? shipmentRes.data : shipmentRes;

      console.log('Order loaded:', orderData);
      console.log('Items loaded:', itemsData.length);
      console.log('Shipment loaded:', shipmentData);

      setOrder(orderData);
      setItems(itemsData || []);
      setShipment(shipmentData || null);
      setNewStatus(orderData?.status || '');
      setNewPaymentStatus(orderData?.paymentStatus || '');
      
      // Pre-fill shipment form if shipment exists
      if (shipmentData) {
        setShipmentForm({
          trackingNumber: shipmentData.trackingNumber || '',
          carrier: shipmentData.courierName || '',
          estimatedDelivery: shipmentData.shippedAt || '',
        });
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to load order details',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (newStatus === order.status) {
      setShowStatusModal(false);
      return;
    }

    try {
      setIsSaving(true);
      await ordersApi.updateOrderStatus(orderId, newStatus);
      setOrder({ ...order, status: newStatus });
      setShowStatusModal(false);
      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Order status updated',
      });
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to update status',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    if (newPaymentStatus === order.paymentStatus) {
      setShowPaymentModal(false);
      return;
    }

    try {
      setIsSaving(true);
      await ordersApi.updatePaymentStatus(orderId, newPaymentStatus);
      setOrder({ ...order, paymentStatus: newPaymentStatus });
      setShowPaymentModal(false);
      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Payment status updated',
      });
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to update payment status',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateShipment = async () => {
    try {
      setIsSaving(true);
      const response = await ordersApi.createOrUpdateShipment(orderId, shipmentForm);
      setShipment(response.data);
      setShowShipmentModal(false);
      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Shipment updated successfully',
      });
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to update shipment',
      });
    } finally {
      setIsSaving(false);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Order not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-gray-600 mt-1">
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Order Status</h2>
              <Button size="sm" onClick={() => setShowStatusModal(true)}>
                Update Status
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Order Status</p>
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-gray-400" />
                  <span className={`px-2.5 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Order Items</h2>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    {item.variant?.product?.images?.[0]?.url && (
                      <img
                        src={item.variant.product.images[0].url}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600">
                        {item.color} - Size {item.size}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <p className="font-semibold text-gray-900">${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipment Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Truck size={20} />
                Shipment
              </h2>
              <Button size="sm" onClick={() => setShowShipmentModal(true)}>
                Update Shipment
              </Button>
            </div>

            {shipment ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-semibold text-gray-900">{shipment.trackingNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Courier</p>
                    <p className="font-semibold text-gray-900">{shipment.courierName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold text-gray-900">{shipment.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Shipped At</p>
                    <p className="font-semibold text-gray-900">
                      {shipment.shippedAt ? new Date(shipment.shippedAt).toLocaleDateString() : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 bg-gray-50 rounded-lg p-4">No shipment information yet.</p>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Order Summary</h3>

            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${parseFloat(order.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping Fee</span>
                <span className="text-gray-900">${parseFloat(order.shippingFee || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-3">
                <span>Total</span>
                <span className="text-red-600">${parseFloat(order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Customer Information</h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Name</p>
                <p className="text-gray-900">{order.user?.fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Email</p>
                <p className="text-gray-900">{order.user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Phone</p>
                <p className="text-gray-900">{order.user?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Delivery Address</h3>

            <div className="text-sm text-gray-900 space-y-1">
              {order.orderAddress ? (
                <>
                  <p>{order.orderAddress.name || ''}</p>
                  <p>{order.orderAddress.phone || ''}</p>
                  <p>{order.orderAddress.addressLine1 || ''}</p>
                  <p>{order.orderAddress.addressLine2 || ''}</p>
                  <p>{order.orderAddress.city}, {order.orderAddress.state}, {order.orderAddress.postalCode}</p>
                  <p>{order.orderAddress.country}</p>
                </>
              ) : (
                <p className="text-gray-500">No delivery address provided</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Order Status"
      >
        <div className="space-y-4">
          <FormSelect
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { label: 'Pending', value: 'PENDING' },
              { label: 'Processing', value: 'PROCESSING' },
              { label: 'Shipped', value: 'SHIPPED' },
              { label: 'Delivered', value: 'DELIVERED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ]}
          />

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowStatusModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} isLoading={isSaving} fullWidth>
              Update
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Status Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Update Payment Status"
      >
        <div className="space-y-4">
          <FormSelect
            label="New Payment Status"
            value={newPaymentStatus}
            onChange={(e) => setNewPaymentStatus(e.target.value)}
            options={[
              { label: 'Pending', value: 'PENDING' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Failed', value: 'FAILED' },
              { label: 'Refunded', value: 'REFUNDED' },
            ]}
          />

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePaymentStatus} isLoading={isSaving} fullWidth>
              Update
            </Button>
          </div>
        </div>
      </Modal>

      {/* Shipment Modal */}
      <Modal
        isOpen={showShipmentModal}
        onClose={() => setShowShipmentModal(false)}
        title="Update Shipment Information"
      >
        <div className="space-y-4">
          <FormInput
            label="Tracking Number"
            placeholder="e.g., 1234567890"
            value={shipmentForm.trackingNumber}
            onChange={(e) =>
              setShipmentForm({ ...shipmentForm, trackingNumber: e.target.value })
            }
          />

          <FormInput
            label="Courier Name"
            placeholder="e.g., FedEx, UPS, DHL"
            value={shipmentForm.carrier}
            onChange={(e) =>
              setShipmentForm({ ...shipmentForm, carrier: e.target.value })
            }
          />

          <FormInput
            label="Shipped Date"
            type="date"
            value={shipmentForm.estimatedDelivery}
            onChange={(e) =>
              setShipmentForm({ ...shipmentForm, estimatedDelivery: e.target.value })
            }
          />

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowShipmentModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateShipment} isLoading={isSaving} fullWidth>
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
