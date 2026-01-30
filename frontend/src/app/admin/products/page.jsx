'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/admin/AdminTable';
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
    take: 10,
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
      console.log("Products response:", response);
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

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (value) => <span className="font-mono text-xs text-gray-500">{value.slice(0, 8)}</span>,
    },
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
    },
    {
      key: 'category',
      label: 'Category',
      render: (value) => <span className="text-gray-600">{value}</span>,
    },
    {
      key: 'gender',
      label: 'Gender',
      render: (value) => <span className="capitalize">{value}</span>,
    },
    {
      key: 'price',
      label: 'Price',
      render: (value) => <span className="font-semibold text-gray-900">₹{value}</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/admin/products/${row.id}`)}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

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
          onClick={() => router.push('/admin/products/new')}
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
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
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
      </div>

      {/* Products Table */}
      <AdminTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        emptyMessage="No products found"
      />

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
