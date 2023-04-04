import { NextResponse } from 'next/server';
import verifyAuth from './utils/verifyAuth';

const nonProtectedRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/auth/refresh',
];

export const config = {
    matcher: '/api/:function*',
}

export async function middleware(req) {
    const url = req.nextUrl.pathname;
    if (nonProtectedRoutes.includes(url)) {
        return NextResponse.next();
    }

    const auth = await verifyAuth(req);

    if (auth.success) {
        const requestHeaders = new Headers(req.headers)
        requestHeaders.set('user', JSON.stringify(auth.user));
        return NextResponse.next({
            request: {
                headers: requestHeaders
            }
        });
    } else {
        return NextResponse.redirect('http://localhost:3000/login');
    }
}
