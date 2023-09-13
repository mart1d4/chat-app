import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { headers } from "next/headers";

export async function POST(req: Request, { params }: { params: { guildId: string } }) {
    const senderId = headers().get("X-UserId") || "";
    const guildId = params.guildId;
    const { channelId, maxUses, maxAge, temporary } = await req.json();

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

        const guild = await prisma.guild.findFirst({
            where: {
                id: guildId,
            },
            select: {
                id: true,
                channels: {
                    select: {
                        id: true,
                        type: true,
                    },
                },
            },
        });

        if (!guild) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Guild not found",
                },
                { status: 404 }
            );
        } else if (!user.guildIds.includes(guild.id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not in this guild",
                },
                { status: 401 }
            );
        }

        // Search for same invite, otherwise create one
        const invite = await prisma.invite.findFirst({
            where: {
                channelId: channelId || guild.channels.find((c) => c.type === 3)?.id,
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
                    channelId: channelId || guild.channels.find((c) => c.type === 3)?.id,
                    guildId: guildId,
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
