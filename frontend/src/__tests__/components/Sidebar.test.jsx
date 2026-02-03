import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../utils/test-utils'
import Sidebar from '@/app/components/Sidebar'

// Mock the API
jest.mock('@/lib/api', () => ({
    productApi: {
        getFilterOptions: jest.fn(() => Promise.resolve({
            data: {
                brands: ['Nike', 'Adidas', 'Puma'],
                categories: ['RUNNING', 'CASUAL'],
            },
        })),
    },
    authApi: {
        logout: jest.fn(() => Promise.resolve({ success: true })),
    },
}))

describe('Sidebar Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
    })

    it('renders when isOpen is true', () => {
        renderWithProviders(<Sidebar isOpen={true} onClose={jest.fn()} />)

        expect(screen.getByText(/SoleMate/i)).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
        const { container } = renderWithProviders(<Sidebar isOpen={false} onClose={jest.fn()} />)

        // Sidebar should have translate-x-full class (hidden)
        const sidebar = container.querySelector('.fixed')
        expect(sidebar).toHaveClass('-translate-x-full')
    })

    it('calls onClose when close button is clicked', () => {
        const mockOnClose = jest.fn()
        renderWithProviders(<Sidebar isOpen={true} onClose={mockOnClose} />)

        const closeButton = screen.getByLabelText(/close menu/i)
        fireEvent.click(closeButton)

        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when backdrop is clicked', () => {
        const mockOnClose = jest.fn()
        const { container } = renderWithProviders(<Sidebar isOpen={true} onClose={mockOnClose} />)

        const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/30')
        fireEvent.click(backdrop)

        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('displays login button when user is not logged in', () => {
        localStorage.setItem('isLoggedIn', 'false')

        renderWithProviders(<Sidebar isOpen={true} onClose={jest.fn()} />)

        expect(screen.getByText(/Login \/ Signup/i)).toBeInTheDocument()
    })

    it('displays user info when user is logged in', () => {
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('fullName', 'John Doe')
        localStorage.setItem('phone', '1234567890')

        renderWithProviders(<Sidebar isOpen={true} onClose={jest.fn()} />)

        expect(screen.getByText(/John Doe/i)).toBeInTheDocument()
        expect(screen.getByText(/1234567890/i)).toBeInTheDocument()
    })

    it('displays navigation items', () => {
        renderWithProviders(<Sidebar isOpen={true} onClose={jest.fn()} />)

        expect(screen.getByText(/New Arrivals/i)).toBeInTheDocument()
        expect(screen.getByText(/Featured/i)).toBeInTheDocument()
        expect(screen.getByText(/All Products/i)).toBeInTheDocument()
    })

    it('displays gender filters', () => {
        renderWithProviders(<Sidebar isOpen={true} onClose={jest.fn()} />)

        expect(screen.getByText(/Men/i)).toBeInTheDocument()
        expect(screen.getByText(/Women/i)).toBeInTheDocument()
        expect(screen.getByText(/Unisex/i)).toBeInTheDocument()
        expect(screen.getByText(/Kids/i)).toBeInTheDocument()
    })

    it('displays category filters', () => {
        renderWithProviders(<Sidebar isOpen={true} onClose={jest.fn()} />)

        expect(screen.getByText(/Running/i)).toBeInTheDocument()
        expect(screen.getByText(/Casual/i)).toBeInTheDocument()
        expect(screen.getByText(/Formal/i)).toBeInTheDocument()
        expect(screen.getByText(/Sneakers/i)).toBeInTheDocument()
    })

    it('loads and displays brand filters', async () => {
        renderWithProviders(<Sidebar isOpen={true} onClose={jest.fn()} />)

        await waitFor(() => {
            expect(screen.getByText(/Nike/i)).toBeInTheDocument()
            expect(screen.getByText(/Adidas/i)).toBeInTheDocument()
            expect(screen.getByText(/Puma/i)).toBeInTheDocument()
        })
    })

    it('navigates when filter is clicked', () => {
        const mockPush = jest.fn()
        const mockOnClose = jest.fn()
        require('next/navigation').useRouter.mockReturnValue({
            push: mockPush,
        })

        renderWithProviders(<Sidebar isOpen={true} onClose={mockOnClose} />)

        const menButton = screen.getByText(/^Men$/i)
        fireEvent.click(menButton)

        expect(mockPush).toHaveBeenCalledWith('/products?gender=MEN')
        expect(mockOnClose).toHaveBeenCalled()
    })

    it('displays logout button when user is logged in', () => {
        localStorage.setItem('isLoggedIn', 'true')

        renderWithProviders(<Sidebar isOpen={true} onClose={jest.fn()} />)

        expect(screen.getByText(/Logout/i)).toBeInTheDocument()
    })

    it('handles logout successfully', async () => {
        localStorage.setItem('isLoggedIn', 'true')
        const mockOnLogout = jest.fn()
        const mockOnClose = jest.fn()

        renderWithProviders(<Sidebar isOpen={true} onClose={mockOnClose} onLogout={mockOnLogout} />)

        const logoutButton = screen.getByText(/Logout/i)
        fireEvent.click(logoutButton)

        await waitFor(() => {
            expect(screen.getByText(/Logout Successful/i)).toBeInTheDocument()
        })
    })
})
