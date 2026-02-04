import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../utils/test-utils'
import LoginPrompt from '@/components/LoginPrompt'

describe('LoginPrompt Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders with default props', () => {
        renderWithProviders(<LoginPrompt />)

        expect(screen.getByText('Login Required')).toBeInTheDocument()
        expect(screen.getByText('Please log in to access this feature')).toBeInTheDocument()
    })

    it('renders with custom title and message', () => {
        renderWithProviders(
            <LoginPrompt
                title="Custom Title"
                message="Custom message here"
            />
        )

        expect(screen.getByText('Custom Title')).toBeInTheDocument()
        expect(screen.getByText('Custom message here')).toBeInTheDocument()
    })

    it('displays login and signup buttons', () => {
        renderWithProviders(<LoginPrompt />)

        expect(screen.getByText('Log In to Continue')).toBeInTheDocument()
        expect(screen.getByText('Create New Account')).toBeInTheDocument()
    })

    it('navigates to login page with redirect when login button is clicked', () => {
        const mockPush = jest.fn()
        require('next/navigation').useRouter.mockReturnValue({
            push: mockPush,
        })

        history.pushState({}, '', '/profile')

        renderWithProviders(<LoginPrompt />)

        const loginButton = screen.getByText('Log In to Continue')
        fireEvent.click(loginButton)

        expect(mockPush).toHaveBeenCalledWith('/login?redirect=/profile')
    })

    it('navigates to signup page when signup button is clicked', () => {
        const mockPush = jest.fn()
        require('next/navigation').useRouter.mockReturnValue({
            push: mockPush,
        })

        renderWithProviders(<LoginPrompt />)

        const signupButton = screen.getByText('Create New Account')
        fireEvent.click(signupButton)

        expect(mockPush).toHaveBeenCalledWith('/signup')
    })

    it('shows guest options when showGuestOption is true', () => {
        renderWithProviders(<LoginPrompt showGuestOption={true} />)

        expect(screen.getByText('Or continue as guest')).toBeInTheDocument()
        expect(screen.getByText('Shop')).toBeInTheDocument()
        expect(screen.getByText('Cart')).toBeInTheDocument()
        expect(screen.getByText('Track')).toBeInTheDocument()
    })

    it('hides guest options when showGuestOption is false', () => {
        renderWithProviders(<LoginPrompt showGuestOption={false} />)

        expect(screen.queryByText('Or continue as guest')).not.toBeInTheDocument()
    })

    it('navigates to home when Shop button is clicked', () => {
        const mockPush = jest.fn()
        require('next/navigation').useRouter.mockReturnValue({
            push: mockPush,
        })

        renderWithProviders(<LoginPrompt showGuestOption={true} />)

        const shopButton = screen.getByText('Shop')
        fireEvent.click(shopButton)

        expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('navigates to cart when Cart button is clicked', () => {
        const mockPush = jest.fn()
        require('next/navigation').useRouter.mockReturnValue({
            push: mockPush,
        })

        renderWithProviders(<LoginPrompt showGuestOption={true} />)

        const cartButton = screen.getByText('Cart')
        fireEvent.click(cartButton)

        expect(mockPush).toHaveBeenCalledWith('/cart')
    })

    it('navigates to track-order when Track button is clicked', () => {
        const mockPush = jest.fn()
        require('next/navigation').useRouter.mockReturnValue({
            push: mockPush,
        })

        renderWithProviders(<LoginPrompt showGuestOption={true} />)

        const trackButton = screen.getByText('Track')
        fireEvent.click(trackButton)

        expect(mockPush).toHaveBeenCalledWith('/track-order')
    })

    it('displays security message', () => {
        renderWithProviders(<LoginPrompt />)

        expect(screen.getByText(/Your data is secure and protected/i)).toBeInTheDocument()
    })
})
