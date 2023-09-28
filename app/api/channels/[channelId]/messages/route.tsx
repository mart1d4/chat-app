import { decryptMessage, encryptMessage } from "@/lib/encryption";
import pusher from "@/lib/pusher/server-connection";
import { removeImage } from "@/lib/api/cdn";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { headers } from "next/headers";

export async function GET(req: Request, { params }: { params: { channelId: string } }) {
    const senderId = headers().get("X-UserId") || "";
    const channelId = params.channelId;
    const { skip, limit } = { skip: 0, limit: 500 };

    try {
        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId,
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "asc",
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
                                friendIds: true,
                                createdAt: true,
                            },
                        },
                    },
                },
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
                    message: "Channel not found",
                },
                { status: 404 }
            );
        }

        if (!channel.recipientIds.includes(senderId) && !sender.guildIds.includes(channel?.guildId ?? "")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not in this channel",
                },
                { status: 401 }
            );
        }

        const messages = channel.messages.map((message) => {
            return {
                ...message,
                content: decryptMessage(message.content),
                messageReference: {
                    ...message.messageReference,
                    content: decryptMessage(message.messageReference?.content ?? ""),
                },
            };
        });

        return NextResponse.json(
            {
                success: true,
                message: "Successfully retrieved messages",
                messages: messages,
                hasMore: channel.messages.length - skip > limit,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(`[ERROR] /api/channels/[channelId]/messages/route.tsx: ${error}`);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}

export async function POST(req: Request, { params }: { params: { channelId: string } }) {
    const senderId = headers().get("X-UserId") || "";

    const channelId = params.channelId;
    const { message } = await req.json();

    if (!message || (!message.content && !message.attachments && !message.embeds)) {
        return NextResponse.json(
            {
                success: false,
                message: "Message is required",
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
                guildId: true,
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
                    message: "Channel or sender not found",
                },
                { status: 404 }
            );
        }

        if (!channel.recipientIds.includes(senderId) && !sender.guildIds.includes(channel?.guildId ?? "")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not in this channel",
                },
                { status: 401 }
            );
        }

        // if dm and user is blocked
        if (channel.type === 0) {
            const userId = channel.recipientIds.find((id) => id !== senderId) ?? "";
            const isBlocked = sender.blockedUserIds.includes(userId);
            const isBlockedBy = sender.blockedByUserIds.includes(userId);

            if (isBlocked || isBlockedBy) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "You are blocked from sending messages in this channel",
                    },
                    { status: 401 }
                );
            }
        }

        if (!message.content && message.attachments.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Message can't be blank",
                },
                { status: 400 }
            );
        }

        if (message.content && message.content.length > 4000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Message must be less than 4000 characters",
                },
                { status: 400 }
            );
        }

        const prevContent = message.content;

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
                        message: "Referenced message not found",
                    },
                    { status: 404 }
                );
            }
        }

        const regex: RegExp = /<@([a-zA-Z0-9]{24})>/g;
        const mentions: string[] = (message.content?.match(regex) || []).map((match: string) => match.slice(2, -1));

        // Check if mentions are valid
        const validMentions = await prisma.user.findMany({
            where: {
                id: {
                    in: mentions,
                },
            },
            select: { id: true },
        });

        mentions.forEach((mention) => {
            if (!validMentions.find((user) => user.id === mention)) {
                // Remove invalid mentions from array
                mentions.splice(mentions.indexOf(mention), 1);
            }
        });

        let newMessage;
        if (message.messageReference !== null) {
            if (mentions.length > 0) {
                newMessage = await prisma.message.create({
                    data: {
                        type: message.messageReference ? 1 : 0,
                        content: encryptMessage(message.content),
                        attachments: message.attachments,
                        embeds: message.embeds,
                        mentionEveryone: message.mentionEveryone,
                        mentionChannelIds: message.mentionChannelIds,
                        mentionRoleIds: message.mentionRoleIds,
                        mentions: {
                            connect: mentions.map((id) => ({ id })),
                        },
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
                        type: message.messageReference ? 1 : 0,
                        content: encryptMessage(message.content),
                        attachments: message.attachments,
                        embeds: message.embeds,
                        mentionEveryone: message.mentionEveryone,
                        mentionChannelIds: message.mentionChannelIds,
                        mentionRoleIds: message.mentionRoleIds,
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
            }
        } else {
            if (mentions.length > 0) {
                newMessage = await prisma.message.create({
                    data: {
                        type: message.messageReference ? 1 : 0,
                        content: encryptMessage(message.content),
                        attachments: message.attachments,
                        embeds: message.embeds,
                        mentionEveryone: message.mentionEveryone,
                        mentionChannelIds: message.mentionChannelIds,
                        mentionRoleIds: message.mentionRoleIds,
                        mentions: {
                            connect: mentions.map((id) => ({ id })),
                        },
                        author: {
                            connect: { id: senderId },
                        },
                        channel: {
                            connect: { id: channelId },
                        },
                    },
                });
            } else {
                newMessage = await prisma.message.create({
                    data: {
                        type: message.messageReference ? 1 : 0,
                        content: encryptMessage(message.content),
                        attachments: message.attachments,
                        embeds: message.embeds,
                        mentionEveryone: message.mentionEveryone,
                        mentionChannelIds: message.mentionChannelIds,
                        mentionRoleIds: message.mentionRoleIds,
                        author: {
                            connect: { id: senderId },
                        },
                        channel: {
                            connect: { id: channelId },
                        },
                    },
                });
            }
        }

        await prisma.channel.update({
            where: {
                id: channelId,
            },
            data: {
                updatedAt: new Date(),
            },
        });

        if (channel.type === 0) {
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

                await pusher.trigger("chat-app", "channel-created", {
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

        await pusher.trigger("chat-app", "message-sent", {
            channelId: channelId,
            message: {
                ...messageToSend,
                content: prevContent,
                messageReference: {
                    ...messageToSend?.messageReference,
                    content: decryptMessage(messageToSend?.messageReference?.content ?? ""),
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Successfully sent message",
                data: {
                    message: {
                        ...messageToSend,
                        content: prevContent,
                        messageReference: {
                            ...messageToSend?.messageReference,
                            content: decryptMessage(messageToSend?.messageReference?.content ?? ""),
                        },
                    },
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(`[ERROR] /api/channels/[channelId]/messages/route.tsx: ${error}`);

        if (message.attachments) {
            message.attachments.forEach(async (attachment: TAttachment) => {
                await removeImage(attachment.id);
            });
        }

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
