import pusher from '@/lib/pusher/api-connection';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';

export async function POST(req: Request, { params }: { params: { username: string } }): Promise<NextResponse> {
    const senderId = headers().get('X-UserId') || '';
    const username = params.username;

    try {
        const sender = await prisma.user.findUnique({
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
                requestReceivedIds: true,
                requestSentIds: true,
                blockedUserIds: true,
                createdAt: true,
            },
        });

        const user = await prisma.user.findUnique({
            where: {
                username: username,
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
                requestReceivedIds: true,
                requestSentIds: true,
                blockedUserIds: true,
                createdAt: true,
            },
        });

        if (!sender || !user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found.',
                },
                { status: 404 }
            );
        }

        const isBlocked = sender.blockedUserIds.find((id: string) => id === user.id);

        if (!isBlocked) {
            await prisma.user.update({
                where: {
                    id: senderId,
                },
                data: {
                    friends: {
                        disconnect: { id: user.id },
                    },
                    requestsReceived: {
                        disconnect: { id: user.id },
                    },
                    requestsSent: {
                        disconnect: { id: user.id },
                    },
                    blockedUsers: {
                        connect: { id: user.id },
                    },
                },
            });

            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    friends: {
                        disconnect: { id: sender.id },
                    },
                    requestsReceived: {
                        disconnect: { id: sender.id },
                    },
                    requestsSent: {
                        disconnect: { id: sender.id },
                    },
                    blockedByUsers: {
                        connect: { id: sender.id },
                    },
                },
            });

            await pusher.trigger('chat-app', 'relationship-updated', {
                type: 'USER_BLOCKED',
                sender: sender,
                receiver: user,
            });

            return NextResponse.json(
                {
                    success: true,
                    message: 'Successfuly blocked this user',
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You have already blocked this user.',
                },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error.',
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request, { params }: { params: { username: string } }): Promise<NextResponse> {
    const username = params.username;
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    try {
        const sender = await prisma.user.findUnique({
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
                requestReceivedIds: true,
                requestSentIds: true,
                blockedUserIds: true,
                createdAt: true,
            },
        });

        const user = await prisma.user.findUnique({
            where: {
                username: username,
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
                requestReceivedIds: true,
                requestSentIds: true,
                blockedUserIds: true,
                createdAt: true,
            },
        });

        if (!sender || !user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found.',
                },
                { status: 404 }
            );
        }

        const isBlocked = sender.blockedUserIds.find((id: string) => id === user.id);

        if (isBlocked) {
            await prisma.user.update({
                where: {
                    id: sender.id,
                },
                data: {
                    blockedUsers: {
                        disconnect: { id: user.id },
                    },
                },
            });

            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    blockedByUsers: {
                        disconnect: { id: sender.id },
                    },
                },
            });

            await pusher.trigger('chat-app', 'relationship-updated', {
                type: 'USER_UNBLOCKED',
                sender: sender,
                receiver: user,
            });

            return NextResponse.json(
                {
                    success: true,
                    message: 'Successfuly unblocked this user.',
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "You haven't blocked this user.",
                },
                { status: 400 }
            );
        }
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
