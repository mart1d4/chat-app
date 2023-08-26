import { decryptMessage } from '@/lib/encryption';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';

export async function GET(req: Request, { params }: { params: { channelId: string } }) {
    const senderId = headers().get('X-UserId') || '';
    const channelId = params.channelId;

    try {
        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId,
            },
            include: {
                messages: {
                    where: {
                        pinned: { not: null },
                    },
                    orderBy: {
                        pinned: 'desc',
                    },
                    include: {
                        author: {
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
                                friendIds: true,
                                createdAt: true,
                            },
                        },
                        messageReference: {
                            include: {
                                author: {
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
                                        friendIds: true,
                                        createdAt: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        const user = await prisma.user.findUnique({
            where: {
                id: senderId,
            },
            select: {
                guildIds: true,
            },
        });

        if (!channel || !user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Channel or user not found',
                },
                { status: 404 }
            );
        }

        if (!channel.recipientIds.includes(senderId) && !user.guildIds.includes(channel?.guildId || '')) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You are not in this channel',
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully retrieved pinned messages',
                pinned: channel.messages.map((message) => {
                    return {
                        ...message,
                        content: decryptMessage(message.content),
                    };
                }),
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
