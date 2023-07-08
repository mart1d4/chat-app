import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};

const allowedPaths = ['/', '/download'];
const authPaths = ['/login', '/register', '/reset-password'];

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const { pathname } = req.nextUrl;

    // If request is OPTIONS, return early with 200
    // (CORS preflight for external domains)
    if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 200,
        });
    }

    if (pathname.startsWith('/api/auth') || allowedPaths.includes(pathname)) {
        return NextResponse.next();
    }

    if (!token) {
        if (authPaths.includes(pathname)) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
        const tokenSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);

        const { payload } = await jwtVerify(token, tokenSecret, {
            issuer: process.env.ISSUER,
            audience: process.env.AUDIENCE,
        });

        if (!pathname.startsWith('/api') && !pathname.startsWith('/channels/me')) {
            return NextResponse.redirect(new URL('/channels/me', req.url));
        }

        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('userId', payload.id as string);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } catch (error) {
        console.error('[MIDDLEWARE] Error: ', error);
        return NextResponse.redirect(new URL('/login', req.url));
    }
}
