import pusher from '@/lib/pusher/api-connection';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';

const avatars = [
    '178ba6e1-5551-42f3-b199-ddb9fc0f80de',
    '9a5bf989-b884-4f81-b26c-ca1995cdce5e',
    '7cb3f75d-4cad-4023-a643-18c329b5b469',
    '220b2392-c4c5-4226-8b91-2b60c5a13d0f',
    '51073721-c1b9-4d47-a2f3-34f0fbb1c0a8',
];

export async function PATCH(req: Request) {
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    const { username, password, displayName, description, avatar, banner, primaryColor, accentColor, status } =
        await req.json();

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

        if (username && password) {
            await prisma.user.update({
                where: {
                    id: senderId,
                },
                data: {
                    username: username,
                },
            });
        } else {
            if (avatar && !avatars.includes(sender.avatar)) {
                await fetch(`https://api.uploadcare.com/files/${sender.avatar}/storage/`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Uploadcare.Simple ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
                        Accept: 'application/vnd.uploadcare-v0.7+json',
                    },
                });
            }

            if (banner && sender.banner) {
                await fetch(`https://api.uploadcare.com/files/${sender.banner}/storage/`, {
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
                    displayName: displayName ? displayName : sender.displayName,
                    description: description ? description : sender.description,
                    avatar: avatar ? avatar : sender.avatar,
                    banner: banner ? banner : sender.banner,
                    primaryColor: primaryColor ? primaryColor : sender.primaryColor,
                    accentColor: accentColor ? accentColor : sender.accentColor,
                    status: status ? status : sender.status,
                },
            });
        }

        await pusher.trigger('chat-app', 'user-updated', {
            userId: sender.id,
            username: username ? username : sender.username,
            displayName: displayName ? displayName : sender.displayName,
            description: description ? description : sender.description,
            avatar: avatar ? avatar : sender.avatar,
            banner: banner ? banner : sender.banner,
            primaryColor: primaryColor ? primaryColor : sender.primaryColor,
            accentColor: accentColor ? accentColor : sender.accentColor,
            status: status ? status : sender.status,
        });

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
