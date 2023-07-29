import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';

export async function POST(req: Request): Promise<NextResponse> {
    const { requesterId } = await req.json();

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: requesterId,
            },
            select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                banner: true,
                primaryColor: true,
                accentColor: true,
                description: true,
                customStatus: true,
                status: true,
                guildIds: true,
                channelIds: true,
                hiddenChannelIds: true,
                friendIds: true,
                blockedUserIds: true,
                blockedByUserIds: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found.',
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                user: user,
            },
            { status: 200 }
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
