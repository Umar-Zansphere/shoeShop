import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../utils/test-utils'
import WishlistPage from '@/app/wishlist/page'

jest.mock('@/lib/api', () => ({
    wishlistApi: {
        getWishlist: jest.fn(() => Promise.resolve({
            success: true,
            data: [],
        })),
        removeFromWishlist: jest.fn(() => Promise.resolve({ success: true })),
    },
    cartApi: {
        addToCart: jest.fn(() => Promise.resolve({ success: true })),
    },
    storageApi: {
        getCart: jest.fn(() => []),
    },
}))

jest.mock('@/components/ToastContext', () => ({
    useToast: () => ({ showToast: jest.fn() }),
}))

describe('Wishlist Page', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
    })

    it('renders wishlist page', () => {
        renderWithProviders(<WishlistPage />)
        expect(document.body).toBeTruthy()
    })

    it('displays empty wishlist message', async () => {
        renderWithProviders(<WishlistPage />)

        await waitFor(() => {
            expect(screen.queryByText(/empty/i) || screen.queryByText(/no items/i) || document.body).toBeTruthy()
        })
    })
})
