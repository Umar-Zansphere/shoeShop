import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../utils/test-utils'
import BottomNav from '@/components/BottomNav'

describe('BottomNav Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders all navigation items', () => {
        renderWithProviders(<BottomNav />)

        expect(screen.getByText('Home')).toBeInTheDocument()
        expect(screen.getByText('Explore')).toBeInTheDocument()
        expect(screen.getByText('Cart')).toBeInTheDocument()
        expect(screen.getByText('Wishlist')).toBeInTheDocument()
        expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    it('highlights active route', () => {
        require('next/navigation').usePathname.mockReturnValue('/')

        const { container } = renderWithProviders(<BottomNav />)

        const homeLink = screen.getByText('Home').closest('a')
        expect(homeLink).toHaveClass('text-[#172031]')
    })

    it('does not render on auth pages', () => {
        require('next/navigation').usePathname.mockReturnValue('/login')

        const { container } = renderWithProviders(<BottomNav />)

        expect(container.firstChild).toBeNull()
    })

    it('does not render on admin pages', () => {
        require('next/navigation').usePathname.mockReturnValue('/admin')

        const { container } = renderWithProviders(<BottomNav />)

        expect(container.firstChild).toBeNull()
    })

    it('does not render on signup page', () => {
        require('next/navigation').usePathname.mockReturnValue('/signup')

        const { container } = renderWithProviders(<BottomNav />)

        expect(container.firstChild).toBeNull()
    })

    it('renders on products page', () => {
        require('next/navigation').usePathname.mockReturnValue('/products')

        renderWithProviders(<BottomNav />)

        expect(screen.getByText('Explore')).toBeInTheDocument()
    })

    it('has correct href attributes', () => {
        renderWithProviders(<BottomNav />)

        expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/')
        expect(screen.getByText('Explore').closest('a')).toHaveAttribute('href', '/products')
        expect(screen.getByText('Cart').closest('a')).toHaveAttribute('href', '/cart')
        expect(screen.getByText('Wishlist').closest('a')).toHaveAttribute('href', '/wishlist')
        expect(screen.getByText('Profile').closest('a')).toHaveAttribute('href', '/profile')
    })

    it('shows active indicator for current route', () => {
        require('next/navigation').usePathname.mockReturnValue('/cart')

        const { container } = renderWithProviders(<BottomNav />)

        const cartLink = screen.getByText('Cart').closest('a')
        const indicator = cartLink.querySelector('.absolute.-bottom-1')
        expect(indicator).toBeInTheDocument()
    })
})
