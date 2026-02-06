'use client';

import { useState, useEffect } from 'react';
import { Edit2, AlertCircle, Package, Search as SearchIcon } from 'lucide-react';
import Button from '@/components/admin/Button';
import FormInput from '@/components/admin/FormInput';
import Alert from '@/components/admin/Alert';
import Modal from '@/components/admin/Modal';
import Card from '@/components/admin/Card';
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

      let productsData = [];
      if (Array.isArray(response)) {
        productsData = response;
      } else if (response && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response && Array.isArray(response.products)) {
        productsData = response.products;
      }

      setProducts(productsData);
    } catch (error) {
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

    if (!Array.isArray(products)) {
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

      await productsApi.updateInventory(
        selectedVariant.id,
        parseInt(inventoryForm.quantity)
      );

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

  const getStockColor = (quantity) => {
    if (quantity > 10) return 'bg-success-light text-success';
    if (quantity > 0) return 'bg-warning-light text-warning';
    return 'bg-error-light text-error';
  };

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
        <div className="bg-error-light border border-error/30 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-error shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-error">Out of Stock</h3>
            <p className="text-sm text-error/80">
              {outOfStockVariants.length} variant(s) are out of stock
            </p>
          </div>
        </div>
      )}

      {lowStockVariants.length > 0 && (
        <div className="bg-warning-light border border-warning/30 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-warning shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-warning">Low Stock</h3>
            <p className="text-sm text-warning/80">
              {lowStockVariants.length} variant(s) have low stock levels
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <Card>
        <FormInput
          placeholder="Search by product name, color, or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<SearchIcon size={18} />}
        />
      </Card>

      {/* Inventory Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-48 animate-pulse">
              <div className="h-full bg-gray-100 rounded"></div>
            </Card>
          ))}
        </div>
      ) : filteredVariants.length === 0 ? (
        <Card className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No variants found</h3>
          <p className="text-gray-600">Try adjusting your search</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVariants.map((variant) => {
            const quantity = variant.inventory?.quantity || 0;
            return (
              <Card key={variant.id} hover className="flex flex-col">
                {/* Product Info */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {variant.productName}
                  </h3>
                  <p className="text-sm text-gray-600">{variant.productCategory}</p>
                </div>

                {/* Variant Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Color:</span>
                    <span className="font-semibold text-gray-900">{variant.color}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Size:</span>
                    <span className="font-semibold text-gray-900">{variant.size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">SKU:</span>
                    <span className="font-mono text-sm text-gray-900">{variant.sku}</span>
                  </div>
                </div>

                {/* Stock Level */}
                <div className="mb-4">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStockColor(quantity)}`}>
                    {quantity} units
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenInventoryModal(variant)}
                    className="flex-1 gap-2"
                  >
                    <Edit2 size={16} />
                    Update
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenLogsModal(variant)}
                  >
                    Logs
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

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
                  className={`p-3 rounded-lg border-2 font-semibold transition-colors ${inventoryForm.action === option.value
                      ? 'border-primary bg-primary/10 text-primary'
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

          <div className="bg-info-light border border-info/30 rounded-lg p-4 text-sm text-info">
            <p className="font-semibold mb-2">Updated Stock:</p>
            <p>
              {inventoryForm.action === 'ADD'
                ? `${selectedVariant?.inventory?.quantity || 0} + ${inventoryForm.quantity || 0} = ${(selectedVariant?.inventory?.quantity || 0) + (parseInt(inventoryForm.quantity) || 0)
                }`
                : `${selectedVariant?.inventory?.quantity || 0} - ${inventoryForm.quantity || 0} = ${(selectedVariant?.inventory?.quantity || 0) - (parseInt(inventoryForm.quantity) || 0)
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
            <div className="space-y-2">
              {inventoryLogs.map((log, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${log.action === 'ADD'
                        ? 'bg-success-light text-success'
                        : 'bg-error-light text-error'
                      }`}>
                      {log.action}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className="font-semibold text-gray-900">{log.quantity}</span>
                  </div>
                  {log.reason && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold">Reason:</span> {log.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500">No inventory logs found</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
