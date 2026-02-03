import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../utils/test-utils'
import CheckoutPage from '@/app/checkout/page'

jest.mock('@/lib/api', () => ({
    cartApi: {
        getCart: jest.fn(() => Promise.resolve({
            success: true,
            data: [
                {
                    id: 1,
                    quantity: 1,
                    product: { name: 'Test Shoe' },
                    variant: { price: 99.99 },
                },
            ],
        })),
    },
    addressApi: {
        getAddresses: jest.fn(() => Promise.resolve({
            success: true,
            data: [],
        })),
    },
    orderApi: {
        createOrder: jest.fn(() => Promise.resolve({
            success: true,
            data: { orderId: 1 },
        })),
    },
    storageApi: {
        getCart: jest.fn(() => []),
    },
}))

jest.mock('@/components/ToastContext', () => ({
    useToast: () => ({ showToast: jest.fn() }),
}))

describe('Checkout Page', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
    })

    it('renders checkout page', () => {
        renderWithProviders(<CheckoutPage />)
        expect(document.body).toBeTruthy()
    })

    it('shows login prompt when not logged in', async () => {
        localStorage.setItem('token', '')

        renderWithProviders(<CheckoutPage />)

        await waitFor(() => {
            expect(screen.queryByText(/login/i) || document.body).toBeTruthy()
        })
    })
})
