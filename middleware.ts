import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api)(.*)'],
};

const allowedPaths = ['/', '/download'];

export async function middleware(req: NextRequest) {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    console.log('[MIDDLEWARE] Token: ', token);
    const { pathname } = req.nextUrl;

    // Return early with 200 for CORS preflight
    if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 200,
        });
    }

    if (pathname.startsWith('/api/auth') || allowedPaths.includes(pathname)) {
        return NextResponse.next();
    } else if (pathname.startsWith('/api')) {
        if (!token) {
            return new NextResponse(null, {
                status: 401,
            });
        } else {
            try {
                const tokenSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

                const { payload } = await jwtVerify(token, tokenSecret, {
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
                return new NextResponse(null, {
                    status: 401,
                });
            }
        }
    }

    return NextResponse.next();
}
