import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const nonProtectedRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/auth/refresh',
];

export const config = {
    matcher: '/api/:path*',
};

export async function middleware(req: NextRequest) {
    const authorization = req.headers.get('Authorization');
    const accessToken = authorization?.replace('Bearer ', '');
    const { pathname } = req.nextUrl;

    // If request is OPTIONS, return early with 200
    if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 200,
        });
    }

    if (nonProtectedRoutes.includes(pathname) || pathname.startsWith('/_next')) {
        return NextResponse.next();
    }

    if (!accessToken) {
        return NextResponse.rewrite('/login');
    } else {
        try {
            const accessTokenSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

            const { payload } = await jwtVerify(accessToken, accessTokenSecret, {
                issuer: process.env.ISSUER,
                audience: process.env.AUDIENCE,
            });

            const requestHeaders = new Headers(req.headers);
            requestHeaders.set('userId', payload.id as string);

            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
        } catch (error) {
            console.error('[MIDDLEWARE] Error: ', error);
            return NextResponse.rewrite('/api/auth/refresh');
        }
    }
}
