import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { cookies } from 'next/headers';
import Channels from 'pusher';

export async function POST(req: Request): Promise<NextResponse> {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json(
            {
                success: false,
                message: 'No cookie found',
            },
            {
                status: 401,
            }
        );
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                // @ts-ignore
                refreshToken: token,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No user found',
                },
                {
                    status: 400,
                    headers: {
                        'Set-Cookie': `token=; path=/; HttpOnly; SameSite=Strict; Max-Age=-1;`,
                    },
                }
            );
        }

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                refreshToken: '',
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
                userId: user.id,
                connected: false,
            });

        return NextResponse.json(
            {
                success: true,
                message: 'Logged out',
            },
            {
                status: 200,
                headers: {
                    'Set-Cookie': `token=; path=/; HttpOnly; SameSite=Strict; Max-Age=-1;`,
                },
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
