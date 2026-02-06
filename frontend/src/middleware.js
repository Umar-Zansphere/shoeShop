import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    // Get the access token from cookies
    const token = request.cookies.get('accessToken')?.value;

    // Decode the token to get user info
    let user = null;
    if (token) {
        try {
            const { payload } = await jwtVerify(token, secret);

            user = {
                id: payload.id,
                role: payload.role,
            };
        }  catch (error) {
            console.error('JWT verification failed:', error.message);
            // Token is invalid or expired, user remains null
        }
    }

    // Admin route protection
    if (pathname.startsWith('/')) {
        // Allow access to admin login page
        if (pathname === '/login') {
            // If already authenticated as admin, redirect to admin dashboard
            if (user && user.role === 'ADMIN') {
                return NextResponse.redirect(new URL('/', request.url));
            }
            // Allow access to login page
            return NextResponse.next();
        }
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        if (user.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
    }

    // Continue with the request
    return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        // Match all  routes
        '/:path*',
    ],
};
