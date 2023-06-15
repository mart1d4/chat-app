import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';
import Channels from 'pusher';

export async function PUT(
    req: Request,
    { params }: { params: { channelId: string; messageId: string } }
) {
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    const channelId = params.channelId;
    const messageId = params.messageId;
    const { content } = await req.json();

    if (!content) {
        return NextResponse.json(
            {
                success: false,
                message: 'Content are required',
            },
            {
                status: 400,
            }
        );
    }

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
                content: String(content),
                edited: true,
            },
        });

        const messageToSend = {
            ...message,
            content: String(content),
            edited: true,
        };

        const channels = new Channels({
            appId: process.env.PUSHER_APP_ID as string,
            key: process.env.PUSHER_KEY as string,
            secret: process.env.PUSHER_SECRET as string,
            cluster: process.env.PUSHER_CLUSTER as string,
        });

        channels &&
            channels.trigger('chat-app', `message-edited`, {
                channel: channelId,
                message: messageToSend,
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

export async function DELETE(
    req: Request,
    { params }: { params: { channelId: string; messageId: string } }
) {
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

        await prisma.message.delete({
            where: {
                id: messageId,
            },
        });

        const channels = new Channels({
            appId: process.env.PUSHER_APP_ID as string,
            key: process.env.PUSHER_KEY as string,
            secret: process.env.PUSHER_SECRET as string,
            cluster: process.env.PUSHER_CLUSTER as string,
        });

        channels &&
            channels.trigger('chat-app', `message-deleted`, {
                channel: channelId,
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
