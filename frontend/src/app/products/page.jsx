'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Sidebar from '@/app/components/Sidebar';
import Footer from '@/app/components/Footer';
import ProductCard from '@/app/components/ProductCard';
import { productApi } from '@/lib/api';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL Parameters
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const gender = searchParams.get('gender') || '';
  const brand = searchParams.get('brand') || '';
  const color = searchParams.get('color') || '';
  const size = searchParams.get('size') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const pageStr = searchParams.get('page') || '1';
  const page = parseInt(pageStr, 10);

  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [wishlist, setWishlist] = useState(new Set());
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('products');

  // Filter UI States
  const [expandedFilters, setExpandedFilters] = useState({
    gender: true,
    category: true,
    price: false,
  });

  // Data States
  const [products, setProducts] = useState([]);
  const [filterOptions, setFilterOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const itemsPerPage = 12;
  const skip = (page - 1) * itemsPerPage;

  // Load filter options
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const data = await productApi.getFilterOptions();
        setFilterOptions(data.data || data);
      } catch (err) {
        console.error('Failed to load filters:', err);
      }
    };
    loadFilters();
  }, []);

  // Load products based on filters
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        let response;

        if (search) {
          // Advanced search
          response = await productApi.searchProducts({
            search,
            category: category || undefined,
            gender: gender || undefined,
            brand: brand || undefined,
            color: color || undefined,
            size: size || undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
            skip,
            take: itemsPerPage,
          });
        } else if (category) {
          response = await productApi.getProductsByCategory(category, skip, itemsPerPage);
        } else if (gender) {
          response = await productApi.getProductsByGender(gender, skip, itemsPerPage);
        } else if (brand) {
          response = await productApi.getProductsByBrand(brand, skip, itemsPerPage);
        } else if (color) {
          response = await productApi.getProductsByColor(color, skip, itemsPerPage);
        } else if (size) {
          response = await productApi.getProductsBySize(size, skip, itemsPerPage);
        } else if (minPrice || maxPrice) {
          response = await productApi.searchProducts({
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
            skip,
            take: itemsPerPage,
          });
        } else {
          // Default: all products
          response = await productApi.getProducts({ skip, take: itemsPerPage });
        }

        const data = response.data || response;
        setProducts(data.products || []);
        setPagination(data.pagination || {});
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [search, category, gender, brand, color, size, minPrice, maxPrice, page]);

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      newSet.has(productId) ? newSet.delete(productId) : newSet.add(productId);
      return newSet;
    });
  };

  const handleAddToCart = (cartItem) => {
    setCart((prev) => {
      const existing = prev.find(item => item.variantId === cartItem.variantId);
      if (existing) {
        return prev.map(item =>
          item.variantId === cartItem.variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...cartItem, quantity: 1 }];
    });
  };

  const toggleFilter = (filter) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const updateFilter = (filterName, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(filterName, value);
    } else {
      params.delete(filterName);
    }
    params.set('page', '1'); // Reset to first page
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/products');
  };

  const hasActiveFilters = !!(search || category || gender || brand || color || size || minPrice || maxPrice);

  const pageCount = pagination?.pages || 1;

  // Get page title based on filters
  const getPageTitle = () => {
    if (search) return `Search Results: "${search}"`;
    if (category) return `${category.charAt(0) + category.slice(1).toLowerCase()} Shoes`;
    if (gender) return `${gender.charAt(0) + gender.slice(1).toLowerCase()} Shoes`;
    if (brand) return `${brand} Shoes`;
    if (color) return `${color} Shoes`;
    if (size) return `Size ${size}`;
    return 'All Products';
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onSidebarOpen={() => setSidebarOpen(true)}
        onCartOpen={() => {}}
        cart={cart}
        user={user}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={() => setUser(null)}
        onAuthRequest={() => {}}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-2">
            {getPageTitle()}
          </h1>
          {pagination?.total && (
            <p className="text-gray-600">
              Showing {pagination.total > 0 ? `${skip + 1}-${Math.min(skip + itemsPerPage, pagination.total)}` : 0} of {pagination.total} products
            </p>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {search && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Search: {search}
                  <button onClick={() => updateFilter('search', '')} className="hover:opacity-70">
                    <X size={16} />
                  </button>
                </span>
              )}
              {category && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Category: {category}
                  <button onClick={() => updateFilter('category', '')} className="hover:opacity-70">
                    <X size={16} />
                  </button>
                </span>
              )}
              {gender && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Gender: {gender}
                  <button onClick={() => updateFilter('gender', '')} className="hover:opacity-70">
                    <X size={16} />
                  </button>
                </span>
              )}
              {brand && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Brand: {brand}
                  <button onClick={() => updateFilter('brand', '')} className="hover:opacity-70">
                    <X size={16} />
                  </button>
                </span>
              )}
              {color && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Color: {color}
                  <button onClick={() => updateFilter('color', '')} className="hover:opacity-70">
                    <X size={16} />
                  </button>
                </span>
              )}
              {size && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Size: {size}
                  <button onClick={() => updateFilter('size', '')} className="hover:opacity-70">
                    <X size={16} />
                  </button>
                </span>
              )}
              {minPrice && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Min: ₹{minPrice}
                  <button onClick={() => updateFilter('minPrice', '')} className="hover:opacity-70">
                    <X size={16} />
                  </button>
                </span>
              )}
              {maxPrice && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Max: ₹{maxPrice}
                  <button onClick={() => updateFilter('maxPrice', '')} className="hover:opacity-70">
                    <X size={16} />
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={clearAllFilters}
              className="text-blue-700 hover:text-blue-900 font-medium text-sm whitespace-nowrap ml-4"
            >
              Clear All
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Gender Filter */}
              <div className="border rounded-lg p-4">
                <button
                  onClick={() => toggleFilter('gender')}
                  className="w-full flex items-center justify-between font-semibold text-gray-900"
                >
                  Gender
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${expandedFilters.gender ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedFilters.gender && (
                  <div className="mt-4 space-y-2">
                    {['MEN', 'WOMEN', 'UNISEX', 'KIDS'].map((genderOption) => (
                      <label key={genderOption} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value={genderOption}
                          checked={gender === genderOption}
                          onChange={() => updateFilter('gender', genderOption)}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700">{genderOption.charAt(0) + genderOption.slice(1).toLowerCase()}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <div className="border rounded-lg p-4">
                <button
                  onClick={() => toggleFilter('category')}
                  className="w-full flex items-center justify-between font-semibold text-gray-900"
                >
                  Category
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${expandedFilters.category ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedFilters.category && (
                  <div className="mt-4 space-y-2">
                    {['RUNNING', 'CASUAL', 'FORMAL', 'SNEAKERS'].map((categoryOption) => (
                      <label key={categoryOption} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={categoryOption}
                          checked={category === categoryOption}
                          onChange={() => updateFilter('category', categoryOption)}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700">{categoryOption.charAt(0) + categoryOption.slice(1).toLowerCase()}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Brand Filter */}
              {filterOptions?.brands && filterOptions.brands.length > 0 && (
                <div className="border rounded-lg p-4">
                  <button
                    onClick={() => toggleFilter('brand')}
                    className="w-full flex items-center justify-between font-semibold text-gray-900"
                  >
                    Brand
                    <ChevronDown
                      size={20}
                      className={`transition-transform ${expandedFilters.brand ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expandedFilters.brand && (
                    <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                      {filterOptions.brands.map((brandOption) => (
                        <label key={brandOption} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="brand"
                            value={brandOption}
                            checked={brand === brandOption}
                            onChange={() => updateFilter('brand', brandOption)}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-700">{brandOption}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Color Filter */}
              {filterOptions?.colors && filterOptions.colors.length > 0 && (
                <div className="border rounded-lg p-4">
                  <button
                    onClick={() => toggleFilter('color')}
                    className="w-full flex items-center justify-between font-semibold text-gray-900"
                  >
                    Color
                    <ChevronDown
                      size={20}
                      className={`transition-transform ${expandedFilters.color ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expandedFilters.color && (
                    <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                      {filterOptions.colors.map((colorOption) => (
                        <label key={colorOption} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            value={colorOption}
                            checked={color === colorOption}
                            onChange={() => updateFilter('color', color === colorOption ? '' : colorOption)}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-700">{colorOption}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Size Filter */}
              {filterOptions?.sizes && filterOptions.sizes.length > 0 && (
                <div className="border rounded-lg p-4">
                  <button
                    onClick={() => toggleFilter('size')}
                    className="w-full flex items-center justify-between font-semibold text-gray-900"
                  >
                    Size
                    <ChevronDown
                      size={20}
                      className={`transition-transform ${expandedFilters.size ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expandedFilters.size && (
                    <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                      {filterOptions.sizes.map((sizeOption) => (
                        <label key={sizeOption} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            value={sizeOption}
                            checked={size === sizeOption}
                            onChange={() => updateFilter('size', size === sizeOption ? '' : sizeOption)}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-700">{sizeOption}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Mobile Filters Modal */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setMobileFiltersOpen(false)}
              />
              {/* Modal */}
              <div className="absolute inset-y-0 left-0 w-80 bg-white overflow-y-auto shadow-xl">
                <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
                  <h2 className="text-lg font-bold">Filters</h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-4 space-y-6">
                  {/* Gender Filter */}
                  <div className="border rounded-lg p-4">
                    <button
                      onClick={() => toggleFilter('gender')}
                      className="w-full flex items-center justify-between font-semibold text-gray-900"
                    >
                      Gender
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${expandedFilters.gender ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {expandedFilters.gender && (
                      <div className="mt-4 space-y-2">
                        {['MEN', 'WOMEN', 'UNISEX', 'KIDS'].map((genderOption) => (
                          <label key={genderOption} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              value={genderOption}
                              checked={gender === genderOption}
                              onChange={() => {
                                updateFilter('gender', genderOption);
                                setMobileFiltersOpen(false);
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-gray-700">{genderOption.charAt(0) + genderOption.slice(1).toLowerCase()}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category Filter */}
                  <div className="border rounded-lg p-4">
                    <button
                      onClick={() => toggleFilter('category')}
                      className="w-full flex items-center justify-between font-semibold text-gray-900"
                    >
                      Category
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${expandedFilters.category ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {expandedFilters.category && (
                      <div className="mt-4 space-y-2">
                        {['RUNNING', 'CASUAL', 'FORMAL', 'SNEAKERS'].map((categoryOption) => (
                          <label key={categoryOption} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="category"
                              value={categoryOption}
                              checked={category === categoryOption}
                              onChange={() => {
                                updateFilter('category', categoryOption);
                                setMobileFiltersOpen(false);
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-gray-700">{categoryOption.charAt(0) + categoryOption.slice(1).toLowerCase()}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Brand Filter */}
                  {filterOptions?.brands && filterOptions.brands.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <button
                        onClick={() => toggleFilter('brand')}
                        className="w-full flex items-center justify-between font-semibold text-gray-900"
                      >
                        Brand
                        <ChevronDown
                          size={20}
                          className={`transition-transform ${expandedFilters.brand ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {expandedFilters.brand && (
                        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                          {filterOptions.brands.map((brandOption) => (
                            <label key={brandOption} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="radio"
                                name="brand"
                                value={brandOption}
                                checked={brand === brandOption}
                                onChange={() => {
                                  updateFilter('brand', brandOption);
                                  setMobileFiltersOpen(false);
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-gray-700">{brandOption}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Color Filter */}
                  {filterOptions?.colors && filterOptions.colors.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <button
                        onClick={() => toggleFilter('color')}
                        className="w-full flex items-center justify-between font-semibold text-gray-900"
                      >
                        Color
                        <ChevronDown
                          size={20}
                          className={`transition-transform ${expandedFilters.color ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {expandedFilters.color && (
                        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                          {filterOptions.colors.map((colorOption) => (
                            <label key={colorOption} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                value={colorOption}
                                checked={color === colorOption}
                                onChange={() => updateFilter('color', color === colorOption ? '' : colorOption)}
                                className="w-4 h-4"
                              />
                              <span className="text-gray-700">{colorOption}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Size Filter */}
                  {filterOptions?.sizes && filterOptions.sizes.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <button
                        onClick={() => toggleFilter('size')}
                        className="w-full flex items-center justify-between font-semibold text-gray-900"
                      >
                        Size
                        <ChevronDown
                          size={20}
                          className={`transition-transform ${expandedFilters.size ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {expandedFilters.size && (
                        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                          {filterOptions.sizes.map((sizeOption) => (
                            <label key={sizeOption} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                value={sizeOption}
                                checked={size === sizeOption}
                                onChange={() => updateFilter('size', size === sizeOption ? '' : sizeOption)}
                                className="w-4 h-4"
                              />
                              <span className="text-gray-700">{sizeOption}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Close Button */}
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-full py-3 bg-[#FF6B6B] text-white font-semibold rounded-lg hover:bg-[#FF5252]"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter size={20} />
                Filters
              </button>

              <div className="ml-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FF6B6B]"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252]"
                >
                  Retry
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">
                  {hasActiveFilters ? 'No products found matching your filters.' : 'No products available.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252]"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isLiked={wishlist.has(product.id)}
                      onToggleLike={() => toggleWishlist(product.id)}
                      onAddToCart={() =>
                        handleAddToCart({
                          variantId: product.variants?.[0]?.id,
                          productId: product.id,
                          price: product.price,
                        })
                      }
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pageCount > 1 && (
                  <div className="flex items-center justify-center gap-2 py-8 border-t">
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('page', Math.max(1, page - 1).toString());
                        router.push(`/products?${params.toString()}`);
                      }}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => {
                            const params = new URLSearchParams(searchParams);
                            params.set('page', p.toString());
                            router.push(`/products?${params.toString()}`);
                          }}
                          className={`w-10 h-10 rounded-lg border ${
                            page === p
                              ? 'bg-[#FF6B6B] text-white border-[#FF6B6B]'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('page', Math.min(pageCount, page + 1).toString());
                        router.push(`/products?${params.toString()}`);
                      }}
                      disabled={page === pageCount}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
