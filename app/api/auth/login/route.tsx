import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

export async function POST(req: Request): Promise<NextResponse> {
    const { username, password } = await req.json();

    if (!username || !password) {
        return NextResponse.json(
            {
                success: false,
                message: 'Login or password is invalid',
            },
            { status: 400 }
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
            select: {
                id: true,
                username: true,
                password: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Login or password is invalid',
                },
                { status: 401 }
            );
        }

        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const accessSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
            const refreshSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);

            const accessToken = await new SignJWT({ id: user.id })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('1h')
                .setIssuer(process.env.ISSUER as string)
                .setAudience(process.env.ISSUER as string)
                .sign(accessSecret);

            const refreshToken = await new SignJWT({ id: user.id })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('30d')
                .setIssuer(process.env.ISSUER as string)
                .setAudience(process.env.ISSUER as string)
                .sign(refreshSecret);

            // Save refresh token to database
            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    refreshTokens: {
                        push: refreshToken,
                    },
                },
                select: {
                    id: true,
                },
            });

            return NextResponse.json(
                {
                    success: true,
                    message: 'Login successful',
                    token: accessToken,
                },
                {
                    status: 200,
                    headers: {
                        'Set-Cookie': `token=${refreshToken}; path=/; HttpOnly; SameSite=Lax; Max-Age=86400; Secure`,
                    },
                }
            );
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Login or password is invalid',
                },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error(`[LOGIN] ${error}`);
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong.',
            },
            { status: 500 }
        );
    }
}
