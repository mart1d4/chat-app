import { defaultPermissions } from '@/lib/permissions/data';
import pusher from '@/lib/pusher/api-connection';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';

export async function POST(req: Request) {
    const senderId = headers().get('userId') || '';
    const { name, icon } = await req.json();

    if (senderId === '') {
        return NextResponse.json(
            {
                success: false,
                message: 'Unauthorized',
            },
            { status: 401 }
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: senderId,
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

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Unauthorized',
                },
                { status: 401 }
            );
        }

        const guild = await prisma.guild.create({
            data: {
                name: name,
                icon: icon,
                ownerId: user.id,
            },
        });

        const role = await prisma.role.create({
            data: {
                id: guild.id,
                name: 'everyone',
                position: 0,
                hoist: false,
                mentionable: false,
                permissions: defaultPermissions,
                guild: {
                    connect: {
                        id: guild.id,
                    },
                },
            },
        });

        const memberObject = {
            userId: user.id,
            permissions: defaultPermissions,
            joinedAt: new Date(),
        };

        const textCategory = await prisma.channel.create({
            data: {
                type: 'GUILD_CATEGORY',
                name: 'Text Channels',
                position: 0,
                guild: {
                    connect: {
                        id: guild.id,
                    },
                },
            },
        });

        const voiceCategory = await prisma.channel.create({
            data: {
                type: 'GUILD_CATEGORY',
                name: 'Voice Channels',
                position: 2,
                guild: {
                    connect: {
                        id: guild.id,
                    },
                },
            },
        });

        const textChannel = await prisma.channel.create({
            data: {
                type: 'GUILD_TEXT',
                name: 'general',
                position: 1,
                parentId: textCategory.id,
                guild: {
                    connect: {
                        id: guild.id,
                    },
                },
            },
        });

        const voiceChannel = await prisma.channel.create({
            data: {
                type: 'GUILD_VOICE',
                name: 'General',
                position: 3,
                parentId: voiceCategory.id,
                guild: {
                    connect: {
                        id: guild.id,
                    },
                },
            },
        });

        await prisma.guild.update({
            where: {
                id: guild.id,
            },
            data: {
                roles: {
                    connect: {
                        id: role.id,
                    },
                },
                members: {
                    push: memberObject,
                },
                systemChannelId: textChannel.id,
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

        await pusher.trigger('chat-app', 'guild-created', {
            userId: user.id,
            guild: {
                ...guild,
                channels: [textCategory, textChannel, voiceCategory, voiceChannel],
                roles: [role],
                rawMembers: [user],
                members: [memberObject],
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Guild created.',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);

        if (icon) {
            await fetch(`https://api.uploadcare.com/files/${icon}/storage/`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Uploadcare.Simple ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
                    Accept: 'application/vnd.uploadcare-v0.7+json',
                },
            });
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong.',
            },
            { status: 500 }
        );
    }
}
