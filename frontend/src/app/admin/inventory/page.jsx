'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import Button from '@/components/admin/Button';
import FormInput from '@/components/admin/FormInput';
import Alert from '@/components/admin/Alert';
import Modal from '@/components/admin/Modal';
import AdminTable from '@/components/admin/AdminTable';
import { productsApi } from '@/lib/adminApi';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [filteredVariants, setFilteredVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({
    quantity: '',
    action: 'ADD',
    reason: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterVariants();
  }, [products, searchTerm]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productsApi.getProducts({
        take: 1000,
      });
      
      // Handle different response structures
      let productsData = [];
      if (Array.isArray(response)) {
        productsData = response;
      } else if (response && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response && Array.isArray(response.products)) {
        productsData = response.products;
      }
      
      console.log('Products loaded:', productsData.length);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to load products',
      });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterVariants = () => {
    const variants = [];
    
    // Ensure products is an array
    if (!Array.isArray(products)) {
      console.warn('Products is not an array:', products);
      setFilteredVariants([]);
      return;
    }
    
    products.forEach((product) => {
      if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach((variant) => {
          if (
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            variant.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
            variant.sku.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            variants.push({
              ...variant,
              productId: product.id,
              productName: product.name,
              productCategory: product.category,
            });
          }
        });
      }
    });
    setFilteredVariants(variants);
  };

  const handleUpdateInventory = async () => {
    if (!inventoryForm.quantity || inventoryForm.quantity <= 0) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Please enter a valid quantity',
      });
      return;
    }

    try {
      setIsSaving(true);

      // Update inventory
      await productsApi.updateInventory(
        selectedVariant.id,
        parseInt(inventoryForm.quantity)
      );

      // Add log entry
      await productsApi.addInventoryLog(selectedVariant.id, {
        action: inventoryForm.action,
        quantity: parseInt(inventoryForm.quantity),
        reason: inventoryForm.reason,
      });

      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Inventory updated successfully',
      });

      setShowInventoryModal(false);
      setInventoryForm({ quantity: '', action: 'ADD', reason: '' });
      fetchProducts();
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to update inventory',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenInventoryModal = (variant) => {
    setSelectedVariant(variant);
    setInventoryForm({ quantity: '', action: 'ADD', reason: '' });
    setShowInventoryModal(true);
  };

  const handleOpenLogsModal = async (variant) => {
    setSelectedVariant(variant);
    try {
      const response = await productsApi.getInventoryLogs(variant.id, 0, 50);
      setInventoryLogs(response.data || []);
      setShowLogsModal(true);
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to load inventory logs',
      });
    }
  };

  const columns = [
    {
      key: 'productName',
      label: 'Product',
      render: (value, row) => (
        <div>
          <p className="font-semibold text-gray-900">{value}</p>
          <p className="text-xs text-gray-600">{row.productCategory}</p>
        </div>
      ),
    },
    {
      key: 'color',
      label: 'Variant',
      render: (value, row) => (
        <div>
          <p className="font-semibold text-gray-900">{value}</p>
          <p className="text-xs text-gray-600">Size: {row.size}</p>
        </div>
      ),
    },
    {
      key: 'sku',
      label: 'SKU',
      render: (value) => <span className="font-mono text-sm text-gray-600">{value}</span>,
    },
    {
      key: 'inventory',
      label: 'Stock',
      render: (value) => {
        const quantity = value?.quantity || 0;
        return (
          <span
            className={`px-2 py-1 rounded-full text-sm font-semibold ${
              quantity > 10
                ? 'bg-green-100 text-green-700'
                : quantity > 0
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {quantity} units
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenInventoryModal(row)}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
          >
            <Edit2 size={14} />
            Update
          </button>
          <button
            onClick={() => handleOpenLogsModal(row)}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
          >
            Logs
          </button>
        </div>
      ),
    },
  ];

  const lowStockVariants = filteredVariants.filter((v) => {
    const qty = v.inventory?.quantity || 0;
    return qty <= 10 && qty > 0;
  });
  const outOfStockVariants = filteredVariants.filter((v) => {
    const qty = v.inventory?.quantity || 0;
    return qty === 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Manage product stock and track inventory changes</p>
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

      {/* Stock Alerts */}
      {outOfStockVariants.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Out of Stock</h3>
            <p className="text-sm text-red-800">
              {outOfStockVariants.length} variant(s) are out of stock
            </p>
          </div>
        </div>
      )}

      {lowStockVariants.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">Low Stock</h3>
            <p className="text-sm text-yellow-800">
              {lowStockVariants.length} variant(s) have low stock levels
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <FormInput
          placeholder="Search by product name, color, or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Inventory Table */}
      <AdminTable
        columns={columns}
        data={filteredVariants}
        isLoading={isLoading}
        emptyMessage="No variants found"
      />

      {/* Inventory Modal */}
      <Modal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
        title={`Update Inventory - ${selectedVariant?.color} Size ${selectedVariant?.size}`}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Current Stock</p>
            <p className="text-2xl font-bold text-gray-900">{selectedVariant?.inventory?.quantity || 0} units</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Action</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'ADD', label: 'Add Stock' },
                { value: 'REDUCE', label: 'Reduce Stock' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setInventoryForm({ ...inventoryForm, action: option.value })
                  }
                  className={`p-3 rounded-lg border-2 font-semibold transition-colors ${
                    inventoryForm.action === option.value
                      ? 'border-red-600 bg-red-50 text-red-600'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <FormInput
            label="Quantity"
            type="number"
            placeholder="Enter quantity"
            min="1"
            value={inventoryForm.quantity}
            onChange={(e) =>
              setInventoryForm({ ...inventoryForm, quantity: e.target.value })
            }
            required
          />

          <FormInput
            label="Reason (Optional)"
            placeholder="e.g., Restock, Damage, Return"
            value={inventoryForm.reason}
            onChange={(e) =>
              setInventoryForm({ ...inventoryForm, reason: e.target.value })
            }
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            <p className="font-semibold mb-2">Updated Stock:</p>
            <p>
              {inventoryForm.action === 'ADD'
                ? `${selectedVariant?.inventory?.quantity || 0} + ${inventoryForm.quantity || 0} = ${
                    (selectedVariant?.inventory?.quantity || 0) + (parseInt(inventoryForm.quantity) || 0)
                  }`
                : `${selectedVariant?.inventory?.quantity || 0} - ${inventoryForm.quantity || 0} = ${
                    (selectedVariant?.inventory?.quantity || 0) - (parseInt(inventoryForm.quantity) || 0)
                  }`}
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowInventoryModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateInventory}
              isLoading={isSaving}
              fullWidth
            >
              Update Inventory
            </Button>
          </div>
        </div>
      </Modal>

      {/* Logs Modal */}
      <Modal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        title={`Inventory Logs - ${selectedVariant?.color} Size ${selectedVariant?.size}`}
        size="lg"
      >
        <div className="space-y-4">
          {inventoryLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryLogs.map((log, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            log.action === 'ADD'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{log.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500">No inventory logs found</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
