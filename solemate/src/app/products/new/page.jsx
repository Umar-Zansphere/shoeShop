'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, X, Upload, Loader2 } from 'lucide-react';
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

export default function CreateProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Product form state
  const [productData, setProductData] = useState({
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

  // Variants state
  const [variants, setVariants] = useState([
    { id: Date.now(), size: '', color: '', sku: '', price: '', compareAtPrice: '', quantity: '', images: [] }
  ]);

  const handleProductChange = (field, value) => {
    setProductData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVariantChange = (variantId, field, value) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, [field]: value } : v))
    );
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { id: Date.now(), size: '', color: '', sku: '', price: '', compareAtPrice: '', quantity: '', images: [] }
    ]);
  };

  const removeVariant = (variantId) => {
    if (variants.length === 1) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'At least one variant is required',
      });
      return;
    }
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
  };

  const handleImageUpload = (variantId, files) => {
    if (!files) return;

    setVariants((prev) =>
      prev.map((v) => {
        if (v.id === variantId) {
          const newImages = Array.from(files).map((file) => ({
            id: Date.now() + Math.random(),
            file,
            preview: URL.createObjectURL(file),
            altText: '',
          }));
          return { ...v, images: [...v.images, ...newImages] };
        }
        return v;
      })
    );
  };

  const removeImage = (variantId, imageId) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id === variantId) {
          return { ...v, images: v.images.filter((img) => img.id !== imageId) };
        }
        return v;
      })
    );
  };

  const validateForm = () => {
    // Validate product data
    if (!productData.name?.trim()) {
      setAlert({ type: 'error', title: 'Error', message: 'Product name is required' });
      return false;
    }
    if (!productData.brand?.trim()) {
      setAlert({ type: 'error', title: 'Error', message: 'Brand is required' });
      return false;
    }
    if (!productData.category) {
      setAlert({ type: 'error', title: 'Error', message: 'Category is required' });
      return false;
    }
    if (!productData.gender) {
      setAlert({ type: 'error', title: 'Error', message: 'Gender is required' });
      return false;
    }

    // Validate variants
    if (variants.length === 0) {
      setAlert({ type: 'error', title: 'Error', message: 'At least one variant is required' });
      return false;
    }

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.size?.trim()) {
        setAlert({ type: 'error', title: 'Error', message: `Variant ${i + 1}: Size is required` });
        return false;
      }
      if (!v.color?.trim()) {
        setAlert({ type: 'error', title: 'Error', message: `Variant ${i + 1}: Color is required` });
        return false;
      }
      if (!v.sku?.trim()) {
        setAlert({ type: 'error', title: 'Error', message: `Variant ${i + 1}: SKU is required` });
        return false;
      }
      if (!v.price || parseFloat(v.price) <= 0) {
        setAlert({ type: 'error', title: 'Error', message: `Variant ${i + 1}: Valid price is required` });
        return false;
      }
      if (!v.images || v.images.length === 0) {
        setAlert({ type: 'error', title: 'Error', message: `Variant ${i + 1}: At least one image is required` });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add product fields
      formData.append('name', productData.name);
      formData.append('brand', productData.brand);
      formData.append('modelNumber', productData.modelNumber);
      formData.append('category', productData.category);
      formData.append('gender', productData.gender);
      formData.append('description', productData.description);
      formData.append('shortDescription', productData.shortDescription);
      formData.append('tags', productData.tags);
      formData.append('isActive', productData.isActive);
      formData.append('isFeatured', productData.isFeatured);

      // Add variants as JSON
      const variantData = variants.map((v) => ({
        size: v.size,
        color: v.color,
        sku: v.sku,
        price: v.price,
        compareAtPrice: v.compareAtPrice || null,
        quantity: v.quantity || 0,
      }));
      formData.append('variants', JSON.stringify(variantData));

      // Add image files
      variants.forEach((v, variantIndex) => {
        v.images.forEach((img) => {
          if (img.file) {
            formData.append(`images_${variantIndex}`, img.file);
          }
        });
      });

      console.log('Submitting form data...');
      const response = await productsApi.createProduct(formData);
      console.log('Response:', response);

      if (response.message) {
        setAlert({
          type: 'success',
          title: 'Success',
          message: response.message || 'Product created successfully',
        });

        setTimeout(() => {
          router.push('/products');
        }, 1500);
      } else {
        throw new Error(response.error?.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error:', error);
      setAlert({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create product',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Product</h1>
          <p className="text-gray-600 mt-1">Add a new product with variants and images</p>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Product Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Product Name"
              placeholder="e.g., Air Max 90"
              value={productData.name}
              onChange={(e) => handleProductChange('name', e.target.value)}
              required
            />
            <FormInput
              label="Brand"
              placeholder="e.g., Nike"
              value={productData.brand}
              onChange={(e) => handleProductChange('brand', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Model Number"
              placeholder="e.g., AM90-2024"
              value={productData.modelNumber}
              onChange={(e) => handleProductChange('modelNumber', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Category"
                value={productData.category}
                onChange={(e) => handleProductChange('category', e.target.value)}
                options={CATEGORIES}
                required
              />
              <FormSelect
                label="Gender"
                value={productData.gender}
                onChange={(e) => handleProductChange('gender', e.target.value)}
                options={GENDERS}
                required
              />
            </div>
          </div>

          <FormTextarea
            label="Description"
            placeholder="Detailed product description..."
            value={productData.description}
            onChange={(e) => handleProductChange('description', e.target.value)}
            rows={3}
          />

          <FormInput
            label="Short Description"
            placeholder="Brief product description"
            value={productData.shortDescription}
            onChange={(e) => handleProductChange('shortDescription', e.target.value)}
          />

          <FormInput
            label="Tags"
            placeholder="Comma-separated tags (e.g., running, lightweight, comfort)"
            value={productData.tags}
            onChange={(e) => handleProductChange('tags', e.target.value)}
          />

          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={productData.isActive}
                onChange={(e) => handleProductChange('isActive', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={productData.isFeatured}
                onChange={(e) => handleProductChange('isFeatured', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Featured</span>
            </label>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Variants</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addVariant}
              className="gap-2"
            >
              <Plus size={16} />
              Add Variant
            </Button>
          </div>

          <div className="space-y-6">
            {variants.map((variant, index) => (
              <div
                key={variant.id}
                className="border border-gray-200 rounded-lg p-4 space-y-4 relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Variant {index + 1}</h3>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(variant.id)}
                      className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormSelect
                    label="Size"
                    value={variant.size}
                    onChange={(e) => handleVariantChange(variant.id, 'size', e.target.value)}
                    options={SHOE_SIZES.map((s) => ({ label: s, value: s }))}
                    required
                  />
                  <FormSelect
                    label="Color"
                    value={variant.color}
                    onChange={(e) => handleVariantChange(variant.id, 'color', e.target.value)}
                    options={COLORS.map((c) => ({ label: c, value: c }))}
                    required
                  />
                  <FormInput
                    label="SKU"
                    placeholder="e.g., AM90-BLK-10"
                    value={variant.sku}
                    onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)}
                    required
                  />
                  <FormInput
                    label="Quantity"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={variant.quantity}
                    onChange={(e) => handleVariantChange(variant.id, 'quantity', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={variant.price}
                    onChange={(e) => handleVariantChange(variant.id, 'price', e.target.value)}
                    required
                  />
                  <FormInput
                    label="Compare at Price (Optional)"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={variant.compareAtPrice}
                    onChange={(e) => handleVariantChange(variant.id, 'compareAtPrice', e.target.value)}
                  />
                </div>

                {/* Images Section */}
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Images</span>
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  {/* Image Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(variant.id, e.target.files)}
                      className="hidden"
                      id={`images_${variant.id}`}
                    />
                    <label htmlFor={`images_${variant.id}`} className="cursor-pointer">
                      <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </label>
                  </div>

                  {/* Uploaded Images */}
                  {variant.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {variant.images.map((image) => (
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
                            onClick={() => removeImage(variant.id, image.id)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity"
                          >
                            <X size={24} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end sticky bottom-0 bg-white py-4 border-t border-gray-200 z-50 shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={20} />
                Create Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
