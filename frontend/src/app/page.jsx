'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';


export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  };

  const handleLogout = () => {
    setUser(null);
    setSidebarOpen(false);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Handle navigation based on tab
    switch(tabId) {
      case 'cart':
        setCartOpen(true);
        break;
      case 'profile':
        if (!user) {
          setAuthOpen(true);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <Header
        onSidebarOpen={() => setSidebarOpen(true)}
        onCartOpen={() => setCartOpen(true)}
        onAuthRequest={() => setAuthOpen(true)}
        cart={cart}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
        onAuthRequest={() => {
          setSidebarOpen(false);
          setAuthOpen(true);
        }}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Banner (Mobile First) */}
        <div className="mb-8 rounded-4xl overflow-hidden bg-[#1E293B] text-white relative h-64 sm:h-80 shadow-xl">
           <img 
              src="https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=1000" 
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
              alt="Banner"
           />
           <div className="relative h-full flex flex-col justify-center px-8 z-10">
              <span className="text-[#FF6B6B] font-bold tracking-wider text-sm mb-2 uppercase">New Collection</span>
              <h2 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight">Run Faster <br/> Go Further.</h2>
              <button className="bg-white text-gray-900 w-fit px-6 py-3 rounded-full font-bold hover:bg-[#FF6B6B] hover:text-white transition-all">
                 Shop Now
              </button>
           </div>
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <button className="px-8 py-3 border-2 border-[#1E293B] text-[#1E293B] rounded-xl font-semibold hover:bg-[#1E293B] hover:text-white transition-colors">
            Load More Products
          </button>
        </div>
      </main>

      {/* Footer Navigation */}
      <Footer activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
