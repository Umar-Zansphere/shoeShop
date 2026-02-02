import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../src/app/components/Header';
import { storageApi } from '../src/lib/api';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('../src/lib/api', () => ({
  storageApi: {
    getCart: jest.fn(),
  },
}));

describe('Header Component', () => {
  const mockOnSidebarOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    storageApi.getCart.mockReturnValue([]);
  });

  it('renders logo and basic icons', () => {
    render(<Header />);
    expect(screen.getByText('SoleMate')).toBeInTheDocument();
    // Check for aria-labels to find buttons
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    expect(screen.getByLabelText('Shopping cart')).toBeInTheDocument();
  });

  it('calls onSidebarOpen when menu button is clicked', () => {
    render(<Header onSidebarOpen={mockOnSidebarOpen} />);
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    expect(mockOnSidebarOpen).toHaveBeenCalled();
  });

  it('toggles search bar and handles submission', () => {
    render(<Header />);
    
    // 1. Click search icon to open
    const searchToggle = screen.getByLabelText('Search');
    fireEvent.click(searchToggle);

    // 2. Input should be visible now
    const input = screen.getByPlaceholderText(/Search shoes by name/i);
    expect(input).toBeInTheDocument();

    // 3. Type query and submit
    fireEvent.change(input, { target: { value: 'Air Jordan' } });
    
    // Find the submit button inside the form (search icon)
    const submitBtn = input.nextSibling;
    fireEvent.click(submitBtn);

    expect(mockPush).toHaveBeenCalledWith('/products?search=Air%20Jordan');
  });

  it('displays cart count from props when logged in', () => {
    // Simulate logged in user
    localStorage.setItem('authToken', 'fake-token');
    const mockCart = [{ quantity: 2 }, { quantity: 1 }];

    render(<Header cart={mockCart} />);
    
    // 2 + 1 = 3
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays cart count from localStorage (via storageApi) when logged out', () => {
    // Ensure no token
    localStorage.removeItem('authToken');
    // Mock storageApi return
    storageApi.getCart.mockReturnValue([{ quantity: 5 }]);

    render(<Header />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(storageApi.getCart).toHaveBeenCalled();
  });
});