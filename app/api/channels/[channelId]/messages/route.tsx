import pusher from '@/lib/pusher/api-connection';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';

export async function GET(req: Request, { params }: { params: { channelId: string } }) {
    const channelId = params.channelId;
    const skip = 0;
    const limit = 500;

    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    try {
        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId,
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                    skip: skip,
                    take: limit,
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

        if (!channel) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Channel not found',
                },
                { status: 404 }
            );
        }

        if (!channel.recipientIds.includes(senderId)) {
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
                message: 'Successfully retrieved messages',
                messages: channel.messages,
                hasMore: channel.messages.length - skip > limit,
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

export async function POST(req: Request, { params }: { params: { channelId: string } }) {
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    const channelId = params.channelId;
    const { message } = await req.json();

    if (!message || (!message.content && !message.attachments && !message.embeds)) {
        return NextResponse.json(
            {
                success: false,
                message: 'Message is required',
            },
            { status: 400 }
        );
    }

    try {
        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId,
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

        if (message.messageReference !== null) {
            const messageRef = await prisma.message.findUnique({
                where: {
                    id: message.messageReference,
                },
            });

            if (!messageRef) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Referenced message not found',
                    },
                    { status: 404 }
                );
            }
        }

        let newMessage;
        if (message.messageReference !== null) {
            newMessage = await prisma.message.create({
                data: {
                    type: message.messageReference ? 'REPLY' : 'DEFAULT',
                    content: message.content,
                    attachments: message.attachments,
                    embeds: message.embeds,
                    mentionEveryone: message.mentionEveryone,
                    mentionChannelIds: message.mentionChannelIds,
                    mentionRoleIds: message.mentionRoleIds,
                    mentionUserIds: message.mentionUserIds,
                    author: {
                        connect: { id: senderId },
                    },
                    channel: {
                        connect: { id: channelId },
                    },
                    messageReference: {
                        connect: { id: message.messageReference },
                    },
                },
            });
        } else {
            newMessage = await prisma.message.create({
                data: {
                    type: message.messageReference ? 'REPLY' : 'DEFAULT',
                    content: message.content,
                    attachments: message.attachments,
                    embeds: message.embeds,
                    mentionEveryone: message.mentionEveryone,
                    mentionChannelIds: message.mentionChannelIds,
                    mentionRoleIds: message.mentionRoleIds,
                    mentionUserIds: message.mentionUserIds,
                    author: {
                        connect: { id: senderId },
                    },
                    channel: {
                        connect: { id: channelId },
                    },
                },
            });
        }

        if (channel.type === 'DM') {
            // If the recipient has hidden the channel, unhide it
            const recipientId = channel.recipientIds.find((id) => id !== senderId);
            const recipient = await prisma.user.findUnique({
                where: {
                    id: recipientId,
                },
                select: {
                    hiddenChannelIds: true,
                },
            });

            if (recipient?.hiddenChannelIds.includes(channelId)) {
                await prisma.user.update({
                    where: {
                        id: recipientId,
                    },
                    data: {
                        hiddenChannelIds: {
                            set: recipient.hiddenChannelIds.filter((id) => id !== channelId),
                        },
                    },
                });

                await pusher.trigger('chat-app', 'channel-created', {
                    recipients: [recipientId],
                    channel: channel,
                });
            }
        }

        const messageToSend = await prisma.message.findUnique({
            where: {
                id: newMessage.id,
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

        await pusher.trigger('chat-app', 'message-sent', {
            channelId: channelId,
            message: messageToSend,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully sent message',
                data: {
                    message: messageToSend,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);

        if (message.attachments) {
            message.attachments.forEach(async (attachment: any) => {
                await fetch(`https://api.uploadcare.com/files/${attachment.id}/storage/`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Uploadcare.Simple ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
                        Accept: 'application/vnd.uploadcare-v0.7+json',
                    },
                });
            });
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong.',
            },
            { status: 500 }
        );
    }
}
