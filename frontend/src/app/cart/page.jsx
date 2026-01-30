'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { cartApi, storageApi } from '@/lib/api';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fetch cart data
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is logged in
        const isLoggedin = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedin) {
          setIsLoggedIn(true);
          // Fetch from API
          const response = await cartApi.getCart();
          setCartItems(response.items || []);
        } else {
          setIsLoggedIn(false);
          // Load from localStorage
          const storedCart = storageApi.getCart();
          setCartItems(storedCart);
        }
      } catch (err) {
        console.error('Error loading cart:', err);
        setError('Failed to load cart. Please try again.');
        // Fallback to localStorage
        const storedCart = storageApi.getCart();
        setCartItems(storedCart);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Update quantity
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      if (isLoggedIn) {
        // Update in database
        await cartApi.updateCartItem(itemId, newQuantity);
        setCartItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
      } else {
        // Update in localStorage
        storageApi.updateCartItem(itemId, newQuantity);
        setCartItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity');
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (itemId) => {
    try {
      if (isLoggedIn) {
        // Remove from database
        await cartApi.removeFromCart(itemId);
      } else {
        // Remove from localStorage
        storageApi.removeFromCart(itemId);
      }
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item');
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.unitPrice || item.price || 0);
    return sum + price * item.quantity;
  }, 0);

  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  // Handle checkout
  const handleCheckout = () => {
    if (!isLoggedIn) {
      // Redirect to login
      router.push('/login?redirect=/checkout');
      return;
    }
    // Proceed to checkout
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <ShoppingBag size={40} className="text-gray-400" />
            </div>
            <p className="text-gray-500">Loading cart...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-fit">
            <ArrowLeft size={18} />
            Continue Shopping
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started</p>
            <Link href="/products">
              <button className="bg-[#172031] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#232e42] transition">
                Continue Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="border-b p-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Shopping Cart ({cartItems.length} items)
                  </h1>
                </div>

                <div className="divide-y">
                  {cartItems.map(item => (
                    <div key={item.id} className="p-6 flex gap-4">
                      {/* Product Image */}
                      <Link href={`/product/${item.productId}`}>
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0 cursor-pointer hover:shadow-md transition">
                          {item.variant?.images?.[0]?.url ? (
                            <img
                              src={item.variant.images[0].url}
                              alt={item.product?.name}
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1">
                        <Link href={`/product/${item.productId}`}>
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                            {item.product?.name}
                          </h3>
                        </Link>

                        <p className="text-sm text-gray-600 mt-1">
                          Brand: <span className="font-medium">{item.product?.brand}</span>
                        </p>

                        <div className="flex gap-4 text-sm mt-2">
                          <span className="text-gray-600">
                            Color: <span className="font-medium text-gray-900">{item.variant?.color}</span>
                          </span>
                          <span className="text-gray-600">
                            Size: <span className="font-medium text-gray-900">{item.variant?.size}</span>
                          </span>
                        </div>

                        {/* Price & Quantity */}
                        <div className="flex items-center justify-between mt-4">
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              ₹{parseFloat(item.unitPrice || item.price || 0).toFixed(2)}
                            </p>
                            {item.variant?.compareAtPrice && (
                              <p className="text-sm text-gray-500 line-through">
                                ₹{parseFloat(item.variant.compareAtPrice).toFixed(2)}
                              </p>
                            )}
                          </div>

                          {/* Quantity Selector */}
                          <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-100 rounded transition"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                              className="w-12 text-center border-0 focus:outline-none"
                            />
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-100 rounded transition"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remove from cart"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow sticky top-20">
                <div className="border-b p-6">
                  <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
                </div>

                <div className="p-6 space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18% GST)</span>
                    <span className="font-semibold">₹{tax.toFixed(2)}</span>
                  </div>

                  {/* Divider */}
                  <div className="border-t pt-4" />

                  {/* Total */}
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">₹{total.toFixed(2)}</span>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-[#172031] text-white py-3 rounded-lg font-bold hover:bg-[#232e42] transition mt-4"
                  >
                    {isLoggedIn ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                  </button>

                  {!isLoggedIn && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      You'll be redirected to sign in before checkout
                    </p>
                  )}

                  {/* Continue Shopping */}
                  <Link href="/products">
                    <button className="w-full border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold hover:border-gray-400 transition">
                      Continue Shopping
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
