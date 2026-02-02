import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordPage from '../src/app/(auth)/forgot-password/page';
import { authApi } from '../src/lib/api';

// Mock Next.js navigation
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack }),
}));

// Mock API
jest.mock('../src/lib/api');
// Mock the PublicRoute component
jest.mock('../src/components/PublicRoute', () => ({ children }) => <div>{children}</div>);

describe('ForgotPasswordPage', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the forgot password form', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
  });

  it('navigates back when the back button is clicked', () => {
    render(<ForgotPasswordPage />);
    fireEvent.click(screen.getByLabelText('Go back'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('handles successful password reset request', async () => {
    authApi.forgotPassword.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Success' }),
    });

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(authApi.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(screen.getByText(/Password reset instructions have been sent/)).toBeInTheDocument();
    });
  });

  it('shows an error message on failed password reset request', async () => {
    authApi.forgotPassword.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Email not found' }),
    });

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'not-found@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(authApi.forgotPassword).toHaveBeenCalledWith('not-found@example.com');
      expect(screen.getByText('Email not found')).toBeInTheDocument();
    });
  });

  it('shows a generic error if the API throws an exception', async () => {
    authApi.forgotPassword.mockRejectedValue(new Error('Network Error'));

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });
});
