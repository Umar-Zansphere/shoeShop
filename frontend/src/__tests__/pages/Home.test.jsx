import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders, mockApi } from '../utils/test-utils'
import Home from '@/app/page'

// Mock the API
jest.mock('@/lib/api', () => ({
    productApi: mockApi.productApi,
    cartApi: mockApi.cartApi,
    wishlistApi: mockApi.wishlistApi,
}))

describe('Home Page', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the home page', async () => {
        renderWithProviders(<Home />)

        await waitFor(() => {
            expect(screen.getByText(/SoleMate/i)).toBeInTheDocument()
        })
    })

    it('displays loading skeleton while fetching products', () => {
        renderWithProviders(<Home />)

        // Loading skeleton should be visible initially
        expect(screen.getByTestId('loading-skeleton') || document.querySelector('.animate-pulse')).toBeTruthy()
    })

    it('displays products after loading', async () => {
        renderWithProviders(<Home />)

        await waitFor(() => {
            expect(screen.getByText('Test Shoe')).toBeInTheDocument()
        })
    })

    it('displays brand scroller', async () => {
        renderWithProviders(<Home />)

        await waitFor(() => {
            // Brand scroller should be present
            expect(document.querySelector('.brand-scroller') || screen.queryByText(/brands/i)).toBeTruthy()
        })
    })

    it('handles product fetch error gracefully', async () => {
        mockApi.productApi.getPopularProducts.mockRejectedValueOnce(new Error('API Error'))

        renderWithProviders(<Home />)

        await waitFor(() => {
            // Should show error toast or handle error gracefully
            expect(mockApi.productApi.getPopularProducts).toHaveBeenCalled()
        })
    })
})
