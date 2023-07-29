import pusher from '@/lib/pusher/api-connection';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';

type Params = {
    params: {
        channelId: string;
    };
};

export async function DELETE(req: Request, { params }: Params) {
    const userId = headers().get('X-UserId') || '';
    const channelId = params.channelId;

    if (userId === '') {
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
                id: userId,
            },
            select: {
                id: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found',
                },
                { status: 404 }
            );
        }

        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId,
            },
            select: {
                type: true,
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

        if (!channel.recipientIds.includes(userId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Unauthorized',
                },
                { status: 401 }
            );
        }

        if (channel.type === 0) {
            // Add channel to hidden channels
            await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    hiddenChannelIds: {
                        push: channelId,
                    },
                },
            });

            await pusher.trigger('chat-app', 'channel-left', {
                channelId: channelId,
                recipientId: userId,
            });

            return NextResponse.json(
                {
                    success: true,
                    message: 'Channel deleted',
                },
                { status: 200 }
            );
        } else if (channel.type === 1) {
            if (channel.recipientIds.length > 1) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Cannot delete group DM',
                    },
                    { status: 400 }
                );
            } else {
                await prisma.channel.delete({
                    where: {
                        id: channelId,
                    },
                });

                await pusher.trigger('chat-app', 'channel-left', {
                    channelId: channelId,
                    recipientId: userId,
                });

                return NextResponse.json(
                    {
                        success: true,
                        message: 'Channel deleted',
                    },
                    { status: 200 }
                );
            }
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Wrong channel type',
                },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong',
            },
            { status: 500 }
        );
    }
}
