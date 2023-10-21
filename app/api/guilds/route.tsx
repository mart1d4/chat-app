import { defaultPermissions } from "@/lib/permissions/data";
import pusher from "@/lib/pusher/server-connection";
import { removeImage } from "@/lib/cdn";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { headers } from "next/headers";

export async function POST(req: Request) {
    const senderId = headers().get("X-UserId") || "";
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
                    message: "Unauthorized",
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
                name: "everyone",
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
                type: 4,
                name: "Text Channels",
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
                type: 4,
                name: "Voice Channels",
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
                type: 2,
                name: "general",
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
                type: 3,
                name: "General",
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

        await pusher.trigger("chat-app", "guild-update", {
            type: "GUILD_ADDED",
            guild: {
                ...guild,
                channels: [textCategory, textChannel, voiceCategory, voiceChannel],
                systemChannelId: textChannel.id,
                roles: [role],
                rawMembers: [user],
                rawMemberIds: [user.id],
                members: [memberObject],
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Guild created.",
                guildId: guild.id,
                channelId: textChannel.id,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(`[ERROR] /api/guilds/create: ${error}`);
        if (icon) await removeImage(icon);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
