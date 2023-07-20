import pusher from '@/lib/pusher/api-connection';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';

export async function GET(req: Request, { params }: { params: { channelId: string } }) {
    const senderId = headers().get('userId') || '';
    const channelId = params.channelId;

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
        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId,
            },
            include: {
                recipients: {
                    orderBy: {
                        username: 'asc',
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
                },
            },
        });

        if (!channel) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Channel not found',
                },
                { status: 404 }
            );
        }

        if (!channel.recipientIds.includes(senderId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You are not in this channel',
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully retrieved channel',
                channel: channel,
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

export async function PUT(req: Request, { params }: { params: { channelId: string } }) {
    const senderId = headers().get('userId') || '';
    const channelId = params.channelId;
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

    if (!name && !icon) {
        return NextResponse.json(
            {
                success: false,
                message: 'No changes were made',
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
                    message: 'Channel not found',
                },
                { status: 404 }
            );
        }

        if (!channel.recipientIds.includes(senderId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You are not in this channel',
                },
                { status: 401 }
            );
        }

        if (channel.type !== 'GROUP_DM') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You cannot edit this channel',
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

        await pusher.trigger('chat-app', 'channel-updated', {
            channelId: channelId,
            name: updatedChannel.name,
            icon: updatedChannel.icon,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully retrieved channel',
                channel: channel,
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
