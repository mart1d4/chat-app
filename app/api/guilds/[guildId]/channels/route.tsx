import pusher from '@/lib/pusher/api-connection';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';

export async function POST(req: Request, { params }: { params: { guildId: string } }) {
    const senderId = headers().get('userId') || '';
    const guildId = params.guildId;
    const { name, type, categoryId, locked } = await req.json();

    if (senderId === '') {
        return NextResponse.json(
            {
                success: false,
                message: 'Unauthorized',
            },
            { status: 401 }
        );
    }

    if (!name && !type) {
        return NextResponse.json(
            {
                success: false,
                message: 'No changes were made',
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
            },
        });

        if (!guild) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Guild not found',
                },
                { status: 404 }
            );
        }

        if (!guild.rawMemberIds.includes(senderId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Unauthorized',
                },
                { status: 401 }
            );
        }

        const category = categoryId ? await prisma.channel.findUnique({ where: { id: categoryId } }) : null;

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
                        message: 'Category channel limit reached',
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
                            type: 'GUILD_TEXT',
                        },
                    ],
                },
            });

            const position =
                type === 'GUILD_TEXT'
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
                    parentId: null,
                },
            });

            console.log('Total count: ' + channelCount);

            const textChannelCount = await prisma.channel.count({
                where: {
                    guildId: guild.id,
                    parentId: null,
                    type: 'GUILD_TEXT',
                },
            });

            console.log('Text count: ' + textChannelCount);

            const position = type === 'GUILD_TEXT' ? textChannelCount : channelCount;

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

        await pusher.trigger('chat-app', 'channel-create', {
            guildId: guild.id,
            channel: channel,
            redirect: channel.type === 'GUILD_TEXT',
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Channel created',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong.',
            },
            { status: 500 }
        );
    }
}
