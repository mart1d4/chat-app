import { cleanOtherUser } from '@/lib/utils/cleanModels';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prismadb';

export async function GET(
    req: Request,
    { params }: { params: { channelId: string } }
) {
    const channelId = params.channelId;
    // const { skip, limit } = (await req.json()) || {};

    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    try {
        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId,
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    // take: limit || 50,
                    // skip: skip || 0,
                    include: {
                        author: true,
                    },
                },
            },
        });

        if (!channel) {
            return NextResponse.json(
                {
                    success: true,
                    message: 'Channel not found',
                },
                {
                    status: 404,
                }
            );
        }

        if (!channel.recipientIds.includes(senderId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You are not in this channel',
                },
                {
                    status: 401,
                }
            );
        }

        const messages = channel.messages.map((message) => {
            return {
                ...message,
                author: cleanOtherUser(message.author as UserType),
            };
        });

        // const hasMoreMessages = channel.messages.length - skip > limit;
        const hasMoreMessages = false;

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully retrieved messages',
                messages: messages,
                hasMore: hasMoreMessages,
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
