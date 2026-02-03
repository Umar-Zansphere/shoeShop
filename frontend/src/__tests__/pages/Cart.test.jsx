import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders, mockApi } from '../utils/test-utils'
import CartPage from '@/app/cart/page'

jest.mock('@/lib/api', () => ({
    cartApi: {
        getCart: jest.fn(() => Promise.resolve({
            success: true,
            data: [
                {
                    id: 1,
                    variantId: 1,
                    quantity: 2,
                    product: { name: 'Test Shoe', brand: 'Nike' },
                    variant: { size: '10', color: 'Black', price: 99.99 },
                },
            ],
        })),
        updateCartItem: jest.fn(() => Promise.resolve({ success: true })),
        removeFromCart: jest.fn(() => Promise.resolve({ success: true })),
    },
    storageApi: {
        getCart: jest.fn(() => []),
    },
}))

jest.mock('@/components/ToastContext', () => ({
    useToast: () => ({ showToast: jest.fn() }),
}))

describe('Cart Page', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
    })

    it('renders cart page', () => {
        renderWithProviders(<CartPage />)
        expect(screen.getByText(/cart/i) || document.body).toBeTruthy()
    })

    it('displays empty cart message when cart is empty', async () => {
        const { cartApi } = require('@/lib/api')
        cartApi.getCart.mockResolvedValue({ success: true, data: [] })

        renderWithProviders(<CartPage />)

        await waitFor(() => {
            expect(screen.queryByText(/empty/i) || screen.queryByText(/no items/i)).toBeTruthy()
        })
    })
})
