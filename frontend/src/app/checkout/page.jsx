'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader, AlertCircle, Plus, CreditCard, Truck, CheckCircle, Edit2 } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { cartApi, orderApi, addressApi, paymentApi } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('cart');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (!isLoggedIn) {
          router.push('/login');
          return;
        }

        // Fetch user's addresses
        try {
          const addressResponse = await addressApi.getAddresses();
          if (addressResponse) {
            setAddresses(addressResponse || []);
            // Select first address by default
            if (addressResponse && addressResponse.length > 0) {
              setSelectedAddressId(addressResponse[0].id);
            }
          }
        } catch (err) {
          console.error('Error fetching addresses:', err);
        }

        // Get cart items
        try {
          const cartResponse = await cartApi.getCart();
          if (cartResponse) {
            setCart(cartResponse?.items || []);
          }
        } catch (err) {
          console.error('Error fetching cart:', err);
        }
      } catch (err) {
        setError(err.message || 'Failed to load checkout data');
        console.error('Error fetching checkout data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleCreateOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select a delivery address');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Step 1: Create order
      console.log('Creating order...');
      const response = await orderApi.createOrder(selectedAddressId, paymentMethod);

      if (!response.success) {
        setError(response.message || 'Failed to create order');
        setSubmitting(false);
        return;
      }

      const orderData = response.data;
      console.log('Order created:', orderData);

      // Step 2: Initialize Razorpay payment
      if (paymentMethod === 'RAZORPAY') {
        const totalAmount = cart.reduce((sum, item) => sum + (parseFloat(item.unitPrice) * item.quantity), 0);
        const taxAmount = totalAmount * 0.18;
        const finalAmount = totalAmount + taxAmount;

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: Math.round(finalAmount * 100), // in paise
          currency: 'INR',
          name: 'ShoeShop',
          description: `Order ${orderData.orderNumber}`,
          order_id: orderData.razorpayOrderId,
          handler: async (response) => {
            try {
              console.log('Payment response:', response);
              
              // Step 3: Verify payment signature
              const verifyResponse = await paymentApi.verifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );

              if (verifyResponse.success) {
                console.log('Payment verified successfully');
                // Redirect to order detail page with success
                router.push(`/orders/${orderData.orderId}?payment=success`);
              } else {
                setError('Payment verification failed');
                setSubmitting(false);
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              setError(error.message || 'Payment verification failed');
              setSubmitting(false);
            }
          },
          prefill: {
            email: localStorage.getItem('userEmail') || '',
            contact: localStorage.getItem('userPhone') || ''
          },
          theme: {
            color: '#FF6B6B'
          },
          modal: {
            ondismiss: () => {
              console.log('Payment modal closed');
              setSubmitting(false);
              setError('Payment cancelled. Please try again.');
            }
          }
        };

        // Load Razorpay script if not already loaded
        if (!window.Razorpay) {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => {
            const rzp = new window.Razorpay(options);
            rzp.open();
          };
          document.body.appendChild(script);
        } else {
          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      }
    } catch (err) {
      setError(err.message || 'Error creating order');
      console.error('Error creating order:', err);
      setSubmitting(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.unitPrice) * item.quantity), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader size={48} className="mx-auto mb-4 text-orange-500 animate-spin" />
            <p className="text-slate-600">Loading checkout...</p>
          </div>
        </div>
        <Footer activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-orange-500" />
            <p className="text-slate-900 text-lg font-bold mb-4">Your cart is empty</p>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-2 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-colors font-bold"
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-700" />
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex gap-3">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>

              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-slate-200 last:border-0">
                    {item.variant?.images?.[0]?.url && (
                      <img
                        src={item.variant.images[0].url}
                        alt={item.product?.name}
                        className="w-20 h-20 object-contain rounded-xl bg-slate-50"
                      />
                    )}

                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{item.product?.name}</h3>
                      <p className="text-sm text-slate-600">
                        {item.variant?.color} • Size {item.variant?.size}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Quantity: <span className="font-semibold">{item.quantity}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        ₹{(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-500">
                        ₹{parseFloat(item.unitPrice).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Truck size={24} className="text-orange-600" />
                  <h2 className="text-2xl font-bold text-slate-900">Delivery Address</h2>
                </div>
                {addresses.length > 0 && (
                  <button
                    onClick={() => router.push('/profile/addresses')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                  >
                    <Edit2 size={16} />
                    Manage
                  </button>
                )}
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-12 bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl">
                  <Truck size={48} className="mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 mb-4 font-medium">No addresses found</p>
                  <p className="text-sm text-slate-500 mb-6">Please add an address to continue with checkout</p>
                  <button
                    onClick={() => router.push('/profile/addresses')}
                    className="px-6 py-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-colors inline-flex items-center gap-2 font-bold shadow-md hover:shadow-lg"
                  >
                    <Plus size={20} />
                    Add New Address
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 mb-4">
                    {addresses.map((address) => (
                      <button
                        key={address.id}
                        onClick={() => setSelectedAddressId(address.id)}
                        className={`w-full p-4 border-2 rounded-2xl cursor-pointer transition-all text-left ${
                          selectedAddressId === address.id
                            ? 'border-orange-500 bg-white shadow-md'
                            : 'border-slate-200 hover:border-orange-300 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex gap-3 items-start">
                          <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            selectedAddressId === address.id
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-slate-300'
                          }`}>
                            {selectedAddressId === address.id && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-bold text-slate-900">{address.name}</p>
                                <p className="text-sm text-slate-600 mt-1">
                                  {address.addressLine1}
                                  {address.addressLine2 && `, ${address.addressLine2}`}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {address.city}, {address.state} {address.postalCode}
                                </p>
                                <p className="text-sm text-slate-600 mt-1">📞 {address.phone}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => router.push('/profile/addresses')}
                    className="w-full px-6 py-3 border-2 border-dashed border-orange-300 text-orange-600 rounded-2xl hover:bg-orange-50 transition-colors inline-flex items-center justify-center gap-2 font-semibold"
                  >
                    <Plus size={20} />
                    Add Another Address
                  </button>
                </>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard size={24} className="text-orange-600" />
                <h2 className="text-2xl font-bold text-slate-900">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`w-full p-4 border-2 rounded-xl cursor-pointer transition-all text-left ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-orange-500 bg-slate-50 shadow-md'
                      : 'border-slate-200 hover:border-orange-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex gap-3 items-center">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      paymentMethod === 'RAZORPAY'
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'RAZORPAY' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={20} className="text-orange-600" />
                        <p className="font-bold text-slate-900">Razorpay</p>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">Pay securely using credit/debit card, netbanking, or UPI</p>
                    </div>
                  </div>
                </button>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">Cash on Delivery</span> is currently unavailable
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar - Order Total */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sticky top-24 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Order Total</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax (18%)</span>
                  <span className="font-semibold text-slate-900">₹{(cartTotal * 0.18).toFixed(2)}</span>
                </div>

                <div className="border-t-2 border-slate-200 pt-4 flex justify-between items-center">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-3xl font-black text-orange-600">
                    ₹{(cartTotal + cartTotal * 0.18).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={submitting || !selectedAddressId || addresses.length === 0}
                className="w-full px-6 py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-400 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {submitting ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order
                    <span className="text-lg">→</span>
                  </>
                )}
              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                By placing an order, you agree to our<br />
                <span className="font-semibold">Terms & Conditions</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
