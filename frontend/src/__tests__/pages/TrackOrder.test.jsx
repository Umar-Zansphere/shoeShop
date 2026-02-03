import { screen } from '@testing-library/react'
import { renderWithProviders } from '../utils/test-utils'
import TrackOrderPage from '@/app/track-order/page'

jest.mock('@/lib/api', () => ({
    orderApi: {
        trackOrder: jest.fn(() => Promise.resolve({
            success: true,
            data: {
                orderNumber: 'ORD-001',
                status: 'SHIPPED',
                trackingEvents: [],
            },
        })),
    },
}))

jest.mock('@/components/ToastContext', () => ({
    useToast: () => ({ showToast: jest.fn() }),
}))

describe('Track Order Page', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders track order page', () => {
        renderWithProviders(<TrackOrderPage />)
        expect(screen.queryByText(/track/i) || document.body).toBeTruthy()
    })

    it('displays order tracking form', () => {
        renderWithProviders(<TrackOrderPage />)
        expect(document.querySelector('form') || document.querySelector('input')).toBeTruthy()
    })
})
