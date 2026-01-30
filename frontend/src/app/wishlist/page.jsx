'use client';

import { useState, useEffect } from 'react';
import { Trash2, ShoppingBag, Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { wishlistApi, storageApi } from '@/lib/api';

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [addingToCart, setAddingToCart] = useState({});

  // Fetch wishlist data
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is logged in
        const isLoggedin = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedin) {
          setIsLoggedIn(true);
          // Fetch from API
          const response = await wishlistApi.getWishlist();
          setWishlistItems(response.items || []);
        } else {
          setIsLoggedIn(false);
          // Load from localStorage
          const storedWishlist = storageApi.getWishlist();
          setWishlistItems(storedWishlist);
        }
      } catch (err) {
        console.error('Error loading wishlist:', err);
        setError('Failed to load wishlist. Please try again.');
        // Fallback to localStorage
        const storedWishlist = storageApi.getWishlist();
        setWishlistItems(storedWishlist);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  // Remove item from wishlist
  const handleRemoveItem = async (itemId) => {
    try {
      if (isLoggedIn) {
        // Remove from database
        await wishlistApi.removeFromWishlist(itemId);
      } else {
        // Remove from localStorage
        storageApi.removeFromWishlist(itemId);
      }
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item from wishlist');
    }
  };

  // Move to cart
  const handleMoveToCart = async (item) => {
    if (!item.variantId) {
      setError('Please select a variant before adding to cart');
      return;
    }

    try {
      setAddingToCart(prev => ({ ...prev, [item.id]: true }));

      if (isLoggedIn) {
        // Move to cart via API
        await wishlistApi.moveToCart(item.id);
        setWishlistItems(prev => prev.filter(w => w.id !== item.id));
      } else {
        // Add to localStorage cart
        storageApi.addToCart({
          id: `cart-${item.variantId}`,
          productId: item.productId,
          variantId: item.variantId,
          quantity: 1,
          unitPrice: item.variant?.price || 0,
          product: item.product,
          variant: item.variant
        });
        // Remove from wishlist
        storageApi.removeFromWishlist(item.id);
        setWishlistItems(prev => prev.filter(w => w.id !== item.id));
      }
    } catch (err) {
      console.error('Error moving to cart:', err);
      setError('Failed to move item to cart');
    } finally {
      setAddingToCart(prev => ({ ...prev, [item.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <Heart size={40} className="text-gray-400" />
            </div>
            <p className="text-gray-500">Loading wishlist...</p>
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
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Save your favorite products to view later</p>
            <Link href="/products">
              <button className="bg-[#172031] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#232e42] transition">
                Explore Products
              </button>
            </Link>
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-gray-900">
                  My Wishlist ({wishlistItems.length} items)
                </h1>
              </div>

              {/* Wishlist Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {wishlistItems.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                    {/* Product Image */}
                    <Link href={`/product/${item.productId}`}>
                      <div className="w-full h-56 bg-gray-100 overflow-hidden flex items-center justify-center cursor-pointer hover:bg-gray-200 transition">
                        {item.variant?.images?.[0]?.url ? (
                          <img
                            src={item.variant.images[0].url}
                            alt={item.product?.name}
                            className="w-full h-full object-contain p-4"
                          />
                        ) : (
                          <div className="text-gray-400 text-center">
                            <ShoppingBag size={32} className="mx-auto mb-2" />
                            <p className="text-sm">No image</p>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="p-4">
                      <Link href={`/product/${item.productId}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer truncate">
                          {item.product?.name}
                        </h3>
                      </Link>

                      <p className="text-sm text-gray-600 mt-1">
                        {item.product?.brand}
                      </p>

                      {/* Variant Details */}
                      {item.variant && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p>Color: <span className="font-medium text-gray-900">{item.variant.color}</span></p>
                          <p>Size: <span className="font-medium text-gray-900">{item.variant.size}</span></p>
                        </div>
                      )}

                      {/* Price */}
                      <div className="mt-4">
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{parseFloat(item.variant?.price || 0).toFixed(2)}
                        </p>
                        {item.variant?.compareAtPrice && (
                          <p className="text-sm text-gray-500 line-through">
                            ₹{parseFloat(item.variant.compareAtPrice).toFixed(2)}
                          </p>
                        )}
                      </div>

                      {/* Availability */}
                      <div className="mt-3 flex items-center gap-2">
                        <div className={`text-xs font-semibold px-2 py-1 rounded ${item.variant?.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.variant?.isAvailable ? 'In Stock' : 'Out of Stock'}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleMoveToCart(item)}
                          disabled={!item.variant?.isAvailable || addingToCart[item.id]}
                          className="flex-1 bg-[#172031] text-white py-2 rounded-lg font-semibold hover:bg-[#232e42] disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                        >
                          {addingToCart[item.id] ? 'Adding...' : 'Move to Cart'}
                        </button>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                          title="Remove from wishlist"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="text-center">
              <Link href="/products">
                <button className="bg-[#172031] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#232e42] transition">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
