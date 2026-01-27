'use client';

import { useState, useEffect } from 'react';
import { productsApi } from '@/lib/adminApi';
import Link from 'next/link';
import { Plus, Trash2, Edit, Eye } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    gender: '',
    skip: 0,
    take: 10,
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getProducts(filters);
      setProducts(data.products);
      setPagination(data.pagination);
      setError('');
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await productsApi.deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, skip: 0 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-(--text-primary)">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-6 py-3 bg-(--accent) text-white rounded-lg font-semibold hover:bg-[#FF5252] transition-colors"
        >
          <Plus size={20} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-(--text-primary) mb-2">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name or brand..."
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-(--text-primary) mb-2">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="RUNNING">Running</option>
              <option value="CASUAL">Casual</option>
              <option value="SPORTS">Sports</option>
              <option value="FORMAL">Formal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-(--text-primary) mb-2">Gender</label>
            <select
              name="gender"
              value={filters.gender}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
            >
              <option value="">All Genders</option>
              <option value="MEN">Men</option>
              <option value="WOMEN">Women</option>
              <option value="KIDS">Kids</option>
              <option value="UNISEX">Unisex</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-(--accent) rounded-2xl">
          {error}
        </div>
      )}

      {/* Products Table */}
      {!loading && (
        <div className="bg-(--card-bg) border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-(--text-primary)">Product</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-(--text-primary)">Brand</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-(--text-primary)">Category</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-(--text-primary)">Gender</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-(--text-primary)">Variants</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-(--text-primary)">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-(--text-primary)">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-(--text-primary) font-medium">{product.name}</td>
                    <td className="py-4 px-6 text-(--text-secondary)">{product.brand}</td>
                    <td className="py-4 px-6 text-(--text-secondary)">{product.category}</td>
                    <td className="py-4 px-6 text-(--text-secondary)">{product.gender}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {product.variants?.length || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-(--text-secondary)">
              Showing {filters.skip + 1} to {Math.min(filters.skip + filters.take, pagination.total)} of {pagination.total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, skip: Math.max(0, prev.skip - prev.take) }))}
                disabled={filters.skip === 0}
                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, skip: prev.skip + prev.take }))}
                disabled={filters.skip + filters.take >= pagination.total}
                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-(--accent) border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-(--text-primary)">Delete Product?</h3>
            <p className="text-(--text-secondary)">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
