# Admin Panel Documentation

A comprehensive admin panel for managing the SoleMate shoe shop. Built with Next.js, React, and Tailwind CSS with a focus on UX and performance.

## Features

### 📦 Product Management
- **List Products**: View all products with search and filtering capabilities
- **Add/Edit Products**: Create and modify product details
- **Variant Management**: Add and manage product variants (colors, sizes)
- **Image Management**: Upload and organize product images for each variant
- **Status Management**: Activate/deactivate products

### 📋 Order Management
- **Order Listing**: View all orders with status filtering and search
- **Order Details**: Detailed view of individual orders with:
  - Order items with images
  - Customer information
  - Delivery address
  - Order summary and totals
- **Status Updates**: Change order status (PENDING → PROCESSING → SHIPPED → DELIVERED)
- **Payment Status**: Track payment status (PENDING, COMPLETED, FAILED, REFUNDED)
- **Shipment Tracking**: Add and manage shipment information with tracking numbers

### 📊 Analytics Dashboard
- **Key Metrics**: 
  - Total orders
  - Total revenue
  - Orders shipped
  - Average order value
- **Order Status Distribution**: Visual representation of orders by status
- **Payment Status Distribution**: Payment completion tracking
- **Customer Insights**: Customer count, repeat customers, average orders per customer
- **Top Products**: Best-selling products with revenue data
- **Date Range Filtering**: Analyze data for specific periods

### 📦 Inventory Management
- **Stock Tracking**: Real-time inventory status for all variants
- **Stock Alerts**: Visual warnings for low stock and out-of-stock items
- **Inventory Updates**: Add or reduce stock with reasons
- **Inventory Logs**: Complete audit trail of all stock changes
- **Search and Filter**: Find variants by product name, color, or SKU

### 🎨 Admin Dashboard
- **Quick Stats**: Overview of key metrics
- **Recent Orders**: Latest orders at a glance
- **Quick Actions**: Fast access to common tasks
- **Order Status Summary**: Visual breakdown of order statuses

## Architecture

### Pages Structure
```
/admin
  ├── page.jsx                    # Dashboard
  ├── /products
  │   ├── page.jsx                # Products list
  │   └── /[id]
  │       └── page.jsx            # Add/Edit product
  ├── /orders
  │   ├── page.jsx                # Orders list
  │   └── /[id]
  │       └── page.jsx            # Order details
  ├── /analytics
  │   └── page.jsx                # Analytics dashboard
  ├── /inventory
  │   └── page.jsx                # Inventory management
  └── layout.jsx                  # Admin layout with sidebar
```

### Components
Located in `/src/components/admin/`:

- **AdminTable.jsx**: Reusable data table with sorting and pagination
- **Modal.jsx**: Flexible modal component with different sizes
- **Button.jsx**: Styled button with variants (primary, secondary, outline, danger, ghost)
- **FormInput.jsx**: Input field with validation and error display
- **FormSelect.jsx**: Select dropdown with options
- **FormTextarea.jsx**: Text area for longer content
- **Alert.jsx**: Notification component (info, success, warning, error)

### Design System

#### Colors (from globals.css)
- **Accent Color**: #FF6B6B (red)
- **Background**: #FAFAF8
- **Text Primary**: #1F2937 (gray-900)
- **Text Secondary**: #9CA3AF (gray-500)
- **Sidebar**: #1E293B

