import { NextResponse, NextRequest } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prismadb';

export async function POST(
    req: NextRequest,
    { params }: { params: { userId: string } }
): Promise<NextResponse> {
    const userId = params.userId;
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    if (
        typeof userId !== 'string' ||
        typeof senderId !== 'string' ||
        userId.length !== 24 ||
        senderId.length !== 24
    ) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid user ID.',
            },
            {
                status: 400,
            }
        );
    }

    if (senderId === userId) {
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

    try {
        const sender = await prisma.user.findUnique({
            where: {
                id: senderId,
            },
        });

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
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

        const isBlocked = sender.blockedUserIds.find((blocked) => blocked === user.id);

        const isBlockedBy = user.blockedUserIds.find((blocked) => blocked === sender.id);

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

        const isFriend = sender.friendIds.find((friend) => friend === user.id);

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

        const sentRequest = sender.requestSentIds.find((request) => request === user.id);

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

        const receivedRequest = sender.requestReceivedIds.find((request) => request === user.id);

        if (receivedRequest) {
            await prisma.user.update({
                where: {
                    id: senderId,
                },
                data: {
                    friends: {
                        connect: { id: userId },
                    },
                    requestsReceived: {
                        disconnect: { id: userId },
                    },
                },
            });

            await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    friends: {
                        connect: { id: senderId },
                    },
                    requestsSent: {
                        disconnect: { id: senderId },
                    },
                },
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
                    connect: { id: userId },
                },
            },
        });

        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                requestsReceived: {
                    connect: { id: senderId },
                },
            },
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
    { params }: { params: { userId: string } }
): Promise<NextResponse> {
    const userId = params.userId;
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    if (
        typeof userId !== 'string' ||
        typeof senderId !== 'string' ||
        userId.length !== 24 ||
        senderId.length !== 24
    ) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid user ID.',
            },
            {
                status: 400,
            }
        );
    }

    if (senderId === userId) {
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

    try {
        const sender = await prisma.user.findUnique({
            where: {
                id: senderId,
            },
        });

        console.log(sender);

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
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
                id: senderId,
            },
            data: {
                friends: {
                    disconnect: { id: userId },
                },
                requestsSent: {
                    disconnect: { id: userId },
                },
                requestsReceived: {
                    disconnect: { id: userId },
                },
            },
        });

        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                friends: {
                    disconnect: { id: senderId },
                },
                requestsSent: {
                    disconnect: { id: senderId },
                },
                requestsReceived: {
                    disconnect: { id: senderId },
                },
            },
        });

        const message = isFriend ? 'Friend removed' : 'Request cancelled';

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
