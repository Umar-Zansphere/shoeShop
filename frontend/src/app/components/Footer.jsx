'use client';

import { Home, ShoppingBag, Wallet, User, Compass } from 'lucide-react';

export default function Footer({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'explore', icon: Compass, label: 'Explore' },
    { id: 'cart', icon: ShoppingBag, label: 'Cart' },
    { id: 'wallet', icon: Wallet, label: 'Wallet' },
    { id: 'profile', icon: User, label: 'Account' },
  ];

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto bg-(--card-bg)/90 backdrop-blur-xl border border-gray-200/50 shadow-lg shadow-black/8 rounded-full px-6 py-4 flex items-center gap-6 sm:gap-10 transition-all duration-300">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative group flex items-center justify-center transition-all duration-300"
            >
              <div className={`absolute -inset-3 rounded-full transition-all duration-300 ${isActive ? 'bg-(--text-primary)' : 'group-hover:bg-(--img-bg)'}`} />
              
              <Icon
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
                className={`relative z-10 transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-(--text-secondary)'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}