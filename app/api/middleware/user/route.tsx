import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';

export async function POST(req: Request): Promise<NextResponse> {
    const { token } = await req.json();

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
                channelIds: true,
                guildIds: true,
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

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully refreshed token.',
                user: user,
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
