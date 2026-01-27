'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { productsApi } from '@/lib/adminApi';
import { ArrowLeft, Plus, X, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.productId;
  const isNew = productId === 'new';

  const [product, setProduct] = useState({
    name: '',
    brand: '',
    modelNumber: '',
    category: '',
    gender: '',
    description: '',
    shortDescription: '',
    tags: [],
    isActive: true,
    isFeatured: false,
  });

  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [newVariant, setNewVariant] = useState({
    size: '',
    color: '',
    sku: '',
    price: '',
    compareAtPrice: '',
    quantity: '',
  });

  useEffect(() => {
    if (!isNew && productId) {
      fetchProduct();
    }
  }, [productId, isNew]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getProductById(productId);
      setProduct(data);
      setVariants(data.variants || []);
    } catch (err) {
      setError('Failed to load product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddVariant = async () => {
    try {
      if (!newVariant.size || !newVariant.color || !newVariant.sku || !newVariant.price) {
        setError('Please fill in all required variant fields');
        return;
      }

      if (!productId || isNew) {
        setError('Please save the product first before adding variants');
        return;
      }

      const variantData = {
        size: newVariant.size,
        color: newVariant.color,
        sku: newVariant.sku,
        price: parseFloat(newVariant.price),
        compareAtPrice: newVariant.compareAtPrice ? parseFloat(newVariant.compareAtPrice) : undefined,
        quantity: newVariant.quantity ? parseInt(newVariant.quantity) : 0,
      };

      const response = await productsApi.createVariant(productId, variantData);
      setVariants([...variants, response.variant]);
      setNewVariant({
        size: '',
        color: '',
        sku: '',
        price: '',
        compareAtPrice: '',
        quantity: '',
      });
      setShowVariantForm(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to add variant');
    }
  };

  const handleDeleteVariant = async (variantId) => {
    try {
      await productsApi.deleteVariant(variantId);
      setVariants(variants.filter(v => v.id !== variantId));
    } catch (err) {
      setError('Failed to delete variant');
    }
  };

  const handleSaveProduct = async () => {
    try {
      setSaving(true);
      setError('');

      if (!product.name || !product.brand || !product.category || !product.gender) {
        setError('Please fill in all required fields');
        setSaving(false);
        return;
      }

      if (isNew) {
        const response = await productsApi.createProduct(product);
        router.push(`/admin/products/${response.product.id}`);
      } else {
        await productsApi.updateProduct(productId, product);
      }
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-(--accent) border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-(--text-primary)">
            {isNew ? 'Add New Product' : 'Edit Product'}
          </h1>
        </div>
        <button
          onClick={handleSaveProduct}
          disabled={saving}
          className="px-6 py-3 bg-(--accent) text-white rounded-lg font-semibold hover:bg-[#FF5252] transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-(--accent) rounded-2xl">
          {error}
        </div>
      )}

      {/* Product Details */}
      <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-(--text-primary)">Product Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-(--text-primary) mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleInputChange}
              placeholder="e.g., Nike Air Max"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-(--text-primary) mb-2">
              Brand *
            </label>
            <input
              type="text"
              name="brand"
              value={product.brand}
              onChange={handleInputChange}
              placeholder="e.g., Nike"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-(--text-primary) mb-2">
              Model Number
            </label>
            <input
              type="text"
              name="modelNumber"
              value={product.modelNumber}
              onChange={handleInputChange}
              placeholder="e.g., AM90"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-(--text-primary) mb-2">
              Category *
            </label>
            <select
              name="category"
              value={product.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
            >
              <option value="">Select Category</option>
              <option value="RUNNING">Running</option>
              <option value="CASUAL">Casual</option>
              <option value="SPORTS">Sports</option>
              <option value="FORMAL">Formal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-(--text-primary) mb-2">
              Gender *
            </label>
            <select
              name="gender"
              value={product.gender}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
            >
              <option value="">Select Gender</option>
              <option value="MEN">Men</option>
              <option value="WOMEN">Women</option>
              <option value="KIDS">Kids</option>
              <option value="UNISEX">Unisex</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-(--text-primary) mb-2">
            Short Description
          </label>
          <textarea
            name="shortDescription"
            value={product.shortDescription}
            onChange={handleInputChange}
            rows="2"
            placeholder="Brief description shown on listings..."
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-(--text-primary) mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleInputChange}
            rows="4"
            placeholder="Detailed product description..."
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
          />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={product.isActive}
              onChange={handleInputChange}
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold text-(--text-primary)">Active</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isFeatured"
              checked={product.isFeatured}
              onChange={handleInputChange}
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold text-(--text-primary)">Featured</span>
          </label>
        </div>
      </div>

      {/* Variants Section */}
      {!isNew && (
        <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-(--text-primary)">Product Variants</h2>
            <button
              onClick={() => setShowVariantForm(!showVariantForm)}
              className="flex items-center gap-2 px-4 py-2 bg-(--accent) text-white rounded-lg font-semibold hover:bg-[#FF5252] transition-colors"
            >
              <Plus size={18} />
              Add Variant
            </button>
          </div>

          {/* Add Variant Form */}
          {showVariantForm && (
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Size (e.g., 8, 9, 10)"
                  value={newVariant.size}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, size: e.target.value }))}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Color"
                  value={newVariant.color}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, color: e.target.value }))}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="SKU"
                  value={newVariant.sku}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newVariant.price}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, price: e.target.value }))}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Compare at Price (optional)"
                  value={newVariant.compareAtPrice}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, compareAtPrice: e.target.value }))}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={newVariant.quantity}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, quantity: e.target.value }))}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddVariant}
                  className="px-6 py-2 bg-(--accent) text-white rounded-lg font-semibold hover:bg-[#FF5252] transition-colors"
                >
                  Add Variant
                </button>
                <button
                  onClick={() => setShowVariantForm(false)}
                  className="px-6 py-2 border-2 border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Variants List */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4">Size</th>
                  <th className="text-left py-3 px-4">Color</th>
                  <th className="text-left py-3 px-4">SKU</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Stock</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr key={variant.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{variant.size}</td>
                    <td className="py-3 px-4">{variant.color}</td>
                    <td className="py-3 px-4">{variant.sku}</td>
                    <td className="py-3 px-4">${variant.price.toFixed(2)}</td>
                    <td className="py-3 px-4">{variant.inventory?.quantity || 0}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteVariant(variant.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {variants.length === 0 && (
            <div className="text-center py-8">
              <p className="text-(--text-secondary)">No variants yet. Add one to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
