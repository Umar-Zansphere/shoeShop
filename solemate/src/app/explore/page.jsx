'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { productApi } from '@/lib/api';
import { ArrowRight, Zap, TrendingUp, Award } from 'lucide-react';

export default function ExplorePage() {
  const router = useRouter();
  const [filterOptions, setFilterOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('explore');

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const data = await productApi.getFilterOptions();
        setFilterOptions(data.data || data);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFilters();
  }, []);

  const categories = [
    { name: 'Running', icon: '🏃', color: 'from-blue-500 to-blue-600' },
    { name: 'Casual', icon: '👟', color: 'from-purple-500 to-purple-600' },
    { name: 'Formal', icon: '🎩', color: 'from-slate-500 to-slate-600' },
    { name: 'Sneakers', icon: '✨', color: 'from-pink-500 to-pink-600' },
  ];

  const genders = [
    { name: 'Men', icon: '👨' },
    { name: 'Women', icon: '👩' },
    { name: 'Kids', icon: '👧' },
    { name: 'Unisex', icon: '👥' },
  ];

  const handleCategoryClick = (categoryName) => {
    router.push(`/products?category=${categoryName.toUpperCase()}`);
  };

  const handleGenderClick = (genderName) => {
    router.push(`/products?gender=${genderName.toUpperCase()}`);
  };

  const handleBrandClick = (brandName) => {
    router.push(`/products?brand=${brandName}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero Section */}
        <div className="mb-16">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-12">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl -mr-48 -mt-48" />
            </div>
            <div className="relative z-10">
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
                Discover Your Perfect Shoe
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl">
                Explore our curated collection of premium footwear. Find your style with thousands of options across multiple brands and categories.
              </p>
              <button
                onClick={() => router.push('/products')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl transition-colors"
              >
                Browse All Products
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center">
            <div className="inline-block p-3 bg-blue-100 rounded-2xl mb-4">
              <TrendingUp size={32} className="text-blue-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">10K+</h3>
            <p className="text-slate-600">Products in stock</p>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center">
            <div className="inline-block p-3 bg-orange-100 rounded-2xl mb-4">
              <Award size={32} className="text-orange-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">50+</h3>
            <p className="text-slate-600">Premium brands</p>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center">
            <div className="inline-block p-3 bg-green-100 rounded-2xl mb-4">
              <Zap size={32} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">100%</h3>
            <p className="text-slate-600">Authentic guarantee</p>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-slate-900">Shop by Category</h2>
            <button
              onClick={() => router.push('/products')}
              className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-2 transition-colors"
            >
              View All
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className={`group relative overflow-hidden rounded-3xl p-8 text-white font-bold text-lg transition-transform hover:scale-105 bg-linear-to-br ${category.color} shadow-lg`}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <span className="text-4xl">{category.icon}</span>
                  <span>{category.name}</span>
                  <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Gender Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-slate-900">Shop by Gender</h2>
            <button
              onClick={() => router.push('/products')}
              className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-2 transition-colors"
            >
              View All
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {genders.map((gender) => (
              <button
                key={gender.name}
                onClick={() => handleGenderClick(gender.name)}
                className="group bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-orange-500 hover:shadow-lg transition-all text-center"
              >
                <div className="text-5xl mb-4">{gender.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{gender.name}</h3>
                <div className="flex items-center justify-center gap-2 text-orange-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Shop
                  <ArrowRight size={18} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Brands Section */}
        {filterOptions?.brands && filterOptions.brands.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-slate-900">Shop by Brand</h2>
              <button
                onClick={() => router.push('/products')}
                className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-2 transition-colors"
              >
                View All
                <ArrowRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filterOptions.brands.slice(0, 8).map((brand) => (
                <button
                  key={brand}
                  onClick={() => handleBrandClick(brand)}
                  className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-orange-500 hover:shadow-lg transition-all text-center group"
                >
                  <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {brand}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2">Shop Collection</p>
                </button>
              ))}
            </div>

            {filterOptions.brands.length > 8 && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => router.push('/products')}
                  className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl transition-colors inline-flex items-center gap-2"
                >
                  See All {filterOptions.brands.length} Brands
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Colors Section */}
        {filterOptions?.colors && filterOptions.colors.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-slate-900">Shop by Color</h2>
              <button
                onClick={() => router.push('/products')}
                className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-2 transition-colors"
              >
                View All
                <ArrowRight size={20} />
              </button>
            </div>

            <div className="flex flex-wrap gap-4">
              {filterOptions.colors.slice(0, 12).map((color) => (
                <button
                  key={color}
                  onClick={() => router.push(`/products?color=${color}`)}
                  className="px-6 py-3 bg-white rounded-2xl border-2 border-slate-200 hover:border-orange-500 hover:shadow-lg transition-all font-semibold text-slate-900 hover:text-orange-600"
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-orange-500 to-orange-600 p-8 sm:p-12 text-center">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -mr-48 -mt-48" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Ready to Find Your Perfect Shoe?
            </h2>
            <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto">
              Browse our complete collection and discover the shoe that matches your style.
            </p>
            <button
              onClick={() => router.push('/products')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white hover:bg-slate-100 text-orange-600 font-bold rounded-2xl transition-colors"
            >
              Start Shopping
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </main>

      <Footer activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
