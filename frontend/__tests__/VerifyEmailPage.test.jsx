import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import VerifyEmailPage from '../src/app/(auth)/verify-email/page';
import { authApi } from '../src/lib/api';

// Mocks
const mockPush = jest.fn();
let mockToken = 'valid-token';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: jest.fn().mockImplementation(key => {
      if (key === 'token') return mockToken;
      return null;
    }),
  }),
}));

jest.mock('../src/lib/api');
jest.mock('../src/components/PublicRoute', () => ({ children }) => <div>{children}</div>);

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToken = 'valid-token'; // Reset token for each test
  });

  it('shows verifying state initially', () => {
    render(<VerifyEmailPage />);
    expect(screen.getByText('Verifying Email')).toBeInTheDocument();
    expect(screen.getByText('Verifying your email address...')).toBeInTheDocument();
    expect(screen.getByTestId('loader-spin')).toBeInTheDocument();
  });

  it('handles successful email verification', async () => {
    authApi.verifyEmail.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Success' }),
    });

    render(<VerifyEmailPage />);

    await waitFor(() => {
      expect(authApi.verifyEmail).toHaveBeenCalledWith('valid-token');
      expect(screen.getByText('Email Verified!')).toBeInTheDocument();
      expect(screen.getByText(/Your email has been successfully verified/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go to Login/i })).toBeInTheDocument();
    });
  });

  it('handles failed email verification due to API error', async () => {
    authApi.verifyEmail.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Link expired' }),
    });

    render(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      expect(screen.getByText('Link expired')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Back to Login/i })).toBeInTheDocument();
    });
  });

  it('handles error when token is missing', async () => {
    mockToken = null; // Simulate missing token
    render(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      expect(screen.getByText(/Invalid verification link. Token is missing./i)).toBeInTheDocument();
      expect(authApi.verifyEmail).not.toHaveBeenCalled();
    });
  });

  it('navigates to login when "Go to Login" is clicked', async () => {
    authApi.verifyEmail.mockResolvedValue({ ok: true, json: async () => ({}) });
    render(<VerifyEmailPage />);

    await waitFor(() => {
      const loginButton = screen.getByRole('button', { name: /Go to Login/i });
      fireEvent.click(loginButton);
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('navigates to login when "Back to Login" is clicked', async () => {
    authApi.verifyEmail.mockResolvedValue({ ok: false, json: async () => ({ message: 'fail' }) });
    render(<VerifyEmailPage />);

    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /Back to Login/i });
      fireEvent.click(backButton);
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });
});

// Add data-testid to the Loader2 component in the original file for easier selection.
// In src/app/(auth)/verify-email/page.jsx, change:
// <Loader2 className="animate-spin h-8 w-8" />
// to:
// <Loader2 className="animate-spin h-8 w-8" data-testid="loader-spin" />
