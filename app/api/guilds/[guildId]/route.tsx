import pusher from '@/lib/pusher/api-connection';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';

export async function DELETE(req: Request, { params }: { params: { guildId: string } }) {
    const senderId = headers().get('userId') || '';
    const guildId = params.guildId;

    if (senderId === '') {
        return NextResponse.json(
            {
                success: false,
                message: 'Unauthorized',
            },
            { status: 401 }
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: senderId,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Unauthorized',
                },
                { status: 401 }
            );
        }

        const guild = await prisma.guild.findUnique({
            where: {
                id: guildId,
            },
        });

        if (!guild) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Guild not found',
                },
                { status: 404 }
            );
        }

        if (guild.ownerId !== senderId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Unauthorized',
                },
                { status: 401 }
            );
        }

        if (guild.icon) {
            await fetch(`https://api.uploadcare.com/files/${guild.icon}/storage/`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Uploadcare.Simple ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
                    Accept: 'application/vnd.uploadcare-v0.7+json',
                },
            });
        }

        // const messageWithImages = await prisma.message.findMany({
        //     where: {
        //         channelId: {
        //             in: guild.channelIds,
        //         },
        //         NOT: {
        //             attachments: {
        //                 equals: [],
        //             },
        //         },
        //     },
        // });

        // messageWithImages.forEach(async (message) => {
        //     message.attachments.forEach(async (attachment) => {
        //         await fetch(`https://api.uploadcare.com/files/${attachment.id}/storage/`, {
        //             method: 'DELETE',
        //             headers: {
        //                 Authorization: `Uploadcare.Simple ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
        //                 Accept: 'application/vnd.uploadcare-v0.7+json',
        //             },
        //         });
        //     });
        // });

        await prisma.role.deleteMany({
            where: {
                guildId,
            },
        });

        await prisma.channel.deleteMany({
            where: {
                guildId,
            },
        });

        await prisma.guild.delete({
            where: {
                id: guildId,
            },
        });

        await pusher.trigger('chat-app', 'guild-deleted', {
            guildId,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Guild deleted',
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
