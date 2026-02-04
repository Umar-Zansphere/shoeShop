import { screen } from '@testing-library/react'
import { renderWithProviders, mockApi } from '../utils/test-utils'
import TrackOrderPage from '@/app/track-order/page'

jest.mock('@/lib/api', () => mockApi)

jest.mock('@/components/ToastContext', () => ({
    useToast: () => ({ showToast: jest.fn() }),
    ToastProvider: ({ children }) => <>{children}</>,
}))

describe('Track Order Page', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders track order page', () => {
        renderWithProviders(<TrackOrderPage />)
                expect(screen.getByRole('heading', { name: /track your order/i })).toBeInTheDocument()
    })

    it('displays order tracking form', () => {
        renderWithProviders(<TrackOrderPage />)
        expect(document.querySelector('form') || document.querySelector('input')).toBeTruthy()
    })
})
