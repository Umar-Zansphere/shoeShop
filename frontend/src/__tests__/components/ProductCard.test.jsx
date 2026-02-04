import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../utils/test-utils'
import ProductCard from '@/app/components/ProductCard'

const mockProduct = {
    id: 1,
    name: 'Nike Air Max',
    brand: 'Nike',
    category: 'RUNNING',
    price: 99.99,
    discount: '10% OFF',
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
}

describe('ProductCard Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders product information correctly', () => {
        renderWithProviders(<ProductCard product={mockProduct} />)

        expect(screen.getByText('Nike Air Max')).toBeInTheDocument()
        expect(screen.getByText('Nike')).toBeInTheDocument()
        expect(screen.getByText('RUNNING')).toBeInTheDocument()
        expect(screen.getByText(/₹99.99/i)).toBeInTheDocument()
    })

    it('renders product image', () => {
        renderWithProviders(<ProductCard product={mockProduct} />)

        const image = screen.getByAltText('Nike Air Max')
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('src', expect.stringContaining('test-image.jpg'))
    })

    it('displays "No image" when image is not available', () => {
        const productWithoutImage = {
            ...mockProduct,
            variants: [{ ...mockProduct.variants[0], images: [] }],
        }

        renderWithProviders(<ProductCard product={productWithoutImage} />)

        expect(screen.getByText('No image')).toBeInTheDocument()
    })

    it('calls onAddToCart when Add to Cart button is clicked', async () => {
        const mockOnAddToCart = jest.fn(() => Promise.resolve())

        renderWithProviders(
            <ProductCard
                product={mockProduct}
                onAddToCart={mockOnAddToCart}
            />
        )

        const addToCartButton = screen.getByText(/Add to Cart/i)
        fireEvent.click(addToCartButton)

        await waitFor(() => {
            expect(mockOnAddToCart).toHaveBeenCalledWith({
                variantId: 1,
                productId: 1,
                quantity: 1,
                price: 99.99,
            })
        })
    })

    it('shows "Added!" after successfully adding to cart', async () => {
        const mockOnAddToCart = jest.fn(() => Promise.resolve())

        renderWithProviders(
            <ProductCard
                product={mockProduct}
                onAddToCart={mockOnAddToCart}
            />
        )

        const addToCartButton = screen.getByText(/Add to Cart/i)
        fireEvent.click(addToCartButton)

        await waitFor(() => {
            expect(screen.getByText(/Added!/i)).toBeInTheDocument()
        })
    })

    it('shows loading state when adding to cart', async () => {
        const mockOnAddToCart = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))

        renderWithProviders(
            <ProductCard
                product={mockProduct}
                onAddToCart={mockOnAddToCart}
            />
        )

        const addToCartButton = screen.getByText(/Add to Cart/i)
        fireEvent.click(addToCartButton)

        expect(screen.getByText(/Adding.../i)).toBeInTheDocument()
    })

    it('calls onToggleLike when wishlist button is clicked', () => {
        const mockOnToggleLike = jest.fn()

        renderWithProviders(
            <ProductCard
                product={mockProduct}
                onToggleLike={mockOnToggleLike}
            />
        )

        const wishlistButton = screen.getByLabelText(/add to wishlist/i)
        fireEvent.click(wishlistButton)

        expect(mockOnToggleLike).toHaveBeenCalledWith({
            productId: 1,
            variantId: 1,
        })
    })

    it('displays filled heart when product is liked', () => {
        renderWithProviders(
            <ProductCard
                product={mockProduct}
                isLiked={true}
            />
        )

        const wishlistButton = screen.getByLabelText(/remove from wishlist/i)
        expect(wishlistButton).toBeInTheDocument()
    })

    it('navigates to product detail page when clicked', () => {
        const { container } = renderWithProviders(<ProductCard product={mockProduct} />)

        const link = container.querySelector('a')
        expect(link).toHaveAttribute('href', '/product/1')
    })

    it('returns null when product is not provided', () => {
        const { container } = renderWithProviders(<ProductCard product={null} />)

        expect(container.firstChild).toBeNull()
    })

    it('handles products without variants gracefully', () => {
        const productWithoutVariants = {
            ...mockProduct,
            variants: [],
        }

        renderWithProviders(<ProductCard product={productWithoutVariants} />)

        // Should still render but without add to cart functionality
        expect(screen.getByText('Nike Air Max')).toBeInTheDocument()
    })

    it('formats price with commas', () => {
        const expensiveProduct = {
            ...mockProduct,
            variants: [{
                ...mockProduct.variants[0],
                price: 12999.99,
            }],
        }

        renderWithProviders(<ProductCard product={expensiveProduct} />)

        expect(screen.getByText(/₹12,999.99/i)).toBeInTheDocument()
    })
})
