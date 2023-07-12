import pusher from '@/lib/pusher/api-connection';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';

export async function PUT(req: Request, { params }: { params: { channelId: string; messageId: string } }) {
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    const channelId = params.channelId;
    const messageId = params.messageId;
    const { content, attachments } = await req.json();

    if (content !== undefined && typeof content !== 'string' && content !== null) {
        return NextResponse.json(
            {
                success: false,
                message: 'Content must be a string or null',
            },
            { status: 400 }
        );
    }

    if (attachments !== undefined && !Array.isArray(attachments)) {
        return NextResponse.json(
            {
                success: false,
                message: 'Attachments must be an array',
            },
            { status: 400 }
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
                { status: 404 }
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
                { status: 404 }
            );
        }

        await prisma.message.update({
            where: {
                id: messageId,
            },
            data: {
                content: content,
                attachments: attachments,
                edited: true,
            },
        });

        if (message.attachments !== attachments) {
            const toDelete = message.attachments?.filter((attachment) => !attachments?.includes(attachment));

            if (toDelete.length > 0) {
                toDelete.forEach(async (attachment) => {
                    await fetch(`https://api.uploadcare.com/files/${attachment}/storage/`, {
                        method: 'DELETE',
                        headers: {
                            Authorization: `Uploadcare.Simple ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
                            Accept: 'application/vnd.uploadcare-v0.7+json',
                        },
                    });
                });
            }
        }

        const messageToSend = await prisma.message.findUnique({
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

        await pusher.trigger('chat-app', 'message-edited', {
            channelId: channelId,
            message: messageToSend,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully updated message',
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
                { status: 404 }
            );
        }

        if (!sender.channelIds.includes(channelId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You are not in this channel',
                },
                { status: 403 }
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
                { status: 404 }
            );
        }

        if (message.authorId !== senderId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You are not the author of this message',
                },
                { status: 403 }
            );
        }

        await prisma.message.updateMany({
            where: {
                messageReferenceId: messageId,
            },
            data: {
                messageReferenceId: null,
            },
        });

        if (message.attachments.length > 0) {
            message.attachments.forEach(async (attachment) => {
                await fetch(`https://api.uploadcare.com/files/${attachment}/storage/`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Uploadcare.Simple ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
                        Accept: 'application/vnd.uploadcare-v0.7+json',
                    },
                });
            });
        }

        await prisma.message.delete({
            where: {
                id: messageId,
            },
        });

        await pusher.trigger('chat-app', 'message-deleted', {
            channelId: channelId,
            messageId: messageId,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully sent message',
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
