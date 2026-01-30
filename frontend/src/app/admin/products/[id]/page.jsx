'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Edit2, Trash2, Plus, X, Save, Loader2, Upload, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/admin/Button';
import FormInput from '@/components/admin/FormInput';
import FormSelect from '@/components/admin/FormSelect';
import FormTextarea from '@/components/admin/FormTextarea';
import Alert from '@/components/admin/Alert';
import { productsApi } from '@/lib/adminApi';

const CATEGORIES = [
  { label: 'Running', value: 'RUNNING' },
  { label: 'Casual', value: 'CASUAL' },
  { label: 'Formal', value: 'FORMAL' },
  { label: 'Sneakers', value: 'SNEAKERS' },
];

const GENDERS = [
  { label: 'Men', value: 'MEN' },
  { label: 'Women', value: 'WOMEN' },
  { label: 'Unisex', value: 'UNISEX' },
  { label: 'Kids', value: 'KIDS' },
];

const SHOE_SIZES = ['5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13', '14', '15'];
const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray', 'Brown', 'Navy', 'Beige', 'Silver', 'Gold', 'Purple'];

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showAddVariant, setShowAddVariant] = useState(false);

  // Edit form state
  const [editData, setEditData] = useState({
    name: '',
    brand: '',
    modelNumber: '',
    category: '',
    gender: '',
    description: '',
    shortDescription: '',
    tags: '',
    isActive: true,
    isFeatured: false,
  });

  // New variant form
  const [newVariant, setNewVariant] = useState({
    size: '',
    color: '',
    sku: '',
    price: '',
    compareAtPrice: '',
    quantity: '',
    images: [],
    copyImagesFromVariantId: null
  });

  const [expandedVariant, setExpandedVariant] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await productsApi.getProductById(productId);
      setProduct(response);
      setEditData({
        name: response.name,
        brand: response.brand,
        modelNumber: response.modelNumber || '',
        category: response.category,
        gender: response.gender,
        description: response.description || '',
        shortDescription: response.shortDescription || '',
        tags: (response.tags || []).join(', '),
        isActive: response.isActive,
        isFeatured: response.isFeatured,
      });
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to load product',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProduct = async () => {
    try {
      setIsSaving(true);
      await productsApi.updateProduct(productId, {
        name: editData.name,
        brand: editData.brand,
        modelNumber: editData.modelNumber,
        category: editData.category,
        gender: editData.gender,
        description: editData.description,
        shortDescription: editData.shortDescription,
        tags: editData.tags.split(',').map(t => t.trim()),
        isActive: editData.isActive,
        isFeatured: editData.isFeatured,
      });
      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Product updated successfully',
      });
      setEditMode(false);
      fetchProduct();
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to update product',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      await productsApi.deleteProduct(productId);
      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Product deleted successfully',
      });
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete product',
      });
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm('Delete this variant?')) return;

    try {
      await productsApi.deleteVariant(variantId);
      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Variant deleted successfully',
      });
      fetchProduct();
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete variant',
      });
    }
  };

  const handleAddVariantImages = (files) => {
    if (!files) return;
    const newImages = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewVariant((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const handleRemoveNewImage = (imageId) => {
    setNewVariant((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId)
    }));
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;

    try {
      await productsApi.deleteImage(imageId);
      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Image deleted successfully',
      });
      fetchProduct();
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete image',
      });
    }
  };

  const handleSubmitNewVariant = async () => {
    if (!newVariant.size || !newVariant.color || !newVariant.sku || !newVariant.price) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Please fill all required fields',
      });
      return;
    }

    // Either copy images from existing variant OR upload new images
    if (newVariant.images.length === 0 && !newVariant.copyImagesFromVariantId) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Either upload images or select an existing variant to copy images from',
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Prepare variant data
      const variantData = {
        size: newVariant.size,
        color: newVariant.color,
        sku: newVariant.sku,
        price: newVariant.price,
        compareAtPrice: newVariant.compareAtPrice,
        quantity: newVariant.quantity,
      };

      // If copying images from existing variant, add that ID
      if (newVariant.copyImagesFromVariantId) {
        variantData.copyImagesFromVariantId = newVariant.copyImagesFromVariantId;
        await productsApi.createVariant(productId, variantData);
      } else {
        // Convert files to base64 buffers for transmission
        const convertedImages = [];
        for (const img of newVariant.images) {
          if (img.file) {
            const buffer = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                // Convert to base64
                const base64 = reader.result.split(',')[1];
                resolve(base64);
              };
              reader.onerror = reject;
              reader.readAsDataURL(img.file);
            });
            
            convertedImages.push({
              buffer,
              altText: `${product.name} - ${newVariant.color} image`,
              position: convertedImages.length,
              isPrimary: convertedImages.length === 0
            });
          }
        }

        // Include images in variant creation
        variantData.images = convertedImages;
        await productsApi.createVariant(productId, variantData);
      }

      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Variant added successfully',
      });
      setShowAddVariant(false);
      setNewVariant({
        size: '',
        color: '',
        sku: '',
        price: '',
        compareAtPrice: '',
        quantity: '',
        images: [],
        copyImagesFromVariantId: null
      });
      fetchProduct();
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to add variant',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Alert
          type="error"
          title="Error"
          message="Product not found"
          onClose={() => router.push('/admin/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-1">{product.brand} • {product.category}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!editMode && (
            <>
              <Button
                variant="outline"
                onClick={() => setEditMode(true)}
                className="gap-2"
              >
                <Edit2 size={18} />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteProduct}
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 size={18} />
                Delete
              </Button>
            </>
          )}
          {editMode && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  setEditData({
                    name: product.name,
                    brand: product.brand,
                    modelNumber: product.modelNumber || '',
                    category: product.category,
                    gender: product.gender,
                    description: product.description || '',
                    shortDescription: product.shortDescription || '',
                    tags: (product.tags || []).join(', '),
                    isActive: product.isActive,
                    isFeatured: product.isFeatured,
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProduct}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Product Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Product Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Product Name"
            value={editData.name}
            onChange={(e) => handleEditChange('name', e.target.value)}
            disabled={!editMode}
            required
          />
          <FormInput
            label="Brand"
            value={editData.brand}
            onChange={(e) => handleEditChange('brand', e.target.value)}
            disabled={!editMode}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Model Number"
            value={editData.modelNumber}
            onChange={(e) => handleEditChange('modelNumber', e.target.value)}
            disabled={!editMode}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Category"
              value={editData.category}
              onChange={(e) => handleEditChange('category', e.target.value)}
              options={CATEGORIES}
              disabled={!editMode}
              required
            />
            <FormSelect
              label="Gender"
              value={editData.gender}
              onChange={(e) => handleEditChange('gender', e.target.value)}
              options={GENDERS}
              disabled={!editMode}
              required
            />
          </div>
        </div>

        <FormTextarea
          label="Description"
          value={editData.description}
          onChange={(e) => handleEditChange('description', e.target.value)}
          disabled={!editMode}
          rows={3}
        />

        <FormInput
          label="Short Description"
          value={editData.shortDescription}
          onChange={(e) => handleEditChange('shortDescription', e.target.value)}
          disabled={!editMode}
        />

        <FormInput
          label="Tags"
          value={editData.tags}
          onChange={(e) => handleEditChange('tags', e.target.value)}
          disabled={!editMode}
          placeholder="Comma-separated tags"
        />

        {editMode && (
          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editData.isActive}
                onChange={(e) => handleEditChange('isActive', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editData.isFeatured}
                onChange={(e) => handleEditChange('isFeatured', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Featured</span>
            </label>
          </div>
        )}
      </div>

      {/* Variants */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Variants ({product.variants?.length || 0})</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddVariant(!showAddVariant)}
            className="gap-2"
          >
            <Plus size={16} />
            Add Variant
          </Button>
        </div>

        {/* Add New Variant Form */}
        {showAddVariant && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Create New Variant</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormSelect
                label="Size"
                value={newVariant.size}
                onChange={(e) => setNewVariant((prev) => ({ ...prev, size: e.target.value }))}
                options={SHOE_SIZES.map((s) => ({ label: s, value: s }))}
                required
              />
              <FormSelect
                label="Color"
                value={newVariant.color}
                onChange={(e) => setNewVariant((prev) => ({ ...prev, color: e.target.value }))}
                options={COLORS.map((c) => ({ label: c, value: c }))}
                required
              />
              <FormInput
                label="SKU"
                placeholder="e.g., AM90-BLK-10"
                value={newVariant.sku}
                onChange={(e) => setNewVariant((prev) => ({ ...prev, sku: e.target.value }))}
                required
              />
              <FormInput
                label="Quantity"
                type="number"
                min="0"
                placeholder="0"
                value={newVariant.quantity}
                onChange={(e) => setNewVariant((prev) => ({ ...prev, quantity: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={newVariant.price}
                onChange={(e) => setNewVariant((prev) => ({ ...prev, price: e.target.value }))}
                required
              />
              <FormInput
                label="Compare at Price (Optional)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={newVariant.compareAtPrice}
                onChange={(e) => setNewVariant((prev) => ({ ...prev, compareAtPrice: e.target.value }))}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Images</span>
                <span className="text-red-500 ml-1">*</span>
              </label>

              {/* Copy from existing variant option */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-900">Copy from existing variant</p>
                {product.variants && product.variants.length > 0 ? (
                  <select
                    value={newVariant.copyImagesFromVariantId || ''}
                    onChange={(e) =>
                      setNewVariant((prev) => ({
                        ...prev,
                        copyImagesFromVariantId: e.target.value || null,
                        images: e.target.value ? [] : prev.images,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select a variant to copy images from --</option>
                    {product.variants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.color} • Size {variant.size} {variant.images && variant.images.length > 0 ? `(${variant.images.length} images)` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-600">No existing variants to copy from</p>
                )}
              </div>

              {!newVariant.copyImagesFromVariantId && (
                <>
                  <p className="text-sm text-gray-600 text-center py-2">OR</p>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleAddVariantImages(e.target.files)}
                      className="hidden"
                      id="new_variant_images"
                    />
                    <label htmlFor="new_variant_images" className="cursor-pointer">
                      <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                      </p>
                    </label>
                  </div>

                  {newVariant.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {newVariant.images.map((image) => (
                        <div
                          key={image.id}
                          className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
                        >
                          <img
                            src={image.preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(image.id)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity"
                          >
                            <X size={24} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {newVariant.copyImagesFromVariantId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-900">
                    ✓ Images will be copied from the selected variant
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddVariant(false);
                  setNewVariant({
                    size: '',
                    color: '',
                    sku: '',
                    price: '',
                    compareAtPrice: '',
                    quantity: '',
                    images: [],
                    copyImagesFromVariantId: null
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitNewVariant}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Variant
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Variants List */}
        <div className="space-y-4">
          {product.variants && product.variants.length > 0 ? (
            product.variants.map((variant) => (
              <div
                key={variant.id}
                className="border border-gray-200 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandedVariant(expandedVariant === variant.id ? null : variant.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {expandedVariant === variant.id ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {variant.color} • Size {variant.size}
                      </h3>
                      <p className="text-sm text-gray-500">SKU: {variant.sku}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteVariant(variant.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {expandedVariant === variant.id && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Price</p>
                        <p className="font-bold text-gray-900">₹{parseFloat(variant.price).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Compare Price</p>
                        <p className="font-bold text-gray-900">
                          {variant.compareAtPrice ? `₹${parseFloat(variant.compareAtPrice).toFixed(2)}` : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Stock</p>
                        <p className="font-bold text-gray-900">{variant.inventory?.quantity || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Status</p>
                        <p className="font-bold text-gray-900">
                          {variant.isAvailable ? '✅ Available' : '❌ Unavailable'}
                        </p>
                      </div>
                    </div>

                    {/* Images */}
                    {variant.images && variant.images.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Images ({variant.images.length})</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {variant.images.map((image) => (
                            <div
                              key={image.id}
                              className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
                            >
                              <img
                                src={image.url}
                                alt={image.altText}
                                className="w-full h-full object-cover"
                              />
                              {image.isPrimary && (
                                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                                  Primary
                                </div>
                              )}
                              <button
                                onClick={() => handleDeleteImage(image.id)}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity"
                              >
                                <X size={24} className="text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No variants added yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
