import pusher from "@/lib/pusher/server-connection";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { headers } from "next/headers";
import { removeImage } from "@/lib/api/cdn";

export async function DELETE(req: Request, { params }: { params: { guildId: string } }) {
    const senderId = headers().get("X-UserId") || "";
    const guildId = params.guildId;

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

        const guild = await prisma.guild.findUnique({
            where: {
                id: guildId,
            },
            select: {
                id: true,
                ownerId: true,
                icon: true,
                channels: {
                    select: {
                        id: true,
                    },
                },
                rawMemberIds: true,
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

        if (guild.ownerId !== senderId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        if (guild.icon) await removeImage(guild.icon);

        const messageWithImages = await prisma.message.findMany({
            where: {
                channelId: {
                    in: guild.channels.map((channel) => channel.id),
                },
                NOT: {
                    attachments: {
                        equals: [],
                    },
                },
            },
            select: {
                attachments: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        // Delete all attachments from cdn before deleting guild
        messageWithImages.forEach(async (message) => {
            message.attachments.forEach(async (attachment) => {
                await removeImage(attachment.id);
            });
        });

        await prisma.guild.delete({
            where: {
                id: guildId,
            },
        });

        await pusher.trigger("chat-app", "guild-update", {
            type: "GUILD_DELETED",
            guild: {
                id: guildId,
                rawMemberIds: guild.rawMemberIds,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Guild deleted",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(`[ERROR] /api/guilds/${guildId}/delete: ${error}`);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
