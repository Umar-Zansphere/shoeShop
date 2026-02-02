import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AnalyticsPage from '../src/app/admin/analytics/page';
import { ordersApi } from '../src/lib/adminApi';

// Mock adminApi
jest.mock('../src/lib/adminApi', () => ({
  ordersApi: {
    getAnalytics: jest.fn(),
  },
}));

// Mock RoleGuard and other components if needed, assuming AnalyticsPage is used within a layout that has it.
jest.mock('../src/components/RoleGuard', () => ({ children }) => <>{children}</>);

describe('AnalyticsPage', () => {
  const mockAnalyticsData = {
    totalOrders: 100,
    totalRevenue: 15000,
    shippedOrders: 80,
    ordersByStatus: {
      PENDING: 10,
      PROCESSING: 5,
      SHIPPED: 80,
      DELIVERED: 0,
      CANCELLED: 5,
    },
    paymentsByStatus: {
      COMPLETED: 90,
      PENDING: 5,
      FAILED: 5,
      REFUNDED: 0,
    },
    totalCustomers: 50,
    repeatCustomers: 10,
    topProducts: [
      { name: 'Product A', unitsSold: 50, revenue: 7500 },
      { name: 'Product B', unitsSold: 30, revenue: 4500 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    ordersApi.getAnalytics.mockResolvedValue({ data: {} });
    render(<AnalyticsPage />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('fetches and displays analytics data correctly', async () => {
    ordersApi.getAnalytics.mockResolvedValue({ data: mockAnalyticsData });
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    // Check key metrics
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$15000.00')).toBeInTheDocument();
    expect(screen.getByText('Orders Shipped')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('Avg Order Value')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();

    // Check order status distribution
    expect(screen.getByText('Order Status Distribution')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    
    // Check top products
    expect(screen.getByText('Top Products')).toBeInTheDocument();
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('$7500.00')).toBeInTheDocument();
  });

  it('handles date range change and refetches data', async () => {
    ordersApi.getAnalytics.mockResolvedValue({ data: mockAnalyticsData });
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('Total Orders')).toBeInTheDocument();
    });

    const startDateInput = screen.getByLabelText('Start Date');
    const applyButton = screen.getByRole('button', { name: /Apply/i });

    fireEvent.change(startDateInput, { target: { value: '2023-01-01' } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(ordersApi.getAnalytics).toHaveBeenCalledTimes(2); // Initial fetch + 1 after apply
      expect(ordersApi.getAnalytics).toHaveBeenCalledWith(expect.objectContaining({
        startDate: '2023-01-01',
      }));
    });
  });

  it('displays an error message if fetching analytics fails', async () => {
    ordersApi.getAnalytics.mockRejectedValue(new Error('Failed to fetch'));
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load analytics')).toBeInTheDocument();
    });
  });
});
