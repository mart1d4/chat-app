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
                memberIds: true,
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

        if (!guild.memberIds.includes(senderId)) {
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
            channel = await prisma.channel.create({
                data: {
                    name: name,
                    type: type,
                    guild: {
                        connect: {
                            id: guildId,
                        },
                    },
                    position: category.children,
                    parentId: categoryId,
                },
            });

            await prisma.channel.update({
                where: {
                    id: categoryId,
                },
                data: {
                    children: {
                        increment: 1,
                    },
                },
            });
        } else {
            channel = await prisma.channel.create({
                data: {
                    name: name,
                    type: type,
                    guild: {
                        connect: {
                            id: guildId,
                        },
                    },
                    position: 0,
                },
            });
        }

        await pusher.trigger('chat-app', 'channel-create', {
            guildId: guildId,
            channel: channel,
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
