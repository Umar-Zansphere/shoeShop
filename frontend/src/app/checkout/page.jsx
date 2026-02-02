'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, AlertCircle, Plus, CreditCard, Truck, CheckCircle, Edit2 } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { cartApi, orderApi, addressApi, paymentApi } from '@/lib/api';
import { useToast } from '@/components/ToastContext';
import { CartLoadingSkeleton } from '@/components/LoadingSkeleton';

export default function CheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('cart');

  // Guest user fields
  const [isGuest, setIsGuest] = useState(false);
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddress, setGuestAddress] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Check if user is logged in
        const token = localStorage.getItem('token');
        const loggedIn = !!token;
        setIsGuest(!loggedIn);

        // Fetch user's addresses if logged in
        if (loggedIn) {
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
            showToast('Failed to load addresses', 'error');
          }
        }

        // Get cart items (works for both guest and logged-in users)
        try {
          const cartResponse = await cartApi.getCart();
          if (cartResponse) {
            setCart(cartResponse?.items || []);
          }
        } catch (err) {
          console.error('Error fetching cart:', err);
          showToast('Failed to load cart', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Failed to load checkout data', 'error');
        console.error('Error fetching checkout data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, showToast]);

  const validateGuestAddress = () => {
    if (!guestAddress.name || !guestAddress.phone || !guestAddress.addressLine1 ||
      !guestAddress.city || !guestAddress.state || !guestAddress.postalCode) {
      showToast('Please fill in all required address fields', 'warning');
      return false;
    }
    if (guestAddress.phone.length !== 10) {
      showToast('Please enter a valid 10-digit phone number', 'warning');
      return false;
    }
    return true;
  };

  const handleCreateOrder = async () => {
    // Validation
    if (isGuest) {
      if (!validateGuestAddress()) return;
    } else {
      if (!selectedAddressId) {
        showToast('Please select a delivery address', 'warning');
        return;
      }
    }

    try {
      setSubmitting(true);

      // Step 1: Create order
      console.log('Creating order...');
      let response;

      if (isGuest) {
        // Guest order with address data
        response = await orderApi.createGuestOrder(guestAddress, paymentMethod);
      } else {
        // Logged-in user order
        response = await orderApi.createOrder(selectedAddressId, paymentMethod);
      }

      if (!response.success) {
        showToast(response.message || 'Failed to create order', 'error');
        setSubmitting(false);
        return;
      }

      const orderData = response.data;
      console.log('Order created:', orderData);
      showToast('Order created successfully!', 'success');

      // Step 2: Initialize Razorpay payment
      if (paymentMethod === 'RAZORPAY') {
        const totalAmount = cart.reduce((sum, item) => sum + (parseFloat(item.unitPrice) * item.quantity), 0);
        const taxAmount = totalAmount * 0.18;
        const finalAmount = totalAmount + taxAmount;

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: Math.round(finalAmount * 100), // in paise
          currency: 'INR',
          name: 'SoleMate',
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
                showToast('Payment successful!', 'success');

                // Redirect based on user type
                if (isGuest) {
                  // For guests, show order number and tracking info
                  router.push(`/track-order?orderNumber=${orderData.orderNumber}&phone=${guestAddress.phone}`);
                } else {
                  // For logged-in users, go to order detail
                  router.push(`/orders/${orderData.orderId}?payment=success`);
                }
              } else {
                showToast('Payment verification failed', 'error');
                setSubmitting(false);
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              showToast(error.message || 'Payment verification failed', 'error');
              setSubmitting(false);
            }
          },
          prefill: {
            email: localStorage.getItem('userEmail') || '',
            contact: isGuest ? guestAddress.phone : (localStorage.getItem('userPhone') || '')
          },
          theme: {
            color: '#FF6B6B'
          },
          modal: {
            ondismiss: () => {
              console.log('Payment modal closed');
              setSubmitting(false);
              showToast('Payment cancelled. Please try again.', 'warning');
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
      showToast(err.message || 'Error creating order', 'error');
      console.error('Error creating order:', err);
      setSubmitting(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.unitPrice) * item.quantity), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <CartLoadingSkeleton />
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
              className="px-6 py-3 min-h-[44px] bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-colors font-bold touch-manipulation active:scale-95"
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
            className="p-2 min-w-[44px] min-h-[44px] hover:bg-slate-200 rounded-xl transition-colors touch-manipulation active:scale-95"
          >
            <ArrowLeft size={24} className="text-slate-700" />
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
        </div>

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
                      <div className="relative w-20 h-20 bg-slate-50 rounded-xl flex-shrink-0">
                        <Image
                          src={item.variant.images[0].url}
                          alt={item.product?.name || 'Product'}
                          fill
                          sizes="80px"
                          className="object-contain rounded-xl"
                          loading="lazy"
                        />
                      </div>
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
                {!isGuest && addresses.length > 0 && (
                  <button
                    onClick={() => router.push('/profile/addresses')}
                    className="flex items-center gap-2 px-4 py-2 min-h-[44px] text-sm font-semibold text-orange-600 hover:bg-orange-50 rounded-xl transition-colors touch-manipulation active:scale-95"
                  >
                    <Edit2 size={16} />
                    Manage
                  </button>
                )}
              </div>

              {isGuest ? (
                /* Guest Address Form */
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 mb-4">Please provide your delivery address:</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={guestAddress.name}
                      onChange={(e) => setGuestAddress({ ...guestAddress, name: e.target.value })}
                      className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number (10 digits) *"
                      value={guestAddress.phone}
                      onChange={(e) => setGuestAddress({ ...guestAddress, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Address Line 1 *"
                    value={guestAddress.addressLine1}
                    onChange={(e) => setGuestAddress({ ...guestAddress, addressLine1: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />

                  <input
                    type="text"
                    placeholder="Address Line 2 (Optional)"
                    value={guestAddress.addressLine2}
                    onChange={(e) => setGuestAddress({ ...guestAddress, addressLine2: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />

                  <div className="grid md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="City *"
                      value={guestAddress.city}
                      onChange={(e) => setGuestAddress({ ...guestAddress, city: e.target.value })}
                      className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="text"
                      placeholder="State *"
                      value={guestAddress.state}
                      onChange={(e) => setGuestAddress({ ...guestAddress, state: e.target.value })}
                      className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="text"
                      placeholder="PIN Code *"
                      value={guestAddress.postalCode}
                      onChange={(e) => setGuestAddress({ ...guestAddress, postalCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <p className="text-xs text-slate-500 mt-2">* Required fields</p>
                </div>
              ) : addresses.length === 0 ? (
                /* No Addresses */
                <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl">
                  <Truck size={48} className="mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 mb-4 font-medium">No addresses found</p>
                  <p className="text-sm text-slate-500 mb-6">Please add an address to continue with checkout</p>
                  <button
                    onClick={() => router.push('/profile/addresses')}
                    className="px-6 py-3 min-h-[44px] bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-colors inline-flex items-center gap-2 font-bold shadow-md hover:shadow-lg touch-manipulation active:scale-95"
                  >
                    <Plus size={20} />
                    Add New Address
                  </button>
                </div>
              ) : (
                /* Saved Addresses */
                <>
                  <div className="grid gap-3 mb-4">
                    {addresses.map((address) => (
                      <button
                        key={address.id}
                        onClick={() => setSelectedAddressId(address.id)}
                        className={`w-full p-4 border-2 rounded-2xl cursor-pointer transition-all text-left min-h-[44px] touch-manipulation active:scale-[0.98] ${selectedAddressId === address.id
                            ? 'border-orange-500 bg-white shadow-md'
                            : 'border-slate-200 hover:border-orange-300 bg-white hover:bg-slate-50'
                          }`}
                      >
                        <div className="flex gap-3 items-start">
                          <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selectedAddressId === address.id
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
                    className="w-full px-6 py-3 min-h-[44px] border-2 border-dashed border-orange-300 text-orange-600 rounded-2xl hover:bg-orange-50 transition-colors inline-flex items-center justify-center gap-2 font-semibold touch-manipulation active:scale-95"
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
                  className={`w-full p-4 border-2 rounded-xl cursor-pointer transition-all text-left min-h-[44px] touch-manipulation active:scale-[0.98] ${paymentMethod === 'RAZORPAY'
                      ? 'border-orange-500 bg-slate-50 shadow-md'
                      : 'border-slate-200 hover:border-orange-300 bg-white hover:bg-slate-50'
                    }`}
                >
                  <div className="flex gap-3 items-center">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'RAZORPAY'
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
                disabled={submitting || (!isGuest && !selectedAddressId && addresses.length === 0)}
                className="w-full px-6 py-4 min-h-[44px] bg-orange-600 hover:bg-orange-700 disabled:bg-slate-400 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none touch-manipulation active:scale-95 disabled:active:scale-100"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
