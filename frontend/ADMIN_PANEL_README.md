# Admin Panel Documentation

## Overview

A fully-featured admin dashboard for managing products, orders, inventory, and analytics for the SoleMate shoe shop.

## Features

### 1. **Dashboard** (`/admin`)
- Real-time order analytics
- Revenue tracking
- Order status breakdown
- Payment status breakdown
- Top-performing products
- Date range filtering

### 2. **Products Management** (`/admin/products`)
- View all products with pagination
- Create new products
- Edit product details
- Delete products
- Filter by category, gender, or search
- Product variants management
- Quick inventory view

### 3. **Product Editor** (`/admin/products/[productId]`)
- Complete product information editor
- Product name, brand, category, gender
- Product descriptions
- Feature toggle (Active/Featured)
- Add product variants
- Variant details (size, color, SKU, price)
- Delete variants

### 4. **Inventory Management** (`/admin/inventory`)
- Variant-based inventory tracking
- Real-time stock quantity updates
- Inventory activity logs
- Log entry types:
  - ADD: Add stock
  - REMOVE: Remove stock
  - ADJUSTMENT: Stock adjustment
  - RETURN: Customer return
  - RELEASE: Order cancellation release
- Search variants across all products

### 5. **Orders Management** (`/admin/orders`)
- View all orders with pagination
- Filter by status, payment status, or search
- Order summary with totals
- Quick order status overview
- Payment status indicators
- Direct links to order details

### 6. **Order Details** (`/admin/orders/[orderId]`)
- Complete order information
- Customer details and contact info
- Order items with product details
- Order summary (subtotal, tax, shipping, total)
- **Order Status Management**
  - Update status (PENDING → PAID → SHIPPED → DELIVERED)
  - Cancel orders
  - Status validation

- **Payment Status Management**
  - Track payment progress
  - Update payment status (PENDING → SUCCESS/FAILED)

- **Shipment Management**
  - Add/edit shipment details
  - Courier information
  - Tracking number and URL
  - Shipment status tracking

### 7. **Analytics** (`/admin/analytics`)
- Comprehensive analytics dashboard
- Key metrics:
  - Total orders
  - Total revenue
  - Average order value
  - Success rate
- Order status distribution with percentages
- Payment status distribution
- Top-performing products by revenue
- Date range filtering

## API Integration

The admin panel is fully integrated with the backend APIs:

### Products API
- `GET /admin/products` - List products with filters
- `POST /admin/products` - Create product
- `GET /admin/products/:id` - Get product details
- `PUT /admin/products/:id` - Update product
- `DELETE /admin/products/:id` - Delete product

### Variants API
- `POST /admin/products/:productId/variants` - Create variant
- `PUT /admin/variants/:variantId` - Update variant
- `DELETE /admin/variants/:variantId` - Delete variant

### Inventory API
- `GET /admin/variants/:variantId/inventory` - Get inventory
- `PUT /admin/variants/:variantId/inventory` - Update quantity
- `POST /admin/variants/:variantId/inventory-logs` - Add log entry
- `GET /admin/variants/:variantId/inventory-logs` - Get logs

### Orders API
- `GET /admin/orders` - List orders with filters
- `GET /admin/orders/:id` - Get order details
- `PUT /admin/orders/:id/status` - Update order status
- `PUT /admin/orders/:id/payment-status` - Update payment status
- `DELETE /admin/orders/:id` - Cancel order
- `GET /admin/orders/:id/shipment` - Get shipment info
- `PUT /admin/orders/:id/shipment` - Create/update shipment

### Analytics API
- `GET /admin/analytics/orders` - Get analytics with optional date range

## Authentication

- Admin routes require admin role verification
- Automatic redirect to login if not authenticated
- Token-based authentication via `accessToken` in localStorage

## Styling

- Built with Tailwind CSS
- Custom CSS variables for consistency
- Responsive design for all screen sizes
- Dark sidebar with white content areas
- Accent color: #FF6B6B (red)

## Folder Structure

```
src/app/admin/
├── layout.jsx              # Admin layout with sidebar
├── page.jsx                # Dashboard
├── products/
│   ├── page.jsx           # Products list
│   ├── new/               # Create product (uses [productId])
│   └── [productId]/
│       └── page.jsx       # Edit product & variants
├── inventory/
│   └── page.jsx           # Inventory management
├── orders/
│   ├── page.jsx           # Orders list
│   └── [orderId]/
│       └── page.jsx       # Order details & management
└── analytics/
    └── page.jsx           # Analytics dashboard

src/lib/
└── adminApi.js            # API service layer
```

## Key Components

### AdminApi (`src/lib/adminApi.js`)
- Centralized API client for all admin operations
- Authenticated fetch wrapper
- Methods for products, variants, inventory, and orders
- Error handling and response parsing

## Usage

1. Navigate to `/admin` to access the admin panel
2. Ensure you're logged in as an admin user
3. Use the sidebar to navigate between sections
4. Filter and manage products, orders, and inventory
5. View real-time analytics

## Permissions

Only admin users with `userRole: 'ADMIN'` can access the admin panel. Non-admin users are automatically redirected to login.

## Future Enhancements

- [ ] Bulk product actions
- [ ] Advanced analytics with charts
- [ ] Discount management
- [ ] Customer management interface
- [ ] Email notifications
- [ ] Product image uploads
- [ ] CSV export for orders/products
