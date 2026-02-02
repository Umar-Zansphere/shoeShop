import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminDashboard from '../src/app/admin/page';
import { ordersApi } from '../src/lib/adminApi';
import { useRouter } from 'next/navigation';

// Mock next/navigation.
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/admin'),
}));

// Mock next/link
jest.mock('next/link', () => {
    const Link = ({ href, children }) => <a href={href}>{children}</a>;
    return Link;
});

// Mock adminApi
jest.mock('../src/lib/adminApi', () => ({
  ordersApi: {
    getAnalytics: jest.fn(),
    getOrders: jest.fn(),
  },
  productsApi: {},
}));

// Mock RoleGuard
jest.mock('../src/components/RoleGuard', () => ({ children }) => <>{children}</>);

describe('AdminDashboard', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    useRouter.mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    ordersApi.getAnalytics.mockResolvedValue({});
    ordersApi.getOrders.mockResolvedValue({ orders: [], pagination: { total: 0 } });
    render(<AdminDashboard />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders dashboard with stats and recent orders on successful data fetch', async () => {
    const mockAnalytics = {
      totalOrders: 10,
      totalRevenue: 5000,
      shippedOrders: 5,
      totalCustomers: 8,
      ordersByStatus: { PENDING: 2, PROCESSING: 3 },
    };
    const mockOrders = [
      { id: '1', orderNumber: '123', totalAmount: 50.0, status: 'PENDING', paymentStatus: 'COMPLETED', createdAt: new Date().toISOString() },
      { id: '2', orderNumber: '124', totalAmount: 75.0, status: 'PROCESSING', paymentStatus: 'PENDING', createdAt: new Date().toISOString() },
    ];

    ordersApi.getAnalytics.mockResolvedValue(mockAnalytics);
    ordersApi.getOrders.mockResolvedValue(mockOrders);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Welcome to Admin Panel')).toBeInTheDocument();
    });

    // Check stats
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$5000')).toBeInTheDocument();
    expect(screen.getByText('Orders Shipped')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Total Customers')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();

    // Check recent orders
    expect(screen.getByText('Recent Orders')).toBeInTheDocument();
    expect(screen.getByText('Order #123')).toBeInTheDocument();
    expect(screen.getByText('Order #124')).toBeInTheDocument();
    
    // Check order status summary
    expect(screen.getByText('Order Status Summary')).toBeInTheDocument();
    const pendingElements = screen.getAllByText('Pending');
    expect(pendingElements.length).toBeGreaterThan(0);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays an error alert if API calls fail', async () => {
    ordersApi.getAnalytics.mockRejectedValue(new Error('API Error'));
    ordersApi.getOrders.mockRejectedValue(new Error('API Error'));

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    });
  });

  it('navigates to correct pages on quick action clicks', async () => {
    ordersApi.getAnalytics.mockResolvedValue({});
    ordersApi.getOrders.mockResolvedValue([]);

    render(<AdminDashboard />);

    await waitFor(() => {
        expect(screen.getByText('Add Product').closest('a')).toHaveAttribute('href', '/admin/products/new');
        expect(screen.getByText('Manage Products').closest('a')).toHaveAttribute('href', '/admin/products');
        expect(screen.getByText('View Orders').closest('a')).toHaveAttribute('href', '/admin/orders');
        expect(screen.getByText('Manage Inventory').closest('a')).toHaveAttribute('href', '/admin/inventory');
    });
  });

  it('displays no recent orders message when there are no orders', async () => {
    ordersApi.getAnalytics.mockResolvedValue({});
    ordersApi.getOrders.mockResolvedValue([]);

    render(<AdminDashboard />);

    await waitFor(() => {
        expect(screen.getByText('No recent orders')).toBeInTheDocument();
    });
  });
});
