'use client';

import { Home, ShoppingBag, Package, Wallet, User } from 'lucide-react';

const Footer = ({ activeTab = 'home', onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'cart', label: 'Cart', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <footer className="fixed pb-6 bottom-0 left-0 right-0  z-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around h-20">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className="flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors group"
              >
                <Icon
                  size={28}
                  className={`transition-colors ${
                    isActive
                      ? 'text-gray-900 fill-gray-900'
                      : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-gray-900'
                      : 'text-gray-500 group-hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
