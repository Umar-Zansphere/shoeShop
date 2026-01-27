'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, LogOut, BarChart3, Package, ShoppingCart, Settings, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  const menuItems = [
    {
      label: 'Dashboard',
      icon: BarChart3,
      path: '/admin',
      submenu: null,
    },
    {
      label: 'Products',
      icon: Package,
      path: '/admin/products',
      submenu: [
        { label: 'All Products', path: '/admin/products' },
        { label: 'Add Product', path: '/admin/products/new' },
        { label: 'Inventory', path: '/admin/inventory' },
      ],
    },
    {
      label: 'Orders',
      icon: ShoppingCart,
      path: '/admin/orders',
      submenu: [
        { label: 'All Orders', path: '/admin/orders' },
        { label: 'Pending', path: '/admin/orders?status=PENDING' },
        { label: 'Shipped', path: '/admin/orders?status=SHIPPED' },
        { label: 'Analytics', path: '/admin/analytics' },
      ],
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/admin/settings',
      submenu: null,
    },
  ];

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
    <div className="flex h-screen bg-(--background)">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-(--sidebar) text-white transition-all duration-300 overflow-y-auto flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold">SoleMate</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const itemIsActive = isActive(item.path);
            const submenuExpanded = expandedMenu === item.label;

            return (
              <div key={item.path}>
                <button
                  onClick={() => {
                    if (hasSubmenu) {
                      setExpandedMenu(submenuExpanded ? null : item.label);
                    } else {
                      router.push(item.path);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    itemIsActive
                      ? 'bg-(--accent) text-white'
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Icon size={20} className="shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {hasSubmenu && (
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${submenuExpanded ? 'rotate-180' : ''}`}
                        />
                      )}
                    </>
                  )}
                </button>

                {/* Submenu */}
                {hasSubmenu && sidebarOpen && submenuExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.path}
                        href={subitem.path}
                        className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                          isActive(subitem.path)
                            ? 'bg-(--accent) text-white'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
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
        <div className="p-4 border-t border-white/10 space-y-3">
          {sidebarOpen && (
            <div className="px-3 py-2 bg-white/5 rounded-lg">
              <p className="text-xs text-white/60">Admin Panel</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-white/70 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors text-sm"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-(--card-bg) border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-(--text-primary)">Admin Panel</h2>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-(--img-bg) rounded-lg transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
    </RoleGuard>
  );
}
