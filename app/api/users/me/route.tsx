import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';
import Channels from 'pusher';

export async function PATCH(
    req: Request,
    { params }: { params: { channelId: string; messageId: string } }
) {
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    const { status } = await req.json();

    try {
        const sender = await prisma.user.findUnique({
            where: {
                id: senderId,
            },
        });

        if (!sender) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found',
                },
                {
                    status: 404,
                }
            );
        }

        if (status) {
            await prisma.user.update({
                where: {
                    id: senderId,
                },
                data: {
                    status: status ? 'Online' : 'Offline',
                },
            });

            const channels = new Channels({
                appId: process.env.PUSHER_APP_ID as string,
                key: process.env.PUSHER_KEY as string,
                secret: process.env.PUSHER_SECRET as string,
                cluster: process.env.PUSHER_CLUSTER as string,
            });

            channels &&
                channels.trigger('chat-app', `user-status`, {
                    userId: senderId,
                    connected: status,
                });
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully updated user.',
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
