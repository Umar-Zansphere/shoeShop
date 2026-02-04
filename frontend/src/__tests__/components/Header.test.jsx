import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders, mockApi } from '../utils/test-utils'
import Header from '@/app/components/Header'

// Mock the API
jest.mock('@/lib/api', () => mockApi)

describe('Header Component', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks()
        localStorage.clear()
    })

    it('renders the Header component', () => {
        renderWithProviders(<Header />)

        const soleMateElements = screen.getAllByText(/SoleMate/i)
        expect(soleMateElements.length).toBeGreaterThan(0)
        expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/shopping cart/i)).toBeInTheDocument()
    })

    it('opens search bar when search button is clicked', () => {
        renderWithProviders(<Header />)

        const searchButton = screen.getByLabelText(/open search/i)
        fireEvent.click(searchButton)

        expect(screen.getByPlaceholderText(/search shoes/i)).toBeInTheDocument()
    })

    it('closes search bar when X button is clicked', () => {
        renderWithProviders(<Header />)

        // Open search
        const searchButton = screen.getByLabelText(/open search/i)
        fireEvent.click(searchButton)

        // Close search
        const closeButton = screen.getByLabelText(/close search/i)
        fireEvent.click(closeButton)

        expect(screen.queryByPlaceholderText(/search shoes/i)).not.toBeInTheDocument()
    })

    it('displays cart count when items are in cart', () => {
        const mockCart = [
            { id: 1, quantity: 2 },
            { id: 2, quantity: 3 },
        ]

        require('@/lib/api').storageApi.getCart.mockReturnValue(mockCart)
        renderWithProviders(<Header />)

        // Cart count should be 5 (2 + 3)
        expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('does not display cart count when cart is empty', () => {
        require('@/lib/api').storageApi.getCart.mockReturnValue([])
        renderWithProviders(<Header />)

                expect(screen.queryByText((content, element) => {
            return element.tagName.toLowerCase() === 'span' && /\d+/.test(content);
        })).not.toBeInTheDocument()
    })

    it('opens sidebar when hamburger menu is clicked', () => {
        renderWithProviders(<Header />)

        const menuButton = screen.getByLabelText(/open menu/i)
        fireEvent.click(menuButton)

        // Sidebar should be rendered (check for sidebar content)
        waitFor(() => {
            expect(screen.getByText(/SoleMate/i)).toBeInTheDocument()
        })
    })

    it('calls onSidebarOpen prop when provided', () => {
        const mockOnSidebarOpen = jest.fn()
        renderWithProviders(<Header onSidebarOpen={mockOnSidebarOpen} />)

        const menuButton = screen.getByLabelText(/open menu/i)
        fireEvent.click(menuButton)

        expect(mockOnSidebarOpen).toHaveBeenCalledTimes(1)
    })

    it('handles search submission', () => {
        const mockPush = jest.fn()
        require('next/navigation').useRouter.mockReturnValue({
            push: mockPush,
        })

        renderWithProviders(<Header />)

        // Open search
        const searchButton = screen.getByLabelText(/open search/i)
        fireEvent.click(searchButton)

        // Type search query
        const searchInput = screen.getByPlaceholderText(/search shoes/i)
        fireEvent.change(searchInput, { target: { value: 'Nike' } })

        // Submit search
        const form = searchInput.closest('form')
        fireEvent.submit(form)

        expect(mockPush).toHaveBeenCalledWith('/products?search=Nike')
    })

    it('displays 99+ for cart count over 99', () => {
        const mockCart = Array(50).fill({ id: 1, quantity: 3 })

        require('@/lib/api').storageApi.getCart.mockReturnValue(mockCart)
        renderWithProviders(<Header />)

        expect(screen.getByText('99+')).toBeInTheDocument()
    })
})