#### Status Colors
- **Pending**: Yellow (#FCD34D)
- **Processing**: Blue (#3B82F6)
- **Shipped**: Cyan (#06B6D4)
- **Delivered**: Green (#10B981)
- **Cancelled**: Red (#EF4444)

## API Integration

The admin panel uses the `adminApi` client from `/src/lib/adminApi.js` which includes:

### Products API
```javascript
productsApi.getProducts(filters)
productsApi.createProduct(data)
productsApi.getProductById(id)
productsApi.updateProduct(id, data)
productsApi.deleteProduct(id)
```

### Variants API
```javascript
productsApi.getVariants(productId)
productsApi.createVariant(productId, data)
productsApi.updateVariant(variantId, data)
productsApi.deleteVariant(variantId)
```

### Images API
```javascript
productsApi.getImages(variantId)
productsApi.addImage(variantId, formData)
productsApi.updateImage(imageId, data)
productsApi.deleteImage(imageId)
```

### Orders API
```javascript
ordersApi.getOrders(filters)
ordersApi.getOrderById(id)
ordersApi.getOrderItems(id)
ordersApi.updateOrderStatus(id, status)
ordersApi.updatePaymentStatus(id, status)
ordersApi.cancelOrder(id, reason)
ordersApi.getShipment(id)
ordersApi.createOrUpdateShipment(id, data)
```

### Inventory API
```javascript
productsApi.getInventory(variantId)
productsApi.updateInventory(variantId, quantity)
productsApi.getInventoryLogs(variantId, skip, take)
productsApi.addInventoryLog(variantId, data)
```

### Analytics API
```javascript
ordersApi.getAnalytics(filters)
```

## User Experience Features

### 1. **Responsive Design**
- Works seamlessly on desktop, tablet, and mobile
- Collapsible sidebar on smaller screens
- Adaptive grid layouts

### 2. **Intuitive Navigation**
- Clear sidebar with categorized menu items
- Breadcrumb-like navigation with back buttons
- Quick action buttons for common tasks

### 3. **Data Visualization**
- Color-coded status badges
- Progress bars for inventory levels
- Card-based layouts for better information hierarchy

### 4. **Performance**
- Pagination for large datasets
- Lazy loading of images
- Optimized API calls

### 5. **User Feedback**
- Loading spinners for async operations
- Success/error alerts with descriptive messages
- Form validation with inline error messages
- Confirmation dialogs for destructive actions

### 6. **Accessibility**
- Semantic HTML structure
- Proper ARIA labels
- Keyboard navigation support
- High contrast colors

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running on configured URL

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure API endpoint in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000/admin](http://localhost:3000/admin)

## Key Features Highlights

### Product Management Workflow
1. Click "Add Product" on products page
2. Fill in basic product details
3. Click "Create Product"
4. Add variants (color + size combinations)
5. Upload images for each variant
6. Manage inventory stock levels

### Order Management Workflow
1. View all orders on orders page
2. Click on an order to view details
3. Update order status as it progresses
4. Update payment status
5. Add shipping/tracking information
6. View order items and customer details

### Inventory Management Workflow
1. Search for products/variants
2. View current stock levels
3. Click "Update" to add/reduce stock
4. Add reason for inventory change
5. View complete inventory audit logs

### Analytics Workflow
1. Select date range (default: last 30 days)
2. View key metrics and trends
3. Analyze order and payment status distribution
4. Track top-performing products
5. Monitor customer acquisition and repeat rates

## Styling Guidelines

All components follow the design system from `globals.css`:

### Colors
```css
--accent: #FF6B6B (primary red)
--text-primary: #1F2937 (dark gray)
--text-secondary: #9CA3AF (light gray)
--background: #FAFAF8 (off-white)
```

### Transitions
- Fast: 200ms (hover effects)
- Base: 300ms (general transitions)
- Slow: 500ms (complex animations)

### Shadows
- Shadow-sm: Subtle
- Shadow-md: Standard (default)
- Shadow-lg: Prominent
- Shadow-accent: Accent color shadow

## Common Patterns

### Status Badges
```jsx
<span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
  {status}
</span>
```

### Button Variants
```jsx
<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="outline">View</Button>
<Button variant="danger">Delete</Button>
<Button variant="ghost">Link</Button>
```

### Form Fields with Validation
```jsx
<FormInput
  label="Product Name"
  required
  value={name}
  onChange={(e) => setName(e.target.value)}
  error={errors.name}
/>
```

## Performance Optimization

1. **Image Optimization**: Use Next.js Image component for product images
2. **Lazy Loading**: Implement lazy loading for inventory tables
3. **Memoization**: Use React.memo for table rows and cards
4. **Pagination**: Limit API results with pagination
5. **Caching**: Leverage browser caching for static assets

## Future Enhancements

- [ ] Advanced analytics with charts (Chart.js/Recharts)
- [ ] Bulk product import/export (CSV)
- [ ] Discount and promotion management
- [ ] Customer communication (emails, SMS)
- [ ] Advanced reporting and export functionality
- [ ] Role-based access control (permissions)
- [ ] Activity logs and audit trails
- [ ] Product recommendations engine
- [ ] Inventory forecasting
- [ ] Multi-currency support

## Troubleshooting

### Orders not loading
- Check if backend API is running
- Verify API URL in environment variables
- Check browser console for CORS errors

### Images not uploading
- Ensure file size is within limits
- Check S3/storage service configuration
- Verify file format (JPG, PNG, GIF, WebP)

### Styles not applying
- Clear Next.js cache: `rm -rf .next`
- Rebuild Tailwind CSS: `npm run build`
- Restart development server

## Support

For issues or feature requests, contact the development team or create an issue in the project repository.
