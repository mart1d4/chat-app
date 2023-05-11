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

    // if (
    //     !mongoose.Types.ObjectId.isValid(userId) ||
    //     !mongoose.Types.ObjectId.isValid(senderId)
    // ) {
    //     return NextResponse.json(
    //         {
    //             success: false,
    //             message: 'Invalid user ID.',
    //         },
    //         {
    //             status: 400,
    //         }
    //     );
    // } else {
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

        const isBlocked = sender.blockedUserIds.find(
            (blocked: string) => blocked === user.id
        );

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

export async function DELETE({
    req,
    params,
}: {
    req: NextRequest;
    params: { slug: string };
}): Promise<NextResponse> {
    const userId = params.slug;
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    // if (
    //     !mongoose.Types.ObjectId.isValid(userId) ||
    //     !mongoose.Types.ObjectId.isValid(senderId)
    // ) {
    //     return NextResponse.json(
    //         {
    //             success: false,
    //             message: 'Invalid user ID.',
    //         },
    //         {
    //             status: 400,
    //         }
    //     );
    // } else {
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

        const isBlocked = sender.blockedUserIds.find(
            (blocked: string) => blocked === user.id
        );

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
