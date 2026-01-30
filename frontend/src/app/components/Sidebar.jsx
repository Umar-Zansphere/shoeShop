'use client';

import { X, LogOut } from 'lucide-react';
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
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar Content */}
      <div className={`fixed top-0 left-0 h-full w-[80%] max-w-sm z-90 bg-[#1E293B] text-white shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col min-h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-white">SoleMate</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Close menu">
              <X size={24} className="text-gray-300" />
            </button>
          </div>

          {/* User Section */}
          <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10">
            {isLoggedIn ? (
              <button
                onClick={() => handleNavigate('/profile')}
                className="w-full flex items-center gap-4 hover:bg-white/10 rounded-lg transition-colors p-1 -m-1"
              >
                <div className="w-12 h-12 rounded-full bg-(--accent) flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {userName ? userName[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium text-white truncate">{userName || 'User'}</p>
                  {phone && <p className="text-xs text-gray-400 truncate">{phone || user.email || 'No Phone/email'}</p>}
                  {/* {userRole && <p className="text-xs text-gray-500 capitalize mt-1">{userRole}</p>} */}
                </div>
              </button>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 mb-4 text-sm">Sign in to sync your wishlist and orders.</p>
                <button 
                  onClick={() => { handleNavigate('/login'); }}
                  className="w-full py-3 bg-(--accent) text-white rounded-xl font-semibold hover:bg-[#FF5252] transition-colors duration-300"
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
              className="w-full text-left py-3 px-4 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              🌟 New Arrivals
            </button>
            <button 
              onClick={() => handleNavigate('/products?isFeatured=true')}
              className="w-full text-left py-3 px-4 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              ⭐ Featured
            </button>
            <button 
              onClick={() => handleNavigate('/products')}
              className="w-full text-left py-3 px-4 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
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
                  className={`w-full text-left py-2.5 px-4 rounded-lg text-sm transition-all ${
                    selectedGender === gender 
                      ? 'bg-white/10 text-white font-medium' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
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
                  className="w-full text-left py-2.5 px-4 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
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
                    className="w-full text-left py-2.5 px-4 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-auto pt-6 border-t border-white/10">
            {isLoggedIn  && (
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 py-4 px-4 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-4 animate-in fade-in zoom-in-95">
            {/* Icon */}
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
              logoutModal.type === 'success' 
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
            <h2 className={`text-center text-2xl font-bold mb-2 ${
              logoutModal.type === 'success' 
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
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-colors ${
                logoutModal.type === 'success'
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
