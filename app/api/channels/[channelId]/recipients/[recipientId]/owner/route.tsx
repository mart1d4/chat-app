import pusher from "@/lib/pusher/server-connection";
import { encryptMessage } from "@/lib/encryption";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

type Params = {
    params: {
        channelId: string;
        recipientId: string;
    };
};

export async function PUT(req: Request, { params }: Params) {
    const userId = parseInt(headers().get("X-UserId") || "0");
    const recipientId = params.recipientId;
    const channelId = params.channelId;

    if (userId === "") {
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized",
            },
            { status: 401 }
        );
    }

    if (userId === recipientId) {
        return NextResponse.json(
            {
                success: false,
                message: "You cannot set yourself as the owner of a channel",
            },
            { status: 403 }
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
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId,
            },
            select: {
                id: true,
                type: true,
                recipientIds: true,
                ownerId: true,
            },
        });

        if (!channel) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Channel not found",
                },
                { status: 404 }
            );
        }

        if (channel.type !== 1) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Channel is not a group dm",
                },
                { status: 403 }
            );
        }

        if (!channel.recipientIds.includes(recipientId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User is not in the channel",
                },
                { status: 403 }
            );
        }

        if (channel.ownerId !== userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You do not own this channel",
                },
                { status: 403 }
            );
        }

        await prisma.channel.update({
            where: {
                id: channelId,
            },
            data: {
                ownerId: recipientId,
            },
        });

        await pusher.trigger("chat-app", "channel-owner-change", {
            channelId: channel.id,
            ownerId: recipientId,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Owner changed successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[ERROR] /api/channels/channelId/recipients/recipientId/owner", error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}
