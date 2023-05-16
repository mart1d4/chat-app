import { cleanOtherUser } from '@/lib/utils/cleanModels';
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prismadb';

export async function GET(
    req: NextRequest,
    { params }: { params: { userId: string } }
): Promise<NextResponse> {
    const userId = params.userId;

    if (typeof userId !== 'string' || userId.length !== 24) {
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
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
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
            return NextResponse.json(
                {
                    success: true,
                    message: 'User found.',
                    // @ts-ignore
                    user: cleanOtherUser(user),
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
    // }
}
