import pusher from '@/lib/pusher/api-connection';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import { removeImage } from '@/lib/api/cdn';

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

    const {
        password,
        username,
        newPassword,
        displayName,
        description,
        avatar,
        banner,
        primaryColor,
        accentColor,
        status,
    } = await req.json();

    let usernameChanged = false;

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
                { status: 404 }
            );
        }

        if (newPassword && password) {
            const user = await prisma.user.findUnique({
                where: {
                    id: senderId,
                },
                select: {
                    password: true,
                },
            });

            if (!user) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'User not found',
                    },
                    { status: 404 }
                );
            }

            if (newPassword === password) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'New password cannot be the same as the old password',
                    },
                    { status: 400 }
                );
            }

            const passwordsMatch = await bcrypt.compare(password, user.password);

            if (!passwordsMatch) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Incorrect password',
                    },
                    { status: 401 }
                );
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: {
                    id: senderId,
                },
                data: {
                    password: hashedPassword,
                },
            });

            return NextResponse.json(
                {
                    success: true,
                    message: 'Successfully updated user.',
                },
                { status: 200 }
            );
        } else if (username && password) {
            const user = await prisma.user.findUnique({
                where: {
                    id: senderId,
                },
                select: {
                    password: true,
                },
            });

            if (!user) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'User not found',
                    },
                    { status: 404 }
                );
            }

            const usernameExists = await prisma.user.findUnique({
                where: {
                    username,
                },
            });

            if (usernameExists) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Username already exists',
                    },
                    { status: 409 }
                );
            }

            const passwordsMatch = await bcrypt.compare(password, user.password);

            if (!passwordsMatch) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Incorrect password',
                    },
                    { status: 401 }
                );
            }

            await prisma.user.update({
                where: {
                    id: senderId,
                },
                data: {
                    username,
                },
            });

            usernameChanged = true;
        } else {
            if (avatar && !avatars.includes(sender.avatar)) {
                await removeImage(sender.avatar);
            }

            if ((banner && sender.banner) || (banner === null && sender.banner)) {
                await removeImage(sender.banner);
            }

            await prisma.user.update({
                where: {
                    id: senderId,
                },
                data: {
                    displayName: displayName ? displayName : sender.displayName,
                    description: typeof description === 'string' ? description : sender.description,
                    avatar: avatar ? avatar : sender.avatar,
                    banner: banner || banner === null ? banner : sender.banner,
                    primaryColor: primaryColor ? primaryColor : sender.primaryColor,
                    accentColor: accentColor ? accentColor : sender.accentColor,
                    status: status ? status : sender.status,
                },
            });
        }

        await pusher.trigger('chat-app', 'user-updated', {
            userId: sender.id,
            username: usernameChanged ? username : sender.username,
            displayName: displayName ? displayName : sender.displayName,
            description: typeof description === 'string' ? description : sender.description,
            avatar: avatar ? avatar : sender.avatar,
            banner: banner || banner === null ? banner : sender.banner,
            primaryColor: primaryColor ? primaryColor : sender.primaryColor,
            accentColor: accentColor ? accentColor : sender.accentColor,
            status: status ? status : sender.status,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully updated user.',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong.',
            },
            { status: 500 }
        );
    }
}
