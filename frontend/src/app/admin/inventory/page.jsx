'use client';

import { useState, useEffect } from 'react';
import { productsApi } from '@/lib/adminApi';
import { ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [updating, setUpdating] = useState(false);
  const [logType, setLogType] = useState('ADD');
  const [logQuantity, setLogQuantity] = useState('');
  const [logNote, setLogNote] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getProducts({ take: 50 });
      setProducts(data.products);
      setError('');
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSelect = async (variant) => {
    try {
      setLoading(true);
      const [inventoryData, logsData] = await Promise.all([
        productsApi.getInventory(variant.id),
        productsApi.getInventoryLogs(variant.id),
      ]);
      setSelectedVariant(variant);
      setInventory(inventoryData);
      setInventoryLogs(logsData.logs);
      setNewQuantity(inventoryData.quantity?.toString() || '');
      setError('');
    } catch (err) {
      setError('Failed to load inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async () => {
    try {
      if (!newQuantity) {
        setError('Please enter a quantity');
        return;
      }

      setUpdating(true);
      await productsApi.updateInventory(selectedVariant.id, parseInt(newQuantity));
      setInventory(prev => ({ ...prev, quantity: parseInt(newQuantity) }));
      setError('');
    } catch (err) {
      setError('Failed to update inventory');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddLog = async () => {
    try {
      if (!logQuantity) {
        setError('Please enter a quantity');
        return;
      }

      setUpdating(true);
      const logData = {
        type: logType,
        quantity: parseInt(logQuantity),
        note: logNote,
      };

      await productsApi.addInventoryLog(selectedVariant.id, logData);
      
      // Refresh logs
      const logsData = await productsApi.getInventoryLogs(selectedVariant.id);
      setInventoryLogs(logsData.logs);

      setLogQuantity('');
      setLogNote('');
      setError('');
    } catch (err) {
      setError('Failed to add log entry');
    } finally {
      setUpdating(false);
    }
  };

  const allVariants = products.flatMap(p =>
    (p.variants || []).map(v => ({
      ...v,
      productName: p.name,
      productId: p.id,
    }))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Variants List */}
      <div className="lg:col-span-1">
        <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6 space-y-4 sticky top-24">
          <h2 className="text-xl font-bold text-(--text-primary)">Variants</h2>

          <input
            type="text"
            placeholder="Search variants..."
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
          />

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allVariants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => handleVariantSelect(variant)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedVariant?.id === variant.id
                    ? 'bg-(--accent) text-white'
                    : 'hover:bg-gray-100 text-(--text-primary)'
                }`}
              >
                <p className="font-semibold text-sm">{variant.productName}</p>
                <p className="text-xs opacity-75">{variant.size} - {variant.color}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Details */}
      <div className="lg:col-span-2 space-y-6">
        {selectedVariant && inventory ? (
          <>
            {/* Current Inventory */}
            <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-(--text-primary) mb-4">
                  {selectedVariant.productName} - {selectedVariant.size} / {selectedVariant.color}
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                    <p className="text-xs text-blue-600 font-semibold mb-1">CURRENT STOCK</p>
                    <p className="text-4xl font-bold text-blue-700">{inventory.quantity}</p>
                  </div>
                  <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
                    <p className="text-xs text-purple-600 font-semibold mb-1">SKU</p>
                    <p className="text-lg font-bold text-purple-700">{selectedVariant.sku}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-(--text-primary)">
                    Update Quantity
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
                    />
                    <button
                      onClick={handleUpdateQuantity}
                      disabled={updating}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Set
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Log Entry */}
            <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-(--text-primary)">Add Inventory Log</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-(--text-primary) mb-2">
                    Type
                  </label>
                  <select
                    value={logType}
                    onChange={(e) => setLogType(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
                  >
                    <option value="ADD">Add Stock</option>
                    <option value="REMOVE">Remove Stock</option>
                    <option value="ADJUSTMENT">Adjustment</option>
                    <option value="RETURN">Return</option>
                    <option value="RELEASE">Release</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-(--text-primary) mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={logQuantity}
                    onChange={(e) => setLogQuantity(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-(--text-primary) mb-2">
                  Note
                </label>
                <textarea
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  placeholder="Optional note..."
                  rows="2"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-(--accent) focus:outline-none"
                />
              </div>

              <button
                onClick={handleAddLog}
                disabled={updating}
                className="w-full px-6 py-3 bg-(--accent) text-white rounded-lg font-semibold hover:bg-[#FF5252] transition-colors disabled:opacity-50"
              >
                Add Entry
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-(--accent) rounded-2xl">
                {error}
              </div>
            )}

            {/* Inventory Logs */}
            <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-(--text-primary)">Inventory Logs</h3>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {inventoryLogs.length > 0 ? (
                  inventoryLogs.map((log) => {
                    const logTypeIcons = {
                      ADD: <ArrowUp className="text-green-600" size={16} />,
                      REMOVE: <ArrowDown className="text-red-600" size={16} />,
                      ADJUSTMENT: <RotateCcw className="text-blue-600" size={16} />,
                      RETURN: <ArrowUp className="text-purple-600" size={16} />,
                      RELEASE: <ArrowDown className="text-yellow-600" size={16} />,
                    };

                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <div className="pt-1">
                          {logTypeIcons[log.type] || <RotateCcw size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-(--text-primary) text-sm">
                            {log.type} {log.quantity} units
                          </p>
                          {log.note && (
                            <p className="text-xs text-(--text-secondary) mt-1">{log.note}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(log.createdAt).toLocaleDateString()} - {new Date(log.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-(--text-secondary) py-8">No logs yet</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-(--card-bg) border border-gray-200 rounded-2xl p-12 text-center">
            <p className="text-(--text-secondary)">Select a variant to view and manage inventory</p>
          </div>
        )}
      </div>
    </div>
  );
}
