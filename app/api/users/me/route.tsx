import { uploadDirect } from '@uploadcare/upload-client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';
import Channels from 'pusher';

const avatars = [
    '178ba6e1-5551-42f3-b199-ddb9fc0f80de',
    '9a5bf989-b884-4f81-b26c-ca1995cdce5e',
    '7cb3f75d-4cad-4023-a643-18c329b5b469',
    '220b2392-c4c5-4226-8b91-2b60c5a13d0f',
    '51073721-c1b9-4d47-a2f3-34f0fbb1c0a8',
];

export async function PATCH(
    req: Request,
    { params }: { params: { channelId: string; messageId: string } }
) {
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    const { status, username, avatar } = await req.json();

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
        }

        if (username) {
            await prisma.user.update({
                where: {
                    id: senderId,
                },
                data: {
                    username: username,
                },
            });
        }

        if (avatar) {
            if (!avatars.includes(sender.avatar)) {
                await fetch(`https://api.uploadcare.com/files/${sender.avatar}/storage/`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Uploadcare.Simple ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
                        Accept: 'application/vnd.uploadcare-v0.7+json',
                    },
                });
            }

            await prisma.user.update({
                where: {
                    id: senderId,
                },
                data: {
                    avatar: avatar,
                },
            });
        }

        const channels = new Channels({
            appId: process.env.PUSHER_APP_ID as string,
            key: process.env.PUSHER_KEY as string,
            secret: process.env.PUSHER_SECRET as string,
            cluster: process.env.PUSHER_CLUSTER as string,
        });

        channels &&
            (await channels.trigger('chat-app', `user-updated`, {
                userId: senderId,
                connected: status,
                username: username,
                avatar: avatar,
            }));

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
