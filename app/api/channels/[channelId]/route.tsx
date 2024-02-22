import { canUserManageChannel, getUser } from "@/lib/db/helpers";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { catchError } from "@/lib/api";

export async function PUT(req: NextRequest, { params }: { params: { channelId: string } }) {
    const senderId = parseInt(headers().get("X-UserId") || "0");
    const { name, icon } = await req.json();
    const { channelId } = params;

    if (!name && !icon) {
        return NextResponse.json(
            {
                success: false,
                message: "A name or icon is required.",
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
                name: true,
                icon: true,
                recipientIds: true,
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

        if (!channel.recipientIds.includes(senderId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not in this channel",
                },
                { status: 401 }
            );
        }

        if (channel.type !== 1) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You cannot edit this channel",
                },
                { status: 401 }
            );
        }

        const updatedChannel = await prisma.channel.update({
            where: {
                id: channelId,
            },
            data: {
                name: name ?? channel.name,
                icon: icon ?? channel.icon,
            },
            select: {
                name: true,
                icon: true,
            },
        });

        await pusher.trigger("chat-app", "guild-update", {
            type: "CHANNEL_UPDATED",
            channelId: channelId,
            name: updatedChannel.name,
            icon: updatedChannel.icon,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Successfully retrieved channel",
                channel: channel,
            },
            { status: 200 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { channelId: string } }) {
    const userId = parseInt(headers().get("X-UserId") || "0");
    const { channelId } = params;

    try {
        const user = await getUser({
            select: {
                id: true,
            },
            throwOnNotFound: true,
        });

        if (!(await canUserManageChannel(user.id, channelId))) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You cannot delete this channel",
                },
                { status: 401 }
            );
        }

        if (channel.type !== 4) {
            await prisma.channel.delete({
                where: {
                    id: channelId,
                },
            });

            await prisma.channel.updateMany({
                where: {
                    guildId: channel.guildId,
                    position: {
                        gt: channel.position as number,
                    },
                },
                data: {
                    position: {
                        decrement: 1,
                    },
                },
            });
        } else {
            const textChannels = await prisma.channel.count({
                where: {
                    guildId: channel.guildId,
                    type: 2,
                    OR: [
                        {
                            parentId: {
                                isSet: false,
                            },
                        },
                        {
                            parentId: {
                                equals: null,
                            },
                        },
                    ],
                },
            });

            const textToAdd = await prisma.channel.findMany({
                where: {
                    guildId: channel.guildId,
                    type: 2,
                    parentId: channel.id,
                },
            });

            const voiceToAdd = await prisma.channel.findMany({
                where: {
                    guildId: channel.guildId,
                    type: 3,
                    parentId: channel.id,
                },
            });

            await prisma.channel.updateMany({
                where: {
                    guildId: channel.guildId,
                    position: {
                        gte: textChannels,
                    },
                },
                data: {
                    position: {
                        increment: textToAdd.length,
                    },
                },
            });

            textToAdd.forEach(async (textChannel, index) => {
                await prisma.channel.update({
                    where: {
                        id: textChannel.id,
                    },
                    data: {
                        position: textChannels + index,
                        parentId: null,
                    },
                });
            });

            const voiceChannels = await prisma.channel.count({
                where: {
                    guildId: channel.guildId,
                    type: {
                        not: 4,
                    },
                    OR: [
                        {
                            parentId: {
                                isSet: false,
                            },
                        },
                        {
                            parentId: {
                                equals: null,
                            },
                        },
                    ],
                },
            });

            await prisma.channel.updateMany({
                where: {
                    guildId: channel.guildId,
                    position: {
                        gte: voiceChannels,
                    },
                },
                data: {
                    position: {
                        increment: voiceToAdd.length,
                    },
                },
            });

            voiceToAdd.forEach(async (voiceChannel, index) => {
                await prisma.channel.update({
                    where: {
                        id: voiceChannel.id,
                    },
                    data: {
                        position: voiceChannels + index,
                        parentId: null,
                    },
                });
            });

            await prisma.channel.delete({
                where: {
                    id: channelId,
                },
            });
        }

        await pusher.trigger("chat-app", "guild-update", {
            type: "CHANNEL_REMOVED",
            guildId: channel.guildId,
            channelId: channelId,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Successfully deleted channel",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}
