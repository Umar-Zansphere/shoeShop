'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import BrandScroller from './components/BrandScroller';
import ProductCard from './components/ProductCard';

// Mock Data matching your images
const BRANDS = [
  { id: 1, name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
  { id: 2, name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
  { id: 3, name: 'Puma', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Puma_logo.svg' },
  { id: 4, name: 'Asics', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Asics_Logo.svg' },
  { id: 5, name: 'Reebok', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Reebok_2019_logo.svg' },
  { id: 6, name: 'New Bal..', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/New_Balance_logo.svg' },
  { id: 7, name: 'Converse', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Converse_logo.svg' },
  { id: 8, name: 'More ..', type: 'more' },
];

const PRODUCTS = [
  {
    id: 1,
    name: 'K-Swiss Vista Trainer',
    price: 85.00,
    image: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&q=80&w=800',
    brand: 'K-Swiss'
  },
  {
    id: 2,
    name: 'RS-X Women Sneaker',
    price: 110.00,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    brand: 'Puma'
  },
  {
    id: 3,
    name: 'Fila Windshift 15',
    price: 70.00,
    image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80&w=800',
    brand: 'Fila'
  },
  {
    id: 4,
    name: 'Adidas NMD Glass Pkg',
    price: 75.00,
    image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aef4?auto=format&fit=crop&q=80&w=800',
    brand: 'Adidas'
  },
];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false); // Placeholder
  const [authOpen, setAuthOpen] = useState(false); // Placeholder
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      newSet.has(productId) ? newSet.delete(productId) : newSet.add(productId);
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased pb-32">
      <Header
        onSidebarOpen={() => setSidebarOpen(true)}
        onCartOpen={() => setCartOpen(true)}
        cart={cart}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={() => setUser(null)}
        onAuthRequest={() => setAuthOpen(true)}
      />

      <main className="max-w-7xl mx-auto pt-4 px-4 sm:px-6">
        {/* Hero Banner - More Spacious and Rounded */}
        <div className="relative mb-10 w-full rounded-[2.5rem] overflow-hidden shadow-2xl h-90 sm:h-112.5 group">
          <img 
             src="https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=1600" 
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
             alt="Banner"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent" />
          
          <div className="relative h-full flex flex-col justify-center px-8 sm:px-12 z-10 max-w-xl">
             <div className="inline-flex items-center gap-2 mb-4">
                <span className="h-0.5 w-8 bg-[#FF6B6B]"></span>
                <span className="text-[#FF6B6B] font-bold tracking-widest text-xs uppercase">New Collection</span>
             </div>
             <h2 className="text-4xl sm:text-6xl font-extrabold text-white mb-6 leading-[1.1]">
               Run Faster.<br/>
               <span className="text-gray-300">Go Further.</span>
             </h2>
             <p className="text-gray-300 mb-8 max-w-sm text-lg">Engineered for the modern athlete. Experience comfort like never before.</p>
             <button className="bg-white text-black w-fit px-8 py-4 rounded-full font-bold hover:bg-[#FF6B6B] hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                Shop Now
             </button>
          </div>
        </div>

        {/* Brand Section (Ref: Image 1) */}
        <section className="mb-12">
          <BrandScroller brands={BRANDS} />
        </section>

        {/* Products Section (Ref: Image 2) */}
        <section>
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-2xl font-bold text-(--text-primary)">Most Popular</h2>
            <button className="text-sm font-semibold text-(--text-primary) hover:text-(--accent) transition-colors">
              See All
            </button>
          </div>
          
          {/* The grid-cols will handle the width, the flex inside ProductCard handles the height */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
            {PRODUCTS.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isLiked={wishlist.has(product.id)}
                onToggleLike={() => toggleWishlist(product.id)}
              />
            ))}
          </div>
        </section>

        {/* Load More */}
        <div className="mt-16 text-center">
          <button className="px-10 py-4 border-2 border-gray-200 bg-white text-(--text-primary) rounded-full font-semibold hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-sm hover:shadow-md text-sm tracking-wide">
            Load More Products
          </button>
        </div>
      </main>

      <Footer activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}