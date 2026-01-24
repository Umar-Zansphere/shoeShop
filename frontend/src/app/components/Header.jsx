'use client';

import { useState } from 'react';
import { Menu, Search, ShoppingBag } from 'lucide-react';

export default function Header({ onSidebarOpen, onCartOpen, onAuthRequest, cart = [] }) {
  return (
    <header className="sticky top-0 z-30 bg-[#FAFAF8]/80 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onSidebarOpen} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">SoleMate<span className="text-[#FF6B6B]">.</span></h1>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Search size={24} />
          </button>
          <button onClick={onCartOpen} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <ShoppingBag size={24} />
            {cart.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF6B6B] text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
          {/* <button 
            onClick={onAuthRequest}
            className="ml-2 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg font-semibold hover:bg-[#ff5252] transition-colors text-sm"
          >
            Login/Signup
          </button> */}
        </div>
      </div>
    </header>
  );
}
