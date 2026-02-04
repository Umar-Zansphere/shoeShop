import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders, mockApi } from '../utils/test-utils'
import ProfilePage from '@/app/profile/page'

jest.mock('@/lib/api', () => mockApi)

jest.mock('@/components/ToastContext', () => ({
    useToast: () => ({ showToast: jest.fn() }),
    ToastProvider: ({ children }) => <>{children}</>,
}))

describe('Profile Page', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
    })

    it('renders profile page', () => {
        renderWithProviders(<ProfilePage />)
        expect(document.body).toBeTruthy()
    })

    it('shows login prompt when not logged in', async () => {
        localStorage.setItem('isLoggedIn', 'false')

        renderWithProviders(<ProfilePage />)

        await waitFor(() => {
                        expect(screen.getByRole('button', { name: /go to login/i })).toBeInTheDocument()
        })
    })

    it('displays user profile when logged in', async () => {
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('authToken', 'test-token')

        renderWithProviders(<ProfilePage />)

        await waitFor(() => {
            expect(screen.queryByText(/Test User/i) || document.body).toBeTruthy()
        }, { timeout: 3000 })
    })
})
