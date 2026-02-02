import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../src/app/(auth)/login/page';
import { authApi } from '../src/lib/api';
import { useMigrateStorageData } from '../src/hooks/useMigrateStorageData';

// Mock Next.js navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));
  
// Mock API and Hooks
jest.mock('../src/lib/api');
jest.mock('../src/hooks/useMigrateStorageData');
jest.mock('../src/components/PublicRoute', () => ({ children }) => <div>{children}</div>);

describe('LoginPage', () => {
  const mockMigrate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    useMigrateStorageData.mockReturnValue({ migrate: mockMigrate });
  });

  it('renders phone login by default', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('+1 555 000 0000')).toBeInTheDocument();
    expect(screen.getByText('Get Verification Code')).toBeInTheDocument();
  });

  it('switches to email login mode', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText('Email & Password'));
    
    expect(screen.getByPlaceholderText('hello@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('handles phone login submission successfully', async () => {
    authApi.phoneLogin.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Code sent' })
    });

    render(<LoginPage />);
    
    const phoneInput = screen.getByPlaceholderText('+1 555 000 0000');
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    
    fireEvent.click(screen.getByText('Get Verification Code'));

    await waitFor(() => {
      expect(authApi.phoneLogin).toHaveBeenCalledWith('1234567890');
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/verify-otp?phone=1234567890&mode=login'));
    });
  });

  it('handles email login submission successfully', async () => {
    // Mock successful login response
    authApi.login.mockResolvedValue({
      ok: true,
      json: async () => ({
        user: { fullName: 'Test User', userRole: 'CUSTOMER', phone: '123' }
      })
    });

    render(<LoginPage />);
    
    // Switch to email
    fireEvent.click(screen.getByText('Email & Password'));

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('hello@example.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });

    // Submit
    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith('test@test.com', 'password123');
      // Check storage
      expect(localStorage.getItem('fullName')).toBe('Test User');
      expect(localStorage.getItem('isLoggedIn')).toBe('true');
      // Check migration called
      expect(mockMigrate).toHaveBeenCalled();
      // Check redirect
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('displays error message on failure', async () => {
    authApi.phoneLogin.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid phone number' })
    });

    render(<LoginPage />);
    
    const phoneInput = screen.getByPlaceholderText('+1 555 000 0000');
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    
    fireEvent.click(screen.getByText('Get Verification Code'));

    await waitFor(() => {
      expect(authApi.phoneLogin).toHaveBeenCalledWith('1234567890');
      expect(screen.getByText('Invalid phone number')).toBeInTheDocument();
    });
  });
});