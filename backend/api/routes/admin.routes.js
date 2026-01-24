const express = require('express');
const router = express.Router();
const productController = require('../controller/product.controller');
const orderController = require('../controller/order.controller');
const { verifyAdmin } = require('../middleware/admin.middleware');
const { uploadInMemory } = require('../services/s3.services');

// All routes require admin authentication
router.use(verifyAdmin);

// ======================== PRODUCT ROUTES ========================

// Get all products (with filtering)
router.get('/products', productController.getProducts);

// Create new product
router.post('/products', productController.createProduct);

// Get product by ID
router.get('/products/:productId', productController.getProductById);

// Update product
router.put('/products/:productId', productController.updateProduct);

// Delete product
router.delete('/products/:productId', productController.deleteProduct);

// ======================== PRODUCT IMAGE ROUTES ========================

// Get all images for a variant
router.get('/variants/:variantId/images', productController.getProductImages);

// Add image to variant (with file upload)
router.post('/variants/:variantId/images', uploadInMemory.single('image'), productController.addProductImage);

// Update product image
router.put('/images/:imageId', productController.updateProductImage);

// Delete product image
router.delete('/images/:imageId', productController.deleteProductImage);

// ======================== PRODUCT VARIANT ROUTES ========================

// Get all variants for a product
router.get('/products/:productId/variants', productController.getProductVariants);

// Create variant for product
router.post('/products/:productId/variants', productController.createProductVariant);

// Update variant
router.put('/variants/:variantId', productController.updateProductVariant);

// Delete variant
router.delete('/variants/:variantId', productController.deleteProductVariant);

// ======================== INVENTORY ROUTES ========================

// Get inventory for a variant
router.get('/variants/:variantId/inventory', productController.getInventory);

// Update inventory quantity
router.put('/variants/:variantId/inventory', productController.updateInventory);

// Add inventory log
router.post('/variants/:variantId/inventory-logs', productController.addInventoryLog);

// Get inventory logs for variant
router.get('/variants/:variantId/inventory-logs', productController.getInventoryLogs);

// ======================== ORDER ROUTES ========================

// Get all orders (with filtering)
router.get('/orders', orderController.getOrders);

// Get order by ID
router.get('/orders/:orderId', orderController.getOrderById);

// Get order items
router.get('/orders/:orderId/items', orderController.getOrderItems);

// Update order status
router.put('/orders/:orderId/status', orderController.updateOrderStatus);

// Update payment status
router.put('/orders/:orderId/payment-status', orderController.updatePaymentStatus);

// Cancel order
router.delete('/orders/:orderId', orderController.cancelOrder);

// ======================== ORDER SHIPMENT ROUTES ========================

// Get order shipment
router.get('/orders/:orderId/shipment', orderController.getOrderShipment);

// Create or update shipment
router.put('/orders/:orderId/shipment', orderController.createOrUpdateShipment);

// ======================== ORDER ANALYTICS ROUTES ========================

// Get order analytics
router.get('/analytics/orders', orderController.getOrderAnalytics);

module.exports = router;
