'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Card from '@/components/admin/Card';
import Button from '@/components/admin/Button';
import FormInput from '@/components/admin/FormInput';
import FormSelect from '@/components/admin/FormSelect';
import Alert from '@/components/admin/Alert';
import { productsApi } from '@/lib/adminApi';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    gender: '',
    isActive: '',
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    take: 12,
    total: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.skip]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productsApi.getProducts({
        ...filters,
        search: searchTerm || undefined,
        skip: pagination.skip,
        take: pagination.take,
      });
      setProducts(response.products || []);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.total || 0,
      }));
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to load products',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsApi.deleteProduct(productId);
      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Product deleted successfully',
      });
      fetchProducts();
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete product',
      });
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, skip: 0 }));
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPagination((prev) => ({ ...prev, skip: 0 }));
  };

  const currentPage = Math.floor(pagination.skip / pagination.take) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.take);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <Button
          onClick={() => router.push('/products/new')}
          className="gap-2"
        >
          <Plus size={20} />
          Add Product
        </Button>
      </div>

      {/* Alerts */}
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Filters */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormInput
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            icon={<Search size={18} />}
          />
          <FormSelect
            placeholder="All Categories"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            options={[
              { label: 'Running', value: 'RUNNING' },
              { label: 'Casual', value: 'CASUAL' },
              { label: 'Formal', value: 'FORMAL' },
              { label: 'Sneakers', value: 'SNEAKERS' },
            ]}
            searchable
          />
          <FormSelect
            placeholder="All Genders"
            value={filters.gender}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
            options={[
              { label: 'Men', value: 'MEN' },
              { label: 'Women', value: 'WOMEN' },
              { label: 'Unisex', value: 'UNISEX' },
              { label: 'Kids', value: 'KIDS' },
            ]}
            searchable
          />
          <FormSelect
            placeholder="All Status"
            value={filters.isActive}
            onChange={(e) => handleFilterChange('isActive', e.target.value)}
            options={[
              { label: 'Active', value: 'true' },
              { label: 'Inactive', value: 'false' },
            ]}
          />
        </div>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64 animate-pulse">
              <div className="h-full bg-gray-100 rounded"></div>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your filters or add a new product</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} hover className="flex flex-col">
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                {product.variants && product.variants.length > 0 && product.variants[0].images && product.variants[0].images.length > 0 ? (
                  <img
                    src={product.variants[0].images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={48} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${product.isActive
                        ? 'bg-success-light text-success'
                        : 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-1">{product.category}</p>
                <p className="text-sm text-gray-600 capitalize mb-3">{product.gender}</p>
                <p className="text-xl font-bold text-gray-900 mb-4">
                  ₹{product.variants && product.variants.length > 0 ? Math.min(...product.variants.map(v => parseFloat(v.price) || 0)) : 0}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/products/${product.id}`)}
                  className="flex-1 gap-2"
                >
                  <Edit2 size={16} />
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                  className="gap-2"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {pagination.skip + 1} to {Math.min(pagination.skip + pagination.take, pagination.total)} of{' '}
            {pagination.total} products
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.skip === 0}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  skip: Math.max(0, prev.skip - prev.take),
                }))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  skip: prev.skip + prev.take,
                }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
