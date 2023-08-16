import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { cookies } from 'next/headers';
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

        const accessSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

        const accessToken = await new SignJWT({ id: user.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1h')
            .setIssuer(process.env.ISSUER as string)
            .setAudience(process.env.ISSUER as string)
            .sign(accessSecret);

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully refreshed token.',
                token: accessToken,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(`[REFRESH] ${error}`);
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong.',
            },
            { status: 500 }
        );
    }
}
