import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../utils/test-utils'
import ProductsPage from '@/app/products/page'

jest.mock('@/lib/api', () => ({
    productApi: {
        getProducts: jest.fn(() => Promise.resolve({
            success: true,
            data: {
                products: [
                    {
                        id: 1,
                        name: 'Test Shoe',
                        brand: 'Nike',
                        category: 'RUNNING',
                        price: 99.99,
                        variants: [{ id: 1, price: 99.99, images: [{ url: '/test.jpg' }] }],
                    },
                ],
                pagination: { total: 1, skip: 0, take: 10 },
            },
        })),
        getFilterOptions: jest.fn(() => Promise.resolve({
            data: { brands: ['Nike'], categories: ['RUNNING'] },
        })),
    },
    cartApi: {
        addToCart: jest.fn(() => Promise.resolve({ success: true })),
        getCart: jest.fn(() => Promise.resolve({ success: true, data: [] })),
    },
    wishlistApi: {
        getWishlist: jest.fn(() => Promise.resolve({ success: true, data: [] })),
        addToWishlist: jest.fn(() => Promise.resolve({ success: true })),
    },
    storageApi: {
        getCart: jest.fn(() => []),
    },
}))

jest.mock('@/components/LoadingSkeleton', () => ({
    LoadingSkeleton: () => <div data-testid="loading-skeleton" />,
}))

describe('Products Page', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders products page', () => {
        renderWithProviders(<ProductsPage />)
        expect(document.body).toBeTruthy()
    })
})
