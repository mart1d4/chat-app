import pusher from '@/lib/pusher/server-connection';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';

type Params = {
    params: {
        channelId: string;
        recipientId: string;
    };
};

export async function PUT(req: Request, { params }: Params) {
    const userId = headers().get('X-UserId') || '';
    const recipientId = params.recipientId;
    const channelId = params.channelId;

    if (userId === '') {
        return NextResponse.json(
            {
                success: false,
                message: 'Unauthorized',
            },
            { status: 401 }
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                friendIds: true,
            },
        });

        const recipient = await prisma.user.findUnique({
            where: {
                id: recipientId,
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
                friendIds: true,
                createdAt: true,
            },
        });

        if (!user || !recipient) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found',
                },
                { status: 404 }
            );
        }

        if (!user.friendIds.includes(recipientId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User is not your friend',
                },
                { status: 403 }
            );
        }

        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId,
            },
            select: {
                type: true,
                recipientIds: true,
                ownerId: true,
            },
        });

        if (!channel) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Channel not found',
                },
                { status: 404 }
            );
        }

        if (channel.type !== 1) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Channel is not a group dm',
                },
                { status: 403 }
            );
        }

        if (channel.recipientIds.includes(recipientId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User is already in this channel',
                },
                { status: 403 }
            );
        }

        if (channel.recipientIds.length >= 10) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Channel is full',
                },
                { status: 403 }
            );
        }

        const newChannel = await prisma.channel.update({
            where: {
                id: channelId,
            },
            data: {
                recipients: {
                    connect: {
                        id: recipientId,
                    },
                },
            },
            select: {
                id: true,
                type: true,
                icon: true,
                ownerId: true,
                recipientIds: true,
                recipients: {
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
                createdAt: true,
                updatedAt: true,
            },
        });

        await pusher.trigger('chat-app', 'channel-recipient-add', {
            channel: newChannel,
            recipients: [channel.recipientIds, recipientId],
            recipient: recipient,
        });

        // Create message
        const message = await prisma.message.create({
            data: {
                type: 2,
                content: `<@${userId}> added <@${recipientId}> to the group.`,
                author: {
                    connect: {
                        id: userId,
                    },
                },
                channel: {
                    connect: {
                        id: channelId,
                    },
                },
                mentions: {
                    connect: [{ id: userId }, { id: recipientId }],
                },
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
                        mentions: {
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
                mentions: {
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
        });

        await prisma.channel.update({
            where: {
                id: channelId,
            },
            data: {
                updatedAt: new Date(),
            },
        });

        await pusher.trigger('chat-app', 'message-sent', {
            channelId: channelId,
            message: message,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'User added to channel',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong',
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request, { params }: Params) {
    const userId = headers().get('X-UserId') || '';
    const recipientId = params.recipientId;
    const channelId = params.channelId;

    if (userId === '') {
        return NextResponse.json(
            {
                success: false,
                message: 'Unauthorized',
            },
            { status: 401 }
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
            },
        });

        const recipient = await prisma.user.findUnique({
            where: {
                id: recipientId,
            },
            select: {
                id: true,
            },
        });

        if (!user || !recipient) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found',
                },
                { status: 404 }
            );
        }

        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId,
            },
            select: {
                type: true,
                recipientIds: true,
                ownerId: true,
            },
        });

        if (!channel) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Channel not found',
                },
                { status: 404 }
            );
        }

        if (channel.type !== 1) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Channel is not a group dm',
                },
                { status: 403 }
            );
        }

        if (!channel.recipientIds.includes(recipientId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User is not in this channel',
                },
                { status: 403 }
            );
        }

        if (channel.recipientIds.length === 1) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Cannot remove last recipient from channel',
                },
                { status: 403 }
            );
        }

        let newOwner;

        if (channel.ownerId === recipientId) {
            const randomIndex = Math.floor(Math.random() * channel.recipientIds.length - 1);
            newOwner = channel.recipientIds.filter((id) => id !== recipientId)[randomIndex];
        }

        await prisma.channel.update({
            where: {
                id: channelId,
            },
            data: {
                recipients: {
                    disconnect: {
                        id: recipientId,
                    },
                },
                ownerId: newOwner ?? channel.ownerId,
            },
            select: {
                id: true,
            },
        });

        await pusher.trigger('chat-app', 'channel-left', {
            channelId: channelId,
            recipientId: recipientId,
            recipients: channel.recipientIds,
            newOwner: newOwner,
        });

        const message = await prisma.message.create({
            data: {
                type: 3,
                content: newOwner
                    ? `<@${userId}> left the group.`
                    : `<@${userId}> removed <@${recipientId}> from the group.`,
                author: {
                    connect: {
                        id: userId,
                    },
                },
                channel: {
                    connect: {
                        id: channelId,
                    },
                },
                mentions: {
                    connect: newOwner ? [{ id: userId }] : [{ id: userId }, { id: recipientId }],
                },
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
                        mentions: {
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
                mentions: {
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
        });

        await pusher.trigger('chat-app', 'message-sent', {
            channelId: channelId,
            message: message,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Recipient removed from channel',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong',
            },
            { status: 500 }
        );
    }
}
