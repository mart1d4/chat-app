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
    const { pathname } = req.nextUrl;

    if (nonProtectedRoutes.includes(pathname) || pathname.startsWith('/_next')) {
        return NextResponse.next();
    }

    if (!authorization) {
        return NextResponse.json(
            {
                success: false,
                message: 'No authorization header',
            },
            {
                status: 401,
            }
        );
    } else {
        const token = authorization.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No token provided',
                },
                {
                    status: 401,
                }
            );
        } else {
            try {
                console.log('token: ', token);
                const { payload, protectedHeader } = await jwtVerify(
                    token,
                    new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET),
                    {
                        issuer: 'http://localhost:3000',
                        audience: 'http://localhost:3000',
                    }
                );

                const requestHeaders = new Headers(req.headers);
                requestHeaders.set('userId', payload?.id as string);

                return NextResponse.next({
                    request: {
                        headers: requestHeaders,
                    },
                });
            } catch (error) {
                console.error('Middleware error: ', error);
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Invalid token',
                    },
                    {
                        status: 401,
                    }
                );
            }
        }
    }
}
