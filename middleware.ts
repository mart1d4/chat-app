import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api)(.*)'],
};

const allowedPaths = ['/', '/download'];

export async function middleware(req: NextRequest) {
    const requestHeaders = new Headers(req.headers);

    const token = req.headers.get('Authorization')?.split(' ')[1];
    const refreshToken = req.cookies.get('token')?.value;

    const { pathname } = req.nextUrl;

    // Return early with 200 for CORS preflight
    if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 200,
        });
    }

    if (pathname.startsWith('/api')) {
        if (pathname.startsWith('/api/auth')) return NextResponse.next();

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

                if (!payload.id) {
                    return new NextResponse(null, {
                        status: 401,
                    });
                }

                const response = await fetch(`${process.env.BASE_URL}/api/auth/api-auth`, {
                    method: 'POST',
                    body: JSON.stringify({ requesterId: payload.id }),
                }).then((res) => res.json());

                if (!response.success) {
                    return new NextResponse(null, {
                        status: 401,
                    });
                } else {
                    requestHeaders.set('X-UserId', response.user.id);
                    return NextResponse.next({
                        request: {
                            headers: requestHeaders,
                        },
                    });
                }
            } catch (error) {
                return new NextResponse(null, {
                    status: 401,
                });
            }
        }
    }

    return NextResponse.next();
}
