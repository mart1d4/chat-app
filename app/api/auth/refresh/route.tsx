import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prismadb';
import { SignJWT } from 'jose';

export async function GET(req: Request): Promise<NextResponse> {
    const token = cookies().get('token')?.value;

    if (!token) {
        return NextResponse.json(
            {
                success: false,
                message: 'Unauthorized',
            },
            { status: 401 }
        );
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                refreshTokens: {
                    has: token,
                },
            },
            select: {
                id: true,
                refreshTokens: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Forbidden',
                },
                { status: 401 }
            );
        }

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                refreshTokens: {
                    set: user.refreshTokens.filter((refreshToken) => refreshToken !== token),
                },
            },
        });

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
            .setExpirationTime('1d')
            .setIssuer(process.env.ISSUER as string)
            .setAudience(process.env.ISSUER as string)
            .sign(refreshSecret);

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully refreshed token.',
                token: accessToken,
                user: user,
            },
            {
                status: 200,
                headers: {
                    'Set-Cookie': `token=${refreshToken}; path=/; HttpOnly; SameSite=Lax; Max-Age=86400; Secure`,
                },
            }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong.',
            },
            { status: 500 }
        );
    }
}
