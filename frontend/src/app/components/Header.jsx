'use client';

import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storageApi } from '@/lib/api';

export default function Header({ 
  onSidebarOpen, 
  onCartOpen, 
  cart = [],
  onSearch,
  user
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  // Calculate cart count - from API or localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // User is logged in - use prop
      const count = cart.reduce((a, b) => a + (b.quantity || 0), 0);
      setCartCount(count);
    } else {
      // User is not logged in - use localStorage
      const storedCart = storageApi.getCart();
      const count = storedCart.reduce((a, b) => a + (b.quantity || 0), 0);
      setCartCount(count);
    }
  }, [cart]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-(--card-bg)/80 backdrop-blur-xl border-b border-gray-200/50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Left: Menu & Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onSidebarOpen} 
            className="p-2.5 -ml-2 hover:bg-(--img-bg) rounded-full transition-colors duration-300 text-(--text-primary)"
            aria-label="Open menu"
          >
            <Menu strokeWidth={1.5} size={26} />
          </button>
          <a href="/" className="text-2xl font-black tracking-tighter text-(--text-primary) hover:opacity-80 transition-opacity">
            SoleMate<span className="text-(--accent) text-3xl leading-none">.</span>
          </a>
        </div>

        {/* Center: Search (Mobile optimized) */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="absolute left-0 right-0 top-full bg-white border-b border-gray-200 p-4">
            <div className="max-w-7xl mx-auto flex gap-2">
              <input 
                autoFocus
                type="text"
                placeholder="Search shoes by name, brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent)"
              />
              <button type="submit" className="p-2.5 bg-(--accent) text-white rounded-lg hover:bg-[#FF5252] transition-colors">
                <Search size={20} />
              </button>
            </div>
          </form>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2.5 hover:bg-(--img-bg) rounded-full transition-colors duration-300 text-(--text-primary)"
            aria-label="Search"
          >
            {searchOpen ? <X strokeWidth={2} size={22} /> : <Search strokeWidth={2} size={22} />}
          </button>
          <button 
            onClick={() => router.push('/cart')}
            className="p-2.5 hover:bg-(--img-bg) rounded-full transition-colors duration-300 text-(--text-primary) relative group"
            aria-label="Shopping cart"
          >
            <ShoppingBag strokeWidth={2} size={22} />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-(--accent) text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white shadow-md">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}