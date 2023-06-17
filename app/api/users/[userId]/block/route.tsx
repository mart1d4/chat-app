import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';
import Channels from 'pusher';

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

        const isBlocked = sender.blockedUserIds.find((blocked: string) => blocked === user.id);

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
                    id: userId,
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
                },
            });

            const channels = new Channels({
                appId: process.env.PUSHER_APP_ID as string,
                key: process.env.PUSHER_KEY as string,
                secret: process.env.PUSHER_SECRET as string,
                cluster: process.env.PUSHER_CLUSTER as string,
            });

            channels &&
                channels.trigger('chat-app', `user-blocked`, {
                    senderId: sender.id,
                    userId: user.id,
                });

            return NextResponse.json(
                {
                    success: true,
                    message: 'Successfuly blocked this user',
                },
                {
                    status: 200,
                }
            );
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "You haven't blocked this user.",
                },
                {
                    status: 400,
                }
            );
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error.',
            },
            {
                status: 500,
            }
        );
    }
    // }
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

        const isBlocked = sender.blockedUserIds.find((blocked: string) => blocked === user.id);

        if (isBlocked) {
            await prisma.user.update({
                where: {
                    id: senderId,
                },
                data: {
                    blockedUsers: {
                        disconnect: { id: user.id },
                    },
                },
            });

            const channels = new Channels({
                appId: process.env.PUSHER_APP_ID as string,
                key: process.env.PUSHER_KEY as string,
                secret: process.env.PUSHER_SECRET as string,
                cluster: process.env.PUSHER_CLUSTER as string,
            });

            channels &&
                channels.trigger('chat-app', `user-unblocked`, {
                    senderId: sender.id,
                    userId: user.id,
                });

            return NextResponse.json(
                {
                    success: true,
                    message: 'Successfuly unblocked this user.',
                },
                {
                    status: 200,
                }
            );
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "You haven't blocked this user.",
                },
                {
                    status: 400,
                }
            );
        }
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
    // }
}
