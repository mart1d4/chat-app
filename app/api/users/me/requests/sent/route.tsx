import { cleanOtherUser } from '@/lib/utils/cleanModels';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prismadb';

export async function GET(): Promise<NextResponse> {
    const headersList = headers();
    const uncleanSenderId = headersList.get('userId') || '';

    const senderId = uncleanSenderId?.replace(/"/g, '');

    // Make sure the senderId is a valid ObjectId with Prisma
    // if () {
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
                requestsSent: true,
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
            const requests = sender.requestsSent.map((request) =>
                // @ts-ignore
                cleanOtherUser(request)
            );

            return NextResponse.json(
                {
                    success: true,
                    message: 'Successfully retrieved requests.',
                    requests: requests,
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
