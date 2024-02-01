import pusher from "@/lib/pusher/server-connection";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db/db";

export async function POST(
    req: Request,
    { params }: { params: { channelId: string; messageId: string } }
) {
    const senderId = headers().get("X-UserId") || "";
    const { channelId, messageId } = params;

    try {
        const message = await db
            .updateTable("messages")
            .set({ pinned: new Date() })
            .where("id", "=", messageId)
            .where("authorId", "=", senderId)
            .executeTakeFirst();

        if (!message) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Message not found",
                },
                { status: 404 }
            );
        }

        await pusher.trigger("chat-app", "message-edited", {
            channelId: channelId,
            message: message,
        });

        const pinMessage = await db
            .insertInto("messages")
            .values({
                type: 7,
                authorId: senderId,
                channelId: channelId,
                messageReferenceId: messageId,
            })
            .executeTakeFirst();

        await pusher.trigger("chat-app", "message-sent", {
            channelId: channelId,
            message: pinMessage,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Successfully pinned message",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "[ERROR] /api/channels/[channelId]/messages/[messageId]/pin/route.tsx",
            error
        );
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { channelId: string; messageId: string } }
) {
    const senderId = headers().get("X-UserId") || "";
    const { channelId, messageId } = params;

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
        console.error(
            "[ERROR] /api/channels/[channelId]/messages/[messageId]/pin/route.tsx",
            error
        );
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
