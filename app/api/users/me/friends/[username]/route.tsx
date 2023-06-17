import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';
import Channels from 'pusher';

export async function POST(
    req: NextRequest,
    { params }: { params: { username: string } }
): Promise<NextResponse> {
    const username = params.username;
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    try {
        const sender = await prisma.user.findUnique({
            where: {
                id: senderId,
            },
        });

        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
        });

        if (!sender || !user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found.',
                },
                {
                    status: 404,
                }
            );
        }

        if (sender.id === user.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You cannot add yourself as a friend.',
                },
                {
                    status: 400,
                }
            );
        }

        const isBlocked = sender.blockedUserIds.find((blocked) => blocked === user.id);
        const isBlockedBy = user.blockedUserIds.find((blocked) => blocked === sender.id);
        const isFriend = sender.friendIds.find((friend) => friend === user.id);
        const sentRequest = sender.requestSentIds.find((request) => request === user.id);
        const receivedRequest = sender.requestReceivedIds.find((request) => request === user.id);

        if (isBlocked || isBlockedBy) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You cannot add this user as a friend.',
                },
                {
                    status: 400,
                }
            );
        }

        if (isFriend) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You are already friends with this user.',
                },
                {
                    status: 400,
                }
            );
        }

        if (sentRequest) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You have already sent a friend request to this user.',
                },
                {
                    status: 400,
                }
            );
        }

        const channels = new Channels({
            appId: process.env.PUSHER_APP_ID as string,
            key: process.env.PUSHER_KEY as string,
            secret: process.env.PUSHER_SECRET as string,
            cluster: process.env.PUSHER_CLUSTER as string,
        });

        if (receivedRequest) {
            await prisma.user.update({
                where: {
                    id: senderId,
                },
                data: {
                    friends: {
                        connect: { id: user.id },
                    },
                    requestsReceived: {
                        disconnect: { id: user.id },
                    },
                },
            });

            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    friends: {
                        connect: { id: sender.id },
                    },
                    requestsSent: {
                        disconnect: { id: sender.id },
                    },
                },
            });

            channels &&
                channels.trigger('chat-app', `user-friend`, {
                    sender: sender,
                    user: user,
                });

            return NextResponse.json(
                {
                    success: true,
                    message: 'You are now friends with this user.',
                },
                {
                    status: 200,
                }
            );
        }

        await prisma.user.update({
            where: {
                id: senderId,
            },
            data: {
                requestsSent: {
                    connect: { id: user.id },
                },
            },
        });

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                requestsReceived: {
                    connect: { id: sender.id },
                },
            },
        });

        channels &&
            channels.trigger('chat-app', `user-request`, {
                sender: sender,
                user: user,
            });

        return NextResponse.json(
            {
                success: true,
                message: 'Friend request sent.',
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong.',
            },
            {
                status: 500,
            }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { username: string } }
): Promise<NextResponse> {
    const username = params.username;
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    try {
        const sender = await prisma.user.findUnique({
            where: {
                id: senderId,
            },
        });

        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
        });

        if (!sender || !user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found.',
                },
                {
                    status: 404,
                }
            );
        }

        if (sender.id === user.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You cannot remove yourself as a friend.',
                },
                {
                    status: 400,
                }
            );
        }

        const channels = new Channels({
            appId: process.env.PUSHER_APP_ID as string,
            key: process.env.PUSHER_KEY as string,
            secret: process.env.PUSHER_SECRET as string,
            cluster: process.env.PUSHER_CLUSTER as string,
        });

        const isFriend = sender.friendIds.find((friend) => friend === user.id);
        const sentRequest = sender.requestSentIds.find((request) => request === user.id);
        const receivedRequest = sender.requestReceivedIds.find((request) => request === user.id);

        if (!isFriend && !sentRequest && !receivedRequest) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You are not friends with this user.',
                },
                {
                    status: 200,
                }
            );
        }

        await prisma.user.update({
            where: {
                id: sender.id,
            },
            data: {
                friends: {
                    disconnect: { id: user.id },
                },
                requestsSent: {
                    disconnect: { id: user.id },
                },
                requestsReceived: {
                    disconnect: { id: user.id },
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
                requestsSent: {
                    disconnect: { id: sender.id },
                },
                requestsReceived: {
                    disconnect: { id: sender.id },
                },
            },
        });

        const message = isFriend ? 'Friend removed' : 'Request cancelled';

        channels &&
            channels.trigger('chat-app', 'user-removed', {
                sender: sender,
                user: user,
            });

        return NextResponse.json(
            {
                success: true,
                message: message,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong.',
            },
            {
                status: 500,
            }
        );
    }
}
