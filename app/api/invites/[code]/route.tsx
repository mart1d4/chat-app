import { defaultPermissions } from "@/lib/permissions/data";
import pusher from "@/lib/pusher/server-connection";
import { getInvite } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { catchError } from "@/lib/api";

export async function GET(req: Request, { params }: { params: { code: string } }) {
    const { code } = params;

    try {
        const invite = await getInvite(code);
        console.log(JSON.stringify(invite, null, 4));

        return NextResponse.json(
            {
                success: true,
                message: invite ? "Successfuly found invite" : "No invite found with that code",
                invite: invite || null,
            },
            { status: 200 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}

export async function POST(req: Request, { params }: { params: { code: string } }) {
    const senderId = headers().get("X-UserId") || "";
    const code = params.code;

    if (senderId === "") {
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized",
            },
            { status: 400 }
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
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const invite = await prisma.invite.findFirst({
            where: {
                code: code,
            },
            include: {
                guild: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        ownerId: true,
                        rawMemberIds: true,
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

        if (!invite) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid invite",
                },
                { status: 400 }
            );
        }

        if (![1, 2].includes(invite.channel.type)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid invite",
                },
                { status: 400 }
            );
        }

        if (invite.channel.type === 1) {
            if (
                invite.channel.recipientIds.includes(user.id) ||
                invite.channel.recipientIds.length >= 10
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid invite",
                    },
                    { status: 400 }
                );
            } else {
                // Create message
                const message = await prisma.message.create({
                    data: {
                        type: 2,
                        author: {
                            connect: {
                                id: invite.inviter.id,
                            },
                        },
                        channel: {
                            connect: {
                                id: invite.channel.id,
                            },
                        },
                        mentions: {
                            connect: {
                                id: user.id,
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

                const newChannel = await prisma.channel.update({
                    where: {
                        id: invite.channel.id,
                    },
                    data: {
                        recipients: {
                            connect: {
                                id: user.id,
                            },
                        },
                        updatedAt: new Date(),
                    },
                    include: {
                        recipients: {
                            orderBy: {
                                username: "asc",
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
                        },
                    },
                });

                await pusher.trigger("chat-app", "message-sent", {
                    channelId: invite.channel.id,
                    message: message,
                    notSentByAuthor: true,
                });

                await pusher.trigger("chat-app", "channel-update", {
                    type: "RECIPIENT_ADDED",
                    channel: newChannel,
                });

                return NextResponse.json(
                    {
                        success: true,
                        message: "Invite accepted",
                        channelId: invite.channel.id,
                    },
                    { status: 200 }
                );
            }
        } else {
            if (!invite.guildId) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Guild ID missing.",
                    },
                    { status: 400 }
                );
            } else if (user.guildIds.includes(invite.guildId)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Already in guild.",
                    },
                    { status: 400 }
                );
            } else {
                const guild = await prisma.guild.findFirst({
                    where: {
                        id: invite.guildId,
                    },
                    include: {
                        rawMembers: {
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
                        channels: {
                            select: {
                                id: true,
                                type: true,
                                name: true,
                                parentId: true,
                                position: true,
                            },
                        },
                    },
                });

                if (!guild) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Guild not found.",
                        },
                        { status: 400 }
                    );
                }

                const memberObject = {
                    userId: user.id,
                    permissions: defaultPermissions,
                    joinedAt: new Date(),
                };

                await prisma.guild.update({
                    where: {
                        id: guild.id,
                    },
                    data: {
                        members: {
                            push: memberObject,
                        },
                    },
                });

                await prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        guilds: {
                            connect: {
                                id: guild.id,
                            },
                        },
                    },
                });

                await pusher.trigger("chat-app", "guild-update", {
                    type: "GUILD_ADDED",
                    guild: {
                        ...guild,
                        rawMembers: [...guild.rawMembers, user],
                        rawMemberIds: [...guild.rawMemberIds, user.id],
                        members: [...guild.members, memberObject],
                    },
                });

                return NextResponse.json(
                    {
                        success: false,
                        message: "Not currently available",
                    },
                    { status: 400 }
                );
            }
        }
    } catch (error) {
        return catchError(req, error);
    }
}
