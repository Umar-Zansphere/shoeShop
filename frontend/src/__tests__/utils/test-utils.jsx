import { render } from '@testing-library/react'
import { ToastProvider } from '@/components/ToastContext'

// Custom render function that includes providers
export function renderWithProviders(ui, options = {}) {
    return render(
        <ToastProvider>
            {ui}
        </ToastProvider>,
        options
    )
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'

// Mock API responses
export const mockApiResponses = {
    products: {
        success: true,
        data: {
            products: [
                {
                    id: 1,
                    name: 'Test Shoe',
                    brand: 'Test Brand',
                    category: 'RUNNING',
                    price: 99.99,
                    variants: [
                        {
                            id: 1,
                            size: '10',
                            color: 'Black',
                            price: 99.99,
                            stock: 10,
                            images: [{ url: '/test-image.jpg' }],
                        },
                    ],
                },
            ],
            pagination: {
                total: 1,
                skip: 0,
                take: 10,
            },
        },
    },
    cart: {
        success: true,
        data: [
            {
                id: 1,
                variantId: 1,
                quantity: 1,
                product: {
                    name: 'Test Shoe',
                    brand: 'Test Brand',
                },
                variant: {
                    size: '10',
                    color: 'Black',
                    price: 99.99,
                },
            },
        ],
    },
    orders: {
        success: true,
        data: {
            orders: [
                {
                    id: 1,
                    orderNumber: 'ORD-001',
                    status: 'PENDING',
                    paymentStatus: 'PENDING',
                    totalAmount: 99.99,
                    createdAt: new Date().toISOString(),
                },
            ],
            pagination: {
                total: 1,
                skip: 0,
                take: 10,
            },
        },
    },
    user: {
        success: true,
        data: {
            id: 1,
            fullName: 'Test User',
            email: 'test@example.com',
            phone: '1234567890',
        },
    },
}

// Mock API functions
export const mockApi = {
    productApi: {
        getProducts: jest.fn(() => Promise.resolve(mockApiResponses.products)),
        getProductDetail: jest.fn(() => Promise.resolve(mockApiResponses.products.data.products[0])),
        getPopularProducts: jest.fn(() => Promise.resolve(mockApiResponses.products)),
        getFilterOptions: jest.fn(() => Promise.resolve({ data: { brands: ['Nike', 'Adidas'], categories: ['RUNNING', 'CASUAL'] } })),
    },
    cartApi: {
        getCart: jest.fn(() => Promise.resolve(mockApiResponses.cart)),
        addToCart: jest.fn(() => Promise.resolve({ success: true })),
        updateCartItem: jest.fn(() => Promise.resolve({ success: true })),
        removeFromCart: jest.fn(() => Promise.resolve({ success: true })),
    },
    orderApi: {
        getOrders: jest.fn(() => Promise.resolve(mockApiResponses.orders)),
        getOrderDetail: jest.fn(() => Promise.resolve({ success: true, data: mockApiResponses.orders.data.orders[0] })),
        createOrder: jest.fn(() => Promise.resolve({ success: true, data: { orderId: 1 } })),
    },
    userApi: {
        getProfile: jest.fn(() => Promise.resolve(mockApiResponses.user)),
        updateProfile: jest.fn(() => Promise.resolve({ success: true })),
    },
    authApi: {
        login: jest.fn(() => Promise.resolve({ success: true, data: { token: 'test-token' } })),
        logout: jest.fn(() => Promise.resolve({ success: true })),
    },
    wishlistApi: {
        getWishlist: jest.fn(() => Promise.resolve({ success: true, data: [] })),
        addToWishlist: jest.fn(() => Promise.resolve({ success: true })),
        removeFromWishlist: jest.fn(() => Promise.resolve({ success: true })),
    },
    storageApi: {
        getCart: jest.fn(() => []),
    },
}
