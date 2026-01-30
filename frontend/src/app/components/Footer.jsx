'use client';

import { Home, ShoppingBag, Heart, User, Compass, Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Footer({ activeTab, onTabChange, onNavigate }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const router = useRouter();

  const handleNavigation = (href) => {
    router.push(href);
  };

  const tabs = [
    { id: 'home', icon: Home, label: 'Home', href: '/' },
    { id: 'explore', icon: Compass, label: 'Explore', href: '/explore' },
    { id: 'cart', icon: ShoppingBag, label: 'Cart', href: '/cart' },
    { id: 'wishlist', icon: Heart, label: 'Wishlist', href: '/wishlist' },
    { id: 'profile', icon: User, label: 'Account', href: '/profile' },
  ];

  return (
    <footer className="mt-32 border-t border-gray-200 bg-gray-50">
      {/* Newsletter Section */}
      {/* <div className="bg-linear-to-r from-[#172031] to-[#232e42] text-white py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">Stay Updated</h3>
          <p className="text-gray-300 mb-6">Subscribe to our newsletter for exclusive offers and new arrivals.</p>
          
          <form onSubmit={handleNewsletterSubmit} className="flex gap-2 mb-4">
            <input 
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-300 focus:outline-none focus:ring-2 focus:ring-(--accent)"
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-(--accent) text-white font-bold rounded-lg hover:bg-[#FF5252] transition-colors"
            >
              Subscribe
            </button>
          </form>
          
          {subscribed && (
            <p className="text-green-300 text-sm">Thanks for subscribing!</p>
          )}
        </div>
      </div> */}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h4 className="text-lg font-bold text-black mb-4">SoleMate</h4>
            <p className="text-sm text-gray-600">Your destination for premium footwear.</p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-600 hover:text-(--accent) transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-(--accent) transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-(--accent) transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-(--accent) transition-colors">All Products</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-(--accent) transition-colors">Men's Shoes</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-(--accent) transition-colors">Women's Shoes</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-(--accent) transition-colors">Sale</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-(--accent) transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-(--accent) transition-colors">FAQ</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-(--accent) transition-colors">Shipping Info</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-(--accent) transition-colors">Returns</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-(--accent) transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-(--accent) transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-(--accent) transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-(--accent) transition-colors">Press</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-(--accent) transition-colors">Privacy</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-(--accent) transition-colors">Terms</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-(--accent) transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
          <p>&copy; 2026 SoleMate. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-(--accent) transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-(--accent) transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-(--accent) transition-colors">Contact</a>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Tab Bar */}
      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto bg-(--card-bg)/90 backdrop-blur-xl border border-gray-200/50 shadow-lg shadow-black/8 rounded-full px-6 py-4 flex items-center gap-6 sm:gap-10 transition-all duration-300">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  handleNavigation(tab.href);
                }}
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
    </footer>
  );
}