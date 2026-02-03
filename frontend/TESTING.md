# Testing Guide for SoleMate Frontend

## Overview
This project uses **Jest** and **React Testing Library** for unit and integration testing.

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Structure

```
src/__tests__/
├── components/          # Component tests
│   ├── Header.test.jsx
│   ├── Sidebar.test.jsx
│   ├── ProductCard.test.jsx
│   ├── BottomNav.test.jsx
│   └── LoginPrompt.test.jsx
├── pages/              # Page tests
│   ├── Home.test.jsx
│   └── Orders.test.jsx
└── utils/              # Test utilities
    └── test-utils.jsx
```

## Test Coverage

### Components Tested
- ✅ **Header** (10 tests) - Navigation, search, cart count, sidebar
- ✅ **Sidebar** (13 tests) - Navigation, filters, logout, user state
- ✅ **ProductCard** (14 tests) - Rendering, cart actions, wishlist, edge cases
- ✅ **BottomNav** (8 tests) - Navigation, active states, conditional rendering
- ✅ **LoginPrompt** (12 tests) - Auth prompts, navigation, guest options

### Pages Tested
- ✅ **Home** (5 tests) - Product loading, error handling
- ✅ **Orders** (5 tests) - Auth checks, filtering, loading states

## Writing New Tests

### Basic Test Structure
```javascript
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../utils/test-utils'
import YourComponent from '@/path/to/component'

describe('YourComponent', () => {
  it('renders correctly', () => {
    renderWithProviders(<YourComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Using Mock API
```javascript
import { mockApi } from '../utils/test-utils'

// Mock the API module
jest.mock('@/lib/api', () => ({
  productApi: mockApi.productApi,
}))

// In your test
mockApi.productApi.getProducts.mockResolvedValue({ data: [] })
```

### Testing User Interactions
```javascript
const button = screen.getByText('Click Me')
fireEvent.click(button)

await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument()
})
```

## Test Utilities

### renderWithProviders
Wraps components with necessary providers (ToastProvider, etc.)

```javascript
import { renderWithProviders } from '../utils/test-utils'

renderWithProviders(<YourComponent />)
```

### Mock API Responses
Pre-configured mock responses for common API calls:
- `mockApiResponses.products`
- `mockApiResponses.cart`
- `mockApiResponses.orders`
- `mockApiResponses.user`

### Mock API Functions
Pre-configured mock functions:
- `mockApi.productApi.*`
- `mockApi.cartApi.*`
- `mockApi.orderApi.*`
- `mockApi.userApi.*`
- `mockApi.authApi.*`

## Mocked Dependencies

### Next.js Router
```javascript
const mockPush = jest.fn()
require('next/navigation').useRouter.mockReturnValue({
  push: mockPush,
})
```

### Next.js Image
Automatically mocked to render as `<img>` tag

### localStorage
Mocked with `getItem`, `setItem`, `removeItem`, `clear`

## Best Practices

1. **Clear mocks between tests**
   ```javascript
   beforeEach(() => {
     jest.clearAllMocks()
     localStorage.clear()
   })
   ```

2. **Test user behavior, not implementation**
   - Focus on what users see and do
   - Avoid testing internal state

3. **Use semantic queries**
   - `getByRole`, `getByLabelText`, `getByText`
   - Avoid `getByTestId` unless necessary

4. **Test accessibility**
   - Check for proper ARIA labels
   - Ensure keyboard navigation works

5. **Keep tests simple and focused**
   - One assertion per test when possible
   - Clear test names describing what is tested

## Common Testing Patterns

### Testing Loading States
```javascript
it('shows loading skeleton', () => {
  renderWithProviders(<Component />)
  expect(document.querySelector('.animate-pulse')).toBeTruthy()
})
```

### Testing Error Handling
```javascript
it('handles API error', async () => {
  mockApi.productApi.getProducts.mockRejectedValue(new Error('API Error'))
  renderWithProviders(<Component />)
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

### Testing Conditional Rendering
```javascript
it('shows login prompt when not authenticated', () => {
  localStorage.setItem('token', '')
  renderWithProviders(<Component />)
  expect(screen.getByText(/login/i)).toBeInTheDocument()
})
```

## Troubleshooting

### Tests failing with "Cannot find module"
- Check module paths in `jest.config.js`
- Ensure aliases match `jsconfig.json`

### Tests timing out
- Increase timeout in test: `jest.setTimeout(10000)`
- Check for unresolved promises

### Mock not working
- Ensure mock is defined before component import
- Use `jest.clearAllMocks()` in `beforeEach`

## Coverage Goals

Target coverage: **80%+**
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

Run `npm run test:coverage` to see current coverage.
