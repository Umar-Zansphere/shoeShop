import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupPage from '../src/app/(auth)/signup/page';
import { authApi } from '../src/lib/api';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('../src/lib/api');
jest.mock('../src/components/PublicRoute', () => ({ children }) => <div>{children}</div>);

describe('SignupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders phone signup by default', () => {
    render(<SignupPage />);
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Get Code')).toBeInTheDocument();
  });

  it('handles phone signup submission', async () => {
    authApi.phoneSignup.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'OTP Sent' })
    });

    render(<SignupPage />);
    
    const input = screen.getByPlaceholderText('+1 555 000 0000');
    fireEvent.change(input, { target: { value: '9876543210' } });
    fireEvent.click(screen.getByText('Get Code'));

    await waitFor(() => {
      expect(authApi.phoneSignup).toHaveBeenCalledWith('9876543210');
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('mode=signup'));
    });
  });

  it('handles email signup submission', async () => {
    window.alert = jest.fn(); // Mock alert
    authApi.signup.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'User created' })
    });

    render(<SignupPage />);
    
    // Switch to email
    fireEvent.click(screen.getByText('Email'));

    fireEvent.change(screen.getByPlaceholderText('hello@example.com'), { target: { value: 'new@user.com' } });
    fireEvent.change(screen.getByPlaceholderText('Create password'), { target: { value: 'securepass' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(authApi.signup).toHaveBeenCalledWith('new@user.com', 'securepass');
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('successful'));
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });
});