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
                        recipientIds: true,
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

export async function POST(req: Request, { params }: { params: { channelId: string } }) {
    const senderId = headers().get("X-UserId") || "";
    const channelId = params.channelId;
    const { maxUses, maxAge, temporary } = await req.json();

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
            select: {
                id: true,
                guildId: true,
            },
        });

        if (!channel) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Guild not found",
                },
                { status: 404 }
            );
        } else if (!user.channelIds.includes(channel.id) && !user.guildIds.includes(channel.guildId || "")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not in this channel",
                },
                { status: 401 }
            );
        }

        // Search for same invite, otherwise create one
        const invite = await prisma.invite.findFirst({
            where: {
                channelId: channelId,
                maxUses: maxUses,
                maxAge: maxAge,
                temporary: temporary,
                inviterId: senderId,
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
                        recipientIds: true,
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

        if (invite) {
            return NextResponse.json(
                {
                    success: true,
                    invite: invite,
                },
                { status: 200 }
            );
        } else {
            const newInvite = await prisma.invite.create({
                data: {
                    channelId: channelId,
                    guildId: channel.guildId,
                    maxUses: maxUses,
                    maxAge: maxAge,
                    temporary: temporary,
                    inviterId: senderId,
                    code: Math.random().toString(36).substring(2, 10),
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
                            recipientIds: true,
                        },
                    },
                },
            });

            return NextResponse.json(
                {
                    success: true,
                    invite: newInvite,
                },
                { status: 200 }
            );
        }
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
