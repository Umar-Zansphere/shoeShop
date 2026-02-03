import { screen, waitFor, fireEvent } from '@testing-library/react'
import { renderWithProviders, mockApi } from '../utils/test-utils'
import OrdersPage from '@/app/orders/page'

// Mock the API
jest.mock('@/lib/api', () => ({
    orderApi: mockApi.orderApi,
}))

jest.mock('@/components/ToastContext', () => ({
    useToast: () => ({
        showToast: jest.fn(),
    }),
}))

describe('Orders Page', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
    })

    it('shows LoginPrompt when user is not logged in', () => {
        localStorage.setItem('token', '')

        renderWithProviders(<OrdersPage />)

        waitFor(() => {
            expect(screen.getByText(/View Your Orders/i)).toBeInTheDocument()
        })
    })

    it('displays loading skeleton while fetching orders', () => {
        localStorage.setItem('token', 'test-token')

        renderWithProviders(<OrdersPage />)

        // Loading skeleton should be visible
        expect(document.querySelector('.animate-pulse')).toBeTruthy()
    })

    it('displays orders after loading', async () => {
        localStorage.setItem('token', 'test-token')

        renderWithProviders(<OrdersPage />)

        await waitFor(() => {
            expect(screen.getByText('ORD-001')).toBeInTheDocument()
        })
    })

    it('displays status filters', async () => {
        localStorage.setItem('token', 'test-token')

        renderWithProviders(<OrdersPage />)

        await waitFor(() => {
            expect(screen.getByText('PENDING')).toBeInTheDocument()
            expect(screen.getByText('PAID')).toBeInTheDocument()
            expect(screen.getByText('SHIPPED')).toBeInTheDocument()
            expect(screen.getByText('DELIVERED')).toBeInTheDocument()
            expect(screen.getByText('CANCELLED')).toBeInTheDocument()
        })
    })

    it('filters orders when status filter is clicked', async () => {
        localStorage.setItem('token', 'test-token')

        renderWithProviders(<OrdersPage />)

        await waitFor(() => {
            const pendingButton = screen.getByText('PENDING')
            fireEvent.click(pendingButton)

            expect(mockApi.orderApi.getOrders).toHaveBeenCalledWith('PENDING', 0, 10)
        })
    })
})
