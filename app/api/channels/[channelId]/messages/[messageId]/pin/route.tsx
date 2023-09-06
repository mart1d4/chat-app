import pusher from "@/lib/pusher/server-connection";
import { decryptMessage, encryptMessage } from "@/lib/encryption";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { headers } from "next/headers";

export async function POST(req: Request, { params }: { params: { channelId: string; messageId: string } }) {
    const senderId = headers().get("X-UserId") || "";

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
                    message: "Channel or sender not found",
                },
                { status: 404 }
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
            },
        });

        if (!message) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Message not found",
                },
                { status: 404 }
            );
        } else if (message.pinned) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Message is already pinned",
                },
                { status: 400 }
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

        await pusher.trigger("chat-app", "message-edited", {
            channelId: channelId,
            message: {
                ...message,
                content: decryptMessage(message.content),
                messageReference: {
                    ...message.messageReference,
                    content: decryptMessage(message.messageReference?.content || ""),
                },
                pinned: new Date(),
            },
        });

        const pinnedNotification = await prisma.message.create({
            data: {
                type: 7,
                author: {
                    connect: {
                        id: senderId,
                    },
                },
                channel: {
                    connect: {
                        id: channelId,
                    },
                },
                messageReference: {
                    connect: {
                        id: messageId,
                    },
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
            },
        });

        await pusher.trigger("chat-app", "message-sent", {
            channelId: channelId,
            message: pinnedNotification,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Successfully pinned message",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[ERROR] /api/channels/[channelId]/messages/[messageId]/pin/route.tsx", error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request, { params }: { params: { channelId: string; messageId: string } }) {
    const senderId = headers().get("X-UserId") || "";

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
                    message: "Channel or sender not found",
                },
                { status: 404 }
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
                    message: "Message not found",
                },
                { status: 404 }
            );
        } else if (!message.pinned) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Message is not pinned",
                },
                { status: 400 }
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

        await pusher.trigger("chat-app", "message-edited", {
            channelId: channelId,
            message: {
                ...message,
                content: decryptMessage(message.content),
                messageReference: {
                    ...message.messageReference,
                    content: decryptMessage(message.messageReference?.content || ""),
                },
                pinned: null,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Successfully removed pin from message",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[ERROR] /api/channels/[channelId]/messages/[messageId]/pin/route.tsx", error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
