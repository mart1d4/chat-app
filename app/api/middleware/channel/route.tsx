import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';

export async function POST(req: Request): Promise<NextResponse> {
    const { guildId, channelId } = await req.json();

    if (!guildId) {
        return NextResponse.json(
            {
                success: false,
                message: 'A guild id is required',
            },
            { status: 400 }
        );
    }

    try {
        const guild = await prisma.guild.findUnique({
            where: {
                id: guildId
            },
            select: {
                id: true,
            },
        });
        
        if (!guild) {
            return NextResponse.json(
                {
                    success: true,
                    channelId: null,
                },
                { status: 200 }
            );
        }

        if (!channelId) {

            const firstChannel = await prisma.channel.findFirst({
                where: {
                    guildId: guild.id,
                    type: 2
                },
                select: {
                    id: true,
                },
            })

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
                id: channelId
            },
            select: {
                id: true,
            },
        });

        if (!requestedChannel) {
            const firstChannel = await prisma.channel.findFirst({
                where: {
                    guildId: guild.id,
                    type: 2
                },
                select: {
                    id: true,
                },
            })

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
                message: 'Something went wrong.',
            },
            { status: 500 }
        );
    }
}
