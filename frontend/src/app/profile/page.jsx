'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { userApi, authApi } from '@/lib/api';
import { AlertCircle, Loader, Package, Heart, MapPin, ChevronLeft, Sliders, LogOut, UserPen, ShoppingBag } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoutModal, setLogoutModal] = useState({ isOpen: false, type: null, message: '' });

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (!isLoggedIn) {
          router.push('/login?redirect=/profile');
          return;
        }

        const response = await userApi.getProfile();
        if (response.success || response.id) {
          const userData = response.success ? response.data : response;
          setUser(userData);
          setError(null);
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      // 1. Call the API to invalidate session/cookie on server
      await authApi.logout();

      // 2. Clear Client Storage
      localStorage.clear();

      // 3. Update Local State
      setUser(null);

      // 4. Show success modal
      setLogoutModal({ 
        isOpen: true, 
        type: 'success', 
        message: 'You have been logged out successfully!' 
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
      
      // Show error modal
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="animate-spin mx-auto mb-4 text-orange-500" size={32} />
            <p className="text-slate-600">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
            <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
            <p className="text-slate-600 mb-4">Please log in to view your profile</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Go to Login
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const menuItems = [
    { icon: UserPen, label: 'Edit Profile', desc: 'Update your personal information', action: () => router.push('/profile/edit') },
    { icon: MapPin, label: 'Addresses', desc: 'Manage your shipping addresses', action: () => router.push('/profile/addresses') },
    { icon: Package, label: 'My Orders', desc: 'Track active orders', action: () => router.push('/orders') },
    { icon: ShoppingBag, label: 'My Cart', desc: 'Manage your Cart', action: () => router.push('/cart') },
    { icon: Heart, label: 'Wishlist', desc: 'Your saved items', action: () => router.push('/wishlist') },

  ];

  return (
    <div className="pb-32 bg-slate-50 min-h-full flex flex-col">
      <Header />

      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-slate-900 text-white p-8 pt-12 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-20 h-20 bg-linear-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-3xl shadow-lg border-4 border-slate-800">
            {user.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-black">Hello, {user.fullName?.split(' ')[0] || 'User'}</h2>
            <p className="text-slate-400 text-sm">Welcome back</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 -mt-6 relative z-20 space-y-4 flex-1">
        {/* Menu Items */}
        <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-slate-300" />
            </button>
          ))}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-4 bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl font-bold py-3 px-4 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      <Footer />

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
    </div>
  );
}
