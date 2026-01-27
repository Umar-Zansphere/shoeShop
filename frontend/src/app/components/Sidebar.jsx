'use client';

import { X, LogOut } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, user, onLogout, onAuthRequest }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar Content */}
      <div className={`fixed top-0 left-0 h-full w-[80%] max-w-sm z-50 bg-[#1E293B] text-white shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-white">SoleMate</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={24} className="text-gray-300" />
            </button>
          </div>

          {/* User Section */}
          <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-(--accent) flex items-center justify-center text-white font-bold text-lg">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-medium text-white">{user.name || 'User'}</p>
                  <p className="text-xs text-gray-400">{user.email || user.phone}</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 mb-4 text-sm">Sign in to sync your wishlist and orders.</p>
                <button 
                  onClick={() => { onClose(); onAuthRequest(); }}
                  className="w-full py-3 bg-(--accent) text-white rounded-xl font-semibold hover:bg-[#FF5252] transition-colors duration-300"
                >
                  Login / Signup
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {[
              { label: 'New Arrivals', active: true },
              { label: 'Men', active: false },
              { label: 'Women', active: false },
              { label: 'Kids', active: false },
              { label: 'Sale', active: false },
            ].map((item, idx) => (
              <button 
                key={idx}
                className={`w-full text-left py-3 px-4 rounded-xl transition-all ${
                  item.active 
                    ? 'bg-white/10 text-white font-medium' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Footer Actions */}
          {user && (
            <button 
              onClick={onLogout}
              className="mt-auto flex items-center gap-3 py-4 px-4 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
