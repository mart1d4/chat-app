import pusher from '@/lib/pusher/api-connection';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';

export async function POST(req: Request, { params }: { params: { channelId: string; messageId: string } }) {
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    const channelId = params.channelId;
    const messageId = params.messageId;

    try {
        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId,
            },
        });

        const sender = await prisma.user.findUnique({
            where: {
                id: senderId,
            },
        });

        if (!channel || !sender) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Channel or sender not found',
                },
                {
                    status: 404,
                }
            );
        }

        const message = await prisma.message.findUnique({
            where: {
                id: messageId,
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
        });

        if (!message) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Message not found',
                },
                {
                    status: 404,
                }
            );
        }

        await prisma.message.update({
            where: {
                id: messageId,
            },
            data: {
                pinned: new Date(),
            },
        });

        await pusher.trigger('chat-app', 'message-pinned', {
            channelId: channelId,
            message: message,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully sent message',
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong.',
            },
            {
                status: 500,
            }
        );
    }
}

export async function DELETE(req: Request, { params }: { params: { channelId: string; messageId: string } }) {
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    const channelId = params.channelId;
    const messageId = params.messageId;

    try {
        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId,
            },
        });

        const sender = await prisma.user.findUnique({
            where: {
                id: senderId,
            },
        });

        if (!channel || !sender) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Channel or sender not found',
                },
                {
                    status: 404,
                }
            );
        }

        await prisma.message.update({
            where: {
                id: messageId,
            },
            data: {
                pinned: null,
            },
        });

        await pusher.trigger('chat-app', 'message-unpinned', {
            channelId: channelId,
            messageId: messageId,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully sent message',
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong.',
            },
            {
                status: 500,
            }
        );
    }
}
