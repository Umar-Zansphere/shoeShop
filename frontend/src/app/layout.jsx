"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, LogOut, BarChart3, Package, ShoppingCart, Settings, ChevronDown, Bell } from 'lucide-react';
import Link from 'next/link';
import NotificationBell from '@/components/admin/NotificationBell';
import './globals.css';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  const handleLogout = async () => {
    try {
      // 1. Call the API to invalidate session/cookie on server
      await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }, credentials: 'include' });
      // 2. Clear localStorage (for any cached data)
      localStorage.clear();
      // 3. Redirect to admin login page
      router.push('/login');
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Even if API fails, clear local data and redirect
      localStorage.clear();
      router.push('/login');
    }
  };

  const isActive = (path) => pathname === path || (path !== '/admin' && pathname.startsWith(path));

  const menuItems = [
    {
      label: 'Dashboard',
      icon: BarChart3,
      path: '/',
      submenu: null,
    },
    {
      label: 'Products',
      icon: Package,
      path: '/products',
      submenu: [
        { label: 'All Products', path: '/products' },
        { label: 'Add Product', path: '/products/new' },
        { label: 'Inventory', path: '/inventory' },
      ],
    },
    {
      label: 'Orders',
      icon: ShoppingCart,
      path: '/orders',
      submenu: [
        { label: 'All Orders', path: '/orders' },
        { label: 'Analytics', path: '/analytics' },
      ],
    },
    {
      label: 'Notifications',
      icon: Bell,
      path: '/notifications',
      submenu: null,
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      submenu: null,
    },
  ];

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FF6B6B" />
        <meta name="description" content="SoleMate - Discover premium shoes with exclusive collections" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/manifest-icon-192.maskable.png" />
        <link rel="apple-touch-icon" href="/icons/manifest-icon-192.maskable.png" />
        <title>SoleMate Admin</title>
      </head>
      <body>
        <div className="flex h-screen bg-gray-50">
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}

          {/* Sidebar */}
          <aside
            className={`fixed lg:relative z-30 bg-gray-800 text-white transition-transform duration-300 ease-in-out transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              } lg:translate-x-0 w-64 h-full shrink-0 flex flex-col`}
          >
            {/* Logo */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h1 className="text-xl font-bold">SoleMate</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const itemIsActive = isActive(item.path);
                const submenuExpanded = expandedMenu === item.label || item.submenu?.some(subitem => isActive(subitem.path));

                return (
                  <div key={item.path}>
                    <button
                      onClick={() => {
                        if (hasSubmenu) {
                          setExpandedMenu(submenuExpanded ? null : item.label);
                        } else {
                          router.push(item.path);
                          if (window.innerWidth < 1024) setSidebarOpen(false);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${itemIsActive && !hasSubmenu
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                      <Icon size={20} className="shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {hasSubmenu && (
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${submenuExpanded ? 'rotate-180' : ''}`}
                        />
                      )}
                    </button>

                    {/* Submenu */}
                    {hasSubmenu && submenuExpanded && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-3">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.path}
                            href={subitem.path}
                            onClick={() => {
                              if (window.innerWidth < 1024) setSidebarOpen(false);
                            }}
                            className={`block px-3 py-2 text-sm rounded-lg transition-all ${isActive(subitem.path)
                              ? 'text-white bg-primary/80 font-medium'
                              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                              }`}
                          >
                            {subitem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-700 space-y-3">
              <div className="px-3 py-2 bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-primary/20 hover:text-primary rounded-lg transition-all text-sm"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 -ml-2 text-gray-600"
                  >
                    <Menu size={24} />
                  </button>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Admin Panel</h2>
                </div>
                <div className="flex items-center gap-2">
                  <NotificationBell />
                  <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings size={20} className="text-gray-600" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Page Content */}
            <div className="p-4 sm:p-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
