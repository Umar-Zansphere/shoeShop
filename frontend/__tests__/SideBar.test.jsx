import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Sidebar from '../src/app/components/Sidebar';
import { productApi, authApi } from '../src/lib/api';

// 1. Mock Next.js Router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// 2. Mock API modules
jest.mock('../src/lib/api', () => ({
  productApi: {
    getFilterOptions: jest.fn(),
  },
  authApi: {
    logout: jest.fn(),
  },
}));

describe('Sidebar Component', () => {
  const mockOnClose = jest.fn();
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders correctly when closed', () => {
    render(<Sidebar isOpen={false} onClose={mockOnClose} />);
    // When closed, the sidebar is translated off-screen (implementation detail)
    // We can check if the specific text is present in the DOM
    expect(screen.getByText('SoleMate')).toBeInTheDocument();
  });

  it('loads filter options when opened', async () => {
    // Mock the API response
    productApi.getFilterOptions.mockResolvedValue({
      brands: ['Nike', 'Adidas']
    });

    render(<Sidebar isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(productApi.getFilterOptions).toHaveBeenCalled();
      expect(screen.getByText('Nike')).toBeInTheDocument();
      expect(screen.getByText('Adidas')).toBeInTheDocument();
    });
  });

  it('displays user info when logged in (via localStorage)', async () => {
    // Setup localStorage mock data
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('fullName', 'John Doe');
    localStorage.setItem('phone', '1234567890');
    productApi.getFilterOptions.mockResolvedValue({});

    render(<Sidebar isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('1234567890')).toBeInTheDocument();
      // Should show Logout button
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  it('displays login/signup prompts when not logged in', async () => {
    productApi.getFilterOptions.mockResolvedValue({});
    render(<Sidebar isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText(/Sign in to sync your wishlist/i)).toBeInTheDocument();
      expect(screen.getByText('Login / Signup')).toBeInTheDocument();
    });
  });

  it('handles navigation clicks', async () => {
    productApi.getFilterOptions.mockResolvedValue({});
    render(<Sidebar isOpen={true} onClose={mockOnClose} />);
    
    await waitFor(() => {
      const newArrivals = screen.getByText('🌟 New Arrivals');
      fireEvent.click(newArrivals);
    });

    expect(mockPush).toHaveBeenCalledWith('/products?isFeatured=true');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles gender filtering', async () => {
    productApi.getFilterOptions.mockResolvedValue({});
    render(<Sidebar isOpen={true} onClose={mockOnClose} />);
    
    await waitFor(() => {
      const menButton = screen.getByText('Men');
      fireEvent.click(menButton);
    });

    expect(mockPush).toHaveBeenCalledWith('/products?gender=MEN');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles logout process', async () => {
    // Setup logged in state
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('fullName', 'User');
    authApi.logout.mockResolvedValue({}); // Mock successful API logout

    render(<Sidebar isOpen={true} onClose={mockOnClose} onLogout={mockOnLogout} />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    // Verify API call
    expect(authApi.logout).toHaveBeenCalled();

    // Verify Success Modal appears
    await waitFor(() => {
      expect(screen.getByText('Logout Successful')).toBeInTheDocument();
    });
    
    // Verify localStorage cleared
    expect(localStorage.getItem('isLoggedIn')).toBeNull();

    // Close Modal and check redirect
    const homeButton = screen.getByText('Go to Home');
    fireEvent.click(homeButton);
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});