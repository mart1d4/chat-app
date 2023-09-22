import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";

export async function POST(req: Request): Promise<NextResponse> {
    const { token, guildId, channelId } = await req.json();

    if (!guildId || !token) {
        return NextResponse.json(
            {
                success: false,
                message: "Bad request.",
            },
            { status: 400 }
        );
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                refreshTokens: {
                    has: token,
                },
            },
            select: {
                id: true,
                guildIds: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: true,
                    user: null,
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
            },
        });

        if (!guild || !user.guildIds.includes(guild.id)) {
            return NextResponse.json(
                {
                    success: true,
                    guild: null,
                },
                { status: 200 }
            );
        }

        if (!channelId) {
            const firstChannel = await prisma.channel.findFirst({
                where: {
                    guildId: guild.id,
                    type: 2,
                },
                select: {
                    id: true,
                },
            });

            return NextResponse.json(
                {
                    success: true,
                    channelId: firstChannel ? firstChannel.id : guild.id,
                },
                { status: 200 }
            );
        }

        const requestedChannel = await prisma.channel.findUnique({
            where: {
                id: channelId,
            },
            select: {
                id: true,
            },
        });

        if (!requestedChannel) {
            const firstChannel = await prisma.channel.findFirst({
                where: {
                    guildId: guild.id,
                    type: 2,
                },
                select: {
                    id: true,
                },
            });

            return NextResponse.json(
                {
                    success: true,
                    channelId: firstChannel ? firstChannel.id : guild.id,
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                {
                    success: true,
                    channelId: requestedChannel.id,
                },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error(`[REFRESH] ${error}`);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
