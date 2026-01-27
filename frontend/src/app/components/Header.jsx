'use client';

import { Menu, Search, ShoppingBag } from 'lucide-react';

export default function Header({ onSidebarOpen, onCartOpen, cart = [] }) {
  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-(--card-bg)/80 backdrop-blur-xl border-b border-gray-200/50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Left: Menu & Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onSidebarOpen} 
            className="p-2.5 -ml-2 hover:bg-(--img-bg) rounded-full transition-colors duration-300 text-(--text-primary)"
          >
            <Menu strokeWidth={1.5} size={26} />
          </button>
          <h1 className="text-2xl font-black tracking-tighter text-(--text-primary)">
            SoleMate<span className="text-(--accent) text-3xl leading-none">.</span>
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="p-2.5 hover:bg-(--img-bg) rounded-full transition-colors duration-300 text-(--text-primary)">
            <Search strokeWidth={2} size={22} />
          </button>
          <button 
            onClick={onCartOpen} 
            className="p-2.5 hover:bg-(--img-bg) rounded-full transition-colors duration-300 text-(--text-primary) relative group"
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