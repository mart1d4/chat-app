import pusher from "@/lib/pusher/server-connection";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req: Request, { params }: { params: { guildId: string } }) {
    const senderId = headers().get("X-UserId") || "";
    const guildId = params.guildId;
    const { name, type, categoryId, locked } = await req.json();

    if (senderId === "") {
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized",
            },
            { status: 401 }
        );
    }

    if (!name && !type) {
        return NextResponse.json(
            {
                success: false,
                message: "No changes were made",
            },
            { status: 400 }
        );
    }

    try {
        const guild = await prisma.guild.findUnique({
            where: {
                id: guildId,
            },
            select: {
                id: true,
                rawMemberIds: true,
                channels: {
                    select: {
                        id: true,
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
        }

        if (!guild.rawMemberIds.includes(senderId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const category = categoryId
            ? await prisma.channel.findUnique({ where: { id: categoryId } })
            : null;

        let channel;

        if (category) {
            const channelCount = await prisma.channel.count({
                where: {
                    parentId: category.id,
                },
            });

            if (channelCount >= 50) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Category channel limit reached",
                    },
                    { status: 400 }
                );
            }

            const textChannelCount = await prisma.channel.count({
                where: {
                    AND: [
                        {
                            parentId: category.id,
                        },
                        {
                            type: 2,
                        },
                    ],
                },
            });

            const position =
                type === 2
                    ? textChannelCount + (category.position as number) + 1
                    : channelCount + (category.position as number) + 1;

            channel = await prisma.channel.create({
                data: {
                    name: name,
                    type: type,
                    guild: {
                        connect: {
                            id: guildId,
                        },
                    },
                    position: position,
                    parentId: categoryId,
                },
            });

            await prisma.channel.updateMany({
                where: {
                    AND: [
                        {
                            id: {
                                not: channel.id,
                            },
                        },
                        {
                            guildId: guild.id,
                        },
                        {
                            position: {
                                gte: position,
                            },
                        },
                    ],
                },
                data: {
                    position: {
                        increment: 1,
                    },
                },
            });
        } else {
            const channelCount = await prisma.channel.count({
                where: {
                    guildId: guild.id,
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

            const textChannelCount = await prisma.channel.count({
                where: {
                    guildId: guild.id,
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

            const position =
                type === 4 ? guild.channels.length : type === 2 ? textChannelCount : channelCount;

            channel = await prisma.channel.create({
                data: {
                    name: name,
                    type: type,
                    guild: {
                        connect: {
                            id: guildId,
                        },
                    },
                    position: position,
                },
            });

            await prisma.channel.updateMany({
                where: {
                    AND: [
                        {
                            id: {
                                not: channel.id,
                            },
                        },
                        {
                            guildId: guild.id,
                        },
                        {
                            position: {
                                gte: position,
                            },
                        },
                    ],
                },
                data: {
                    position: {
                        increment: 1,
                    },
                },
            });
        }

        await pusher.trigger("chat-app", "guild-update", {
            guildId: guild.id,
            channel: channel,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Channel created",
                guildId: guild.id,
                channelId: channel.type === 2 ? channel.id : null,
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
