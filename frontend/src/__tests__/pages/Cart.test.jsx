import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders, mockApi } from '../utils/test-utils'
import CartPage from '@/app/cart/page'

jest.mock('@/lib/api', () => mockApi)

jest.mock('@/components/ToastContext', () => ({
    useToast: () => ({ showToast: jest.fn() }),
    ToastProvider: ({ children }) => <>{children}</>,
}))

describe('Cart Page', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
    })

    it('renders cart page', () => {
        renderWithProviders(<CartPage />)
                expect(screen.getByRole('heading', { name: /shopping cart/i })).toBeInTheDocument()
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
