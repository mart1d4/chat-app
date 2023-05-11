import { cleanOtherUser } from '@/lib/utils/cleanModels';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prismadb';

export async function GET(): Promise<NextResponse> {
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    // if (!mongoose.Types.ObjectId.isValid(senderId)) {
    //     return NextResponse.json(
    //         {
    //             success: false,
    //             message: 'Invalid user ID.',
    //         },
    //         {
    //             status: 400,
    //         }
    //     );
    // }

    try {
        const sender = await prisma.user.findUnique({
            where: {
                id: senderId,
            },
            include: {
                friends: true,
            },
        });

        if (!sender) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found.',
                },
                {
                    status: 404,
                }
            );
        } else {
            const friends = sender.friends.map((user: any) =>
                cleanOtherUser(user)
            );

            return NextResponse.json(
                {
                    success: true,
                    message: 'Successfully retrieved friends.',
                    friends: friends,
                },
                {
                    status: 200,
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
}
