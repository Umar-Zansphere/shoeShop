import { screen, waitFor, fireEvent } from '@testing-library/react'
import { renderWithProviders, mockApi } from '../utils/test-utils'
import OrdersPage from '@/app/orders/page'

// Mock the API
jest.mock('@/lib/api', () => mockApi)

jest.mock('@/components/ToastContext', () => ({
    useToast: () => ({
        showToast: jest.fn(),
    }),
    ToastProvider: ({ children }) => <>{children}</>,
}))

jest.mock('@/components/LoginPrompt', () => () => <div data-testid="login-prompt" />)

describe('Orders Page', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
    })

    it('shows LoginPrompt when user is not logged in', () => {
        localStorage.setItem('token', '')

        renderWithProviders(<OrdersPage />)

        expect(screen.getByTestId('login-prompt')).toBeInTheDocument()
    })
})
