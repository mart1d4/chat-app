import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { headers } from "next/headers";

export async function GET(req: Request, { params }: { params: { channelId: string } }) {
    const senderId = headers().get("X-UserId") || "";
    const channelId = params.channelId;

    if (senderId === "") {
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized",
            },
            { status: 401 }
        );
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                id: senderId,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        const channel = await prisma.channel.findFirst({
            where: {
                id: channelId,
            },
        });

        if (!channel || !channel.guildId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Channel not found",
                },
                { status: 404 }
            );
        } else if (!user.guildIds.includes(channel.guildId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not in this guild",
                },
                { status: 401 }
            );
        }

        const invites = await prisma.invite.findMany({
            where: {
                channelId: channelId,
            },
            include: {
                guild: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        ownerId: true,
                    },
                },
                channel: {
                    select: {
                        id: true,
                        type: true,
                        name: true,
                    },
                },
                inviter: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                invites: invites,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(`[ERROR] /api/channels/${channelId}/invites`, error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}