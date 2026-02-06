'use client';

import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import Image from 'next/image';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProductCard from './components/ProductCard';
import { productApi, cartApi, wishlistApi } from '@/lib/api';
import { useToast } from '@/components/ToastContext';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import Link from 'next/link';

export default function Home() {
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());

  // Data fetching states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch popular products on mount
  useEffect(() => {
    const loadPopularProducts = async () => {
      try {
        setLoading(true);
        const data = await productApi.getPopularProducts({ skip: 0, take: 8 });
        setProducts(data.data?.products || []);
      } catch (err) {
        console.error('Failed to load products:', err);
        showToast('Failed to load products. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadPopularProducts();
  }, [showToast]);

  const toggleWishlist = async ({ productId, variantId }) => {
    const isCurrentlyLiked = wishlist.has(productId);

    try {
      if (isCurrentlyLiked) {
        // Remove from wishlist - need wishlist item ID
        // For now, just update local state
        setWishlist((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        showToast('Removed from wishlist', 'info');
      } else {
        // Add to wishlist
        const response = await wishlistApi.addToWishlist(productId, variantId);
        setWishlist((prev) => {
          const newSet = new Set(prev);
          newSet.add(productId);
          return newSet;
        });
        showToast(response.toast?.message || 'Added to wishlist', 'success');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showToast('Failed to update wishlist. Please try again.', 'error');
    }
  };

  const handleAddToCart = async ({ variantId, productId, quantity = 1, price }) => {
    try {
      const response = await cartApi.addToCart(variantId, quantity);

      // Update local cart state
      setCart((prev) => {
        const existing = prev.find(item => item.variantId === variantId);
        if (existing) {
          return prev.map(item =>
            item.variantId === variantId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { variantId, productId, quantity, price }];
      });

      showToast(response.toast?.message || 'Added to cart', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add to cart. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased pb-32">
      <Header
        onSidebarOpen={() => setSidebarOpen(true)}
        onCartOpen={() => setCartOpen(true)}
        cart={cart}
        user={user}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={() => setUser(null)}
        onAuthRequest={() => setAuthOpen(true)}
      />

      <main className="max-w-7xl mx-auto pt-4 px-4 sm:px-6">
        {/* Hero Banner */}
        <div className="relative mb-10 w-full rounded-[2.5rem] overflow-hidden shadow-2xl h-90 sm:h-112.5 group">
          <Image
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=1600"
            alt="Banner"
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent" />

          <div className="relative h-full flex flex-col justify-center px-8 sm:px-12 z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-0.5 w-8 bg-[#FF6B6B]"></span>
              <span className="text-[#FF6B6B] font-bold tracking-widest text-xs uppercase">New Collection</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-extrabold text-white mb-6 leading-[1.1]">
              Run Faster.<br />
              <span className="text-gray-300">Go Further.</span>
            </h2>
            <p className="text-gray-300 mb-8 max-w-sm text-lg">Engineered for the modern athlete. Experience comfort like never before.</p>
            <Link href="/products" className="inline-block">
              <button className="bg-white text-black w-fit px-8 py-4 rounded-full font-bold hover:bg-[#FF6B6B] hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                Shop Now
              </button>
            </Link>
          </div>
        </div>

        {/* Products Section */}
        <section>
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-2xl font-bold text-(--text-primary)">Most Popular</h2>
            <Link href="/products">
              <button className="text-sm font-semibold text-(--text-primary) hover:text-(--accent) transition-colors">
                See All
              </button>
            </Link>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No products available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isLiked={wishlist.has(product.id)}
                  onToggleLike={toggleWishlist}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </section>

        {/* Load More */}
        {products.length > 0 && (
          <div className="mt-16 text-center">
            <Link href="/products">
              <button className="px-10 py-4 border-2 border-gray-200 bg-white text-(--text-primary) rounded-full font-semibold hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm hover:shadow-md text-sm tracking-wide">
                Load More Products
              </button>
            </Link>
          </div>
        )}
      </main>

      {/* <Footer activeTab={activeTab} onTabChange={setActiveTab} /> */}
    </div>
  );
}