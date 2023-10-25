import pusher from "@/lib/pusher/server-connection";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getUser } from "@/lib/db/helpers";

export async function PUT(req: Request, { params }: { params: { channelId: string } }) {
    const senderId = headers().get("X-UserId") || "";
    const channelId = params.channelId;
    const { name, icon } = await req.json();

    if (senderId === "") {
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized",
            },
            { status: 401 }
        );
    }

    if (!name && !icon) {
        return NextResponse.json(
            {
                success: false,
                message: "No changes were made",
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
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request, { params }: { params: { channelId: string } }) {
    const userId = parseInt(headers().get("X-UserId") || "");
    const { channelId } = params;

    try {
        const user = await getUser({
            select: {
                id: true,
            },
            throwOnNotFound: true,
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

        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId,
            },
            select: {
                id: true,
                type: true,
                position: true,
                parentId: true,
                recipientIds: true,
                guildId: true,
            },
        });

        const guild = await prisma.guild.findUnique({
            where: {
                id: channel?.guildId as string,
            },
            select: {
                ownerId: true,
                rawMemberIds: true,
            },
        });

        if (!channel || !channel.guildId || !guild?.rawMemberIds.includes(userId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Channel not found",
                },
                { status: 404 }
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
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}
