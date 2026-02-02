import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import VerifyOtpPage from '../src/app/(auth)/verify-otp/page';
import { authApi } from '../src/lib/api';
import { useMigrateStorageData } from '../src/hooks/useMigrateStorageData';

// Mocks
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockMigrate = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
  useSearchParams: () => ({
    get: jest.fn((key) => {
      if (key === 'phone') return '1234567890';
      if (key === 'mode') return 'login';
      return null;
    }),
  }),
}));

jest.mock('../src/lib/api');
jest.mock('../src/hooks/useMigrateStorageData');
jest.mock('../src/components/PublicRoute', () => ({ children }) => <div>{children}</div>);

describe('VerifyOtpPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useMigrateStorageData.mockReturnValue({ migrate: mockMigrate });
    localStorage.clear();
  });

  it('renders the OTP verification form and displays the phone number', () => {
    render(<VerifyOtpPage />);
    expect(screen.getByText('Verification Code')).toBeInTheDocument();
    expect(screen.getByText(/Code has been sent to/)).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox').length).toBe(6);
  });

  it('handles OTP input and auto-focuses next input', () => {
    render(<VerifyOtpPage />);
    const inputs = screen.getAllByRole('textbox');
    
    fireEvent.change(inputs[0], { target: { value: '1' } });
    
    expect(inputs[0].value).toBe('1');
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('handles backspace to focus the previous input', () => {
    render(<VerifyOtpPage />);
    const inputs = screen.getAllByRole('textbox');
    const firstInput = inputs[0];
    const secondInput = inputs[1];

    // Spy on the focus method of the first input
    const focusSpy = jest.spyOn(firstInput, 'focus');
    
    // Type something in the second input to move focus there
    fireEvent.change(inputs[0], { target: { value: '1' } });
    
    // Now, simulate user deleting the content of the now-focused second input
    fireEvent.change(secondInput, { target: { value: '' } });
    
    // Now, with the input empty, a backspace should move focus
    fireEvent.keyDown(secondInput, { key: 'Backspace' });

    // The focus method of the first input should have been called
    expect(focusSpy).toHaveBeenCalledTimes(1);
  });

  it('successfully verifies OTP for login and redirects', async () => {
    authApi.phoneLoginVerify.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { fullName: 'Test User', userRole: 'CUSTOMER', phone: '1234567890' } }),
    });

    render(<VerifyOtpPage />);
    const inputs = screen.getAllByRole('textbox');
    
    // Fill OTP
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: index.toString() } });
    });

    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));

    await waitFor(() => {
      expect(authApi.phoneLoginVerify).toHaveBeenCalledWith('1234567890', '012345');
      expect(localStorage.getItem('isLoggedIn')).toBe('true');
      expect(localStorage.getItem('fullName')).toBe('Test User');
      expect(mockMigrate).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows an error message on failed verification', async () => {
    authApi.phoneLoginVerify.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid OTP' }),
    });

    render(<VerifyOtpPage />);
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: '1' } });
    });

    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid OTP')).toBeInTheDocument();
    });
  });

  it('handles resending the code after timer expires', async () => {
    jest.useFakeTimers();
    render(<VerifyOtpPage />);

    // Fast-forward time until timer is 0
    act(() => {
      jest.advanceTimersByTime(53000);
    });

    const resendButton = screen.getByRole('button', { name: /Resend Code/i });
    expect(resendButton).toBeInTheDocument();

    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(authApi.phoneLogin).toHaveBeenCalledWith('1234567890');
    });

    // Check if timer resets
    expect(screen.getByText(/Resend code in/)).toBeInTheDocument();
    
    jest.useRealTimers();
  });
});
