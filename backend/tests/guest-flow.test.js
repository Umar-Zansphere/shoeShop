/**
 * Comprehensive Test Suite for Guest-First E-Commerce Flow
 * Tests session management, cart, wishlist, checkout, and order tracking
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    const data = await response.json();
    return { status: response.status, data };
}

// Test 1: Session Creation and Validation
async function testSessionManagement() {
    console.log('\n=== Test 1: Session Management ===');

    // Create session
    const { status: createStatus, data: sessionData } = await apiRequest('/api/session/create', {
        method: 'POST',
    });

    console.log(`✓ Session created: ${sessionData.sessionId}`);
    assert(createStatus === 200, 'Session creation should return 200');
    assert(sessionData.sessionId, 'Session should have an ID');

    // Validate session
    const { status: validateStatus } = await apiRequest('/api/session/validate', {
        headers: { 'x-session-id': sessionData.sessionId },
    });

    console.log(`✓ Session validated`);
    assert(validateStatus === 200, 'Session validation should return 200');

    return sessionData.sessionId;
}

// Test 2: Guest Cart Operations
async function testGuestCart(sessionId) {
    console.log('\n=== Test 2: Guest Cart Operations ===');

    // Get product for testing (assuming products exist)
    const { data: products } = await apiRequest('/api/products?take=1');
    const testVariantId = products.products[0]?.variants[0]?.id;

    if (!testVariantId) {
        console.log('⚠ No products available for testing');
        return;
    }

    // Add to cart
    const { status: addStatus, data: addData } = await apiRequest('/api/cart', {
        method: 'POST',
        headers: { 'x-session-id': sessionId },
        body: JSON.stringify({ variantId: testVariantId, quantity: 2 }),
    });

    console.log(`✓ Added to cart: ${addData.message}`);
    assert(addStatus === 200, 'Add to cart should return 200');
    assert(addData.toast.type === 'success', 'Should return success toast');

    // Get cart
    const { status: getStatus, data: cartData } = await apiRequest('/api/cart', {
        headers: { 'x-session-id': sessionId },
    });

    console.log(`✓ Retrieved cart with ${cartData.itemCount} items`);
    assert(getStatus === 200, 'Get cart should return 200');
    assert(cartData.items.length > 0, 'Cart should have items');

    const cartItemId = cartData.items[0].id;

    // Update cart item
    const { status: updateStatus } = await apiRequest(`/api/cart/${cartItemId}`, {
        method: 'PATCH',
        headers: { 'x-session-id': sessionId },
        body: JSON.stringify({ quantity: 3 }),
    });

    console.log(`✓ Updated cart item quantity`);
    assert(updateStatus === 200, 'Update cart item should return 200');

    // Remove from cart
    const { status: removeStatus } = await apiRequest(`/api/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: { 'x-session-id': sessionId },
    });

    console.log(`✓ Removed item from cart`);
    assert(removeStatus === 200, 'Remove from cart should return 200');
}

// Test 3: Guest Wishlist Operations
async function testGuestWishlist(sessionId) {
    console.log('\n=== Test 3: Guest Wishlist Operations ===');

    const { data: products } = await apiRequest('/api/products?take=1');
    const testProductId = products.products[0]?.id;
    const testVariantId = products.products[0]?.variants[0]?.id;

    if (!testProductId) {
        console.log('⚠ No products available for testing');
        return;
    }

    // Add to wishlist
    const { status: addStatus, data: addData } = await apiRequest('/api/wishlist', {
        method: 'POST',
        headers: { 'x-session-id': sessionId },
        body: JSON.stringify({ productId: testProductId, variantId: testVariantId }),
    });

    console.log(`✓ Added to wishlist: ${addData.message}`);
    assert(addStatus === 200, 'Add to wishlist should return 200');

    // Get wishlist
    const { status: getStatus, data: wishlistData } = await apiRequest('/api/wishlist', {
        headers: { 'x-session-id': sessionId },
    });

    console.log(`✓ Retrieved wishlist with ${wishlistData.items.length} items`);
    assert(getStatus === 200, 'Get wishlist should return 200');

    const wishlistItemId = wishlistData.items[0]?.id;

    if (wishlistItemId) {
        // Remove from wishlist
        const { status: removeStatus } = await apiRequest(`/api/wishlist/${wishlistItemId}`, {
            method: 'DELETE',
            headers: { 'x-session-id': sessionId },
        });

        console.log(`✓ Removed item from wishlist`);
        assert(removeStatus === 200, 'Remove from wishlist should return 200');
    }
}

// Test 4: Guest Checkout Flow
async function testGuestCheckout(sessionId) {
    console.log('\n=== Test 4: Guest Checkout Flow ===');

    // Add item to cart first
    const { data: products } = await apiRequest('/api/products?take=1');
    const testVariantId = products.products[0]?.variants[0]?.id;

    await apiRequest('/api/cart', {
        method: 'POST',
        headers: { 'x-session-id': sessionId },
        body: JSON.stringify({ variantId: testVariantId, quantity: 1 }),
    });

    // Create guest order
    const { status, data } = await apiRequest('/api/orders/guest', {
        method: 'POST',
        headers: { 'x-session-id': sessionId },
        body: JSON.stringify({
            guestName: 'Test User',
            guestEmail: 'test@example.com',
            guestPhone: '+1234567890',
            address: {
                name: 'Home',
                phone: '+1234567890',
                addressLine1: '123 Test St',
                city: 'Test City',
                state: 'Test State',
                postalCode: '12345',
                country: 'Test Country',
            },
            paymentMethod: 'COD',
        }),
    });

    console.log(`✓ Guest checkout completed: Order ${data.orderNumber}`);
    assert(status === 200, 'Guest checkout should return 200');
    assert(data.orderNumber, 'Order should have an order number');

    return { orderNumber: data.orderNumber, phone: '+1234567890' };
}

// Test 5: Order Tracking with OTP
async function testOrderTracking(orderNumber, phone) {
    console.log('\n=== Test 5: Order Tracking with OTP ===');

    // Request tracking OTP
    const { status: requestStatus, data: requestData } = await apiRequest('/api/orders/track/request', {
        method: 'POST',
        body: JSON.stringify({ orderNumber, phone }),
    });

    console.log(`✓ Tracking OTP requested: ${requestData.message}`);
    assert(requestStatus === 200, 'OTP request should return 200');

    // In a real scenario, you'd get the OTP from SMS
    // For testing, we'll check the console logs
    console.log('⚠ Check backend console for OTP code');
    console.log('  (In production, this would be sent via SMS)');
}

// Test 6: Session Migration on Login
async function testSessionMigration(sessionId) {
    console.log('\n=== Test 6: Session Migration ===');

    // Add items to cart as guest
    const { data: products } = await apiRequest('/api/products?take=1');
    const testVariantId = products.products[0]?.variants[0]?.id;

    await apiRequest('/api/cart', {
        method: 'POST',
        headers: { 'x-session-id': sessionId },
        body: JSON.stringify({ variantId: testVariantId, quantity: 1 }),
    });

    // Simulate user signup/login
    const testPhone = `+1${Date.now().toString().slice(-10)}`;

    // Request signup OTP
    await apiRequest('/api/auth/phone-signup', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: testPhone }),
    });

    console.log('⚠ Check backend console for signup OTP');
    console.log('  After login, session migration would transfer cart/wishlist to user account');
}

// Helper assertion function
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Guest-First E-Commerce Test Suite\n');

    try {
        const sessionId = await testSessionManagement();
        await testGuestCart(sessionId);
        await testGuestWishlist(sessionId);

        const orderInfo = await testGuestCheckout(sessionId);
        if (orderInfo) {
            await testOrderTracking(orderInfo.orderNumber, orderInfo.phone);
        }

        await testSessionMigration(sessionId);

        console.log('\n✅ All tests completed successfully!');
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run tests if executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = { runAllTests };
