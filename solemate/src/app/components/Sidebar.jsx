'use client';

import { X, LogOut, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productApi, authApi } from '@/lib/api';

const Sidebar = ({ isOpen, onClose, user: propUser, onLogout, onAuthRequest }) => {
  const [filterOptions, setFilterOptions] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState(null);
  const [phone, setPhone] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logoutModal, setLogoutModal] = useState({ isOpen: false, type: null, message: '' });
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for login status and user data
    const checkLoginStatus = () => {
      try {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
          setUserName(localStorage.getItem('fullName'));
          setUserRole(localStorage.getItem('userRole'));
          setPhone(localStorage.getItem('phone'));
        } else {
          setUserName(null);
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        setIsLoggedIn(false);
        setUserName(null);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isOpen && !filterOptions) {
      loadFilterOptions();
    }
  }, [isOpen, filterOptions]);

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const data = await productApi.getFilterOptions();
      setFilterOptions(data.data || data);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path) => {
    router.push(path);
    onClose();
  };

  const handleGenderFilter = (gender) => {
    setSelectedGender(gender);
    router.push(`/products?gender=${encodeURIComponent(gender)}`);
    onClose();
  };

  const handleCategoryFilter = (category) => {
    router.push(`/products?category=${encodeURIComponent(category)}`);
    onClose();
  };

  const handleLogout = async () => {
    try {
      // 1. Call the API to invalidate session/cookie on server
      await authApi.logout();

      // 2. Clear Client Storage
      localStorage.clear();

      // 3. Update Local State
      setUserName(null);
      setUserRole(null);
      setIsLoggedIn(false);

      // 4. Show success modal
      setLogoutModal({
        isOpen: true,
        type: 'success',
        message: 'You have been logged out successfully!'
      });

      // 5. Trigger callbacks
      if (onLogout) onLogout();
      onClose();
    } catch (error) {
      console.error('Logout API call failed:', error);

      // Show error modal instead of failing silently
      setLogoutModal({
        isOpen: true,
        type: 'error',
        message: 'Logout failed. Please try again.'
      });
    }
  };

  const handleModalClose = () => {
    setLogoutModal({ isOpen: false, type: null, message: '' });
    router.push('/');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <div className={`fixed top-0 left-0 h-full w-[85%] max-w-sm z-50 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col min-h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black tracking-tight text-white">
              SoleMate<span className="text-orange-500">.</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all active:scale-95 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <X size={24} className="text-gray-300" />
            </button>
          </div>

          {/* User Section */}
          <div className="mb-8 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            {isLoggedIn ? (
              <button
                onClick={() => handleNavigate('/profile')}
                className="w-full flex items-center gap-4 hover:bg-white/10 rounded-xl transition-all p-2 -m-2 active:scale-98 touch-manipulation"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg">
                  {userName ? userName[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-bold text-white truncate text-base">{userName || 'User'}</p>
                  {phone && <p className="text-xs text-gray-400 truncate mt-0.5">{phone}</p>}
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 mb-4 text-sm leading-relaxed">Sign in to sync your wishlist and orders.</p>
                <button
                  onClick={() => { handleNavigate('/login'); }}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl active:scale-95 touch-manipulation"
                >
                  Login / Signup
                </button>
              </div>
            )}
          </div>

          {/* Quick Navigation */}
          <nav className="mb-6 space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Shop</p>
            <button
              onClick={() => handleNavigate('/products?isFeatured=true')}
              className="w-full text-left py-3.5 px-4 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all active:scale-98 touch-manipulation"
            >
              🌟 New Arrivals
            </button>
            <button
              onClick={() => handleNavigate('/products?isFeatured=true')}
              className="w-full text-left py-3.5 px-4 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all active:scale-98 touch-manipulation"
            >
              ⭐ Featured
            </button>
            <button
              onClick={() => handleNavigate('/products')}
              className="w-full text-left py-3.5 px-4 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all active:scale-98 touch-manipulation"
            >
              👟 All Products
            </button>
          </nav>

          {/* Gender Filter */}
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">By Gender</p>
            <div className="space-y-2">
              {['MEN', 'WOMEN', 'UNISEX', 'KIDS'].map((gender) => (
                <button
                  key={gender}
                  onClick={() => handleGenderFilter(gender)}
                  className={`w-full text-left py-3 px-4 rounded-xl text-sm transition-all active:scale-98 touch-manipulation ${selectedGender === gender
                      ? 'bg-white/15 text-white font-bold shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {gender.charAt(0) + gender.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">By Category</p>
            <div className="space-y-2">
              {['RUNNING', 'CASUAL', 'FORMAL', 'SNEAKERS'].map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className="w-full text-left py-3 px-4 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all active:scale-98 touch-manipulation"
                >
                  {category.charAt(0) + category.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          {filterOptions?.brands && filterOptions.brands.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Popular Brands</p>
              <div className="space-y-2">
                {filterOptions.brands.slice(0, 5).map((brand) => (
                  <button
                    key={brand}
                    onClick={() => {
                      router.push(`/products?brand=${encodeURIComponent(brand)}`);
                      onClose();
                    }}
                    className="w-full text-left py-3 px-4 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all active:scale-98 touch-manipulation"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-auto pt-6 border-t border-white/10">
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 py-4 px-4 text-red-400 hover:bg-red-400/10 rounded-xl transition-all active:scale-95 touch-manipulation font-medium"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            )}
            <p className="text-xs text-gray-500 text-center mt-4">SoleMate © 2026</p>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {logoutModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            {/* Icon */}
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${logoutModal.type === 'success'
                ? 'bg-green-100'
                : 'bg-red-100'
              }`}>
              {logoutModal.type === 'success' ? (
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* Title */}
            <h2 className={`text-center text-2xl font-bold mb-2 ${logoutModal.type === 'success'
                ? 'text-slate-900'
                : 'text-red-600'
              }`}>
              {logoutModal.type === 'success' ? 'Logout Successful' : 'Logout Failed'}
            </h2>

            {/* Message */}
            <p className="text-center text-slate-600 mb-8">
              {logoutModal.message}
            </p>

            {/* Button */}
            <button
              onClick={handleModalClose}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-white transition-all active:scale-95 touch-manipulation ${logoutModal.type === 'success'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
                }`}
            >
              Go to Home
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
