import { cleanOtherUser } from '@/lib/utils/cleanModels';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';

export async function GET(req: Request, { params }: { params: { channelId: string } }) {
    const channelId = params.channelId;
    // const { skip, limit } = (await req.json()) || {
    //     skip: 0,
    //     limit: 50,
    // };
    const skip = 0;
    const limit = 50;

    console.log(skip, limit);

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
                    take: limit || 50,
                    skip: skip || 0,
                    include: {
                        author: true,
                    },
                },
            },
        });

        if (!channel) {
            return NextResponse.json(
                {
                    success: false,
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

        const hasMoreMessages = channel.messages.length - skip > limit;

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

export async function POST(req: Request, { params }: { params: { channelId: string } }) {
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    const channelId = params.channelId;
    const { message } = await req.json();

    if (!message || !message.content) {
        return NextResponse.json(
            {
                success: false,
                message: 'Message is required',
            },
            {
                status: 400,
            }
        );
    }

    try {
        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId,
            },
        });

        const sender = await prisma.user.findUnique({
            where: {
                id: senderId,
            },
        });

        if (!channel || !sender) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Channel or sender not found',
                },
                {
                    status: 404,
                }
            );
        }

        if (message.messageReference !== null) {
            const messageRef = await prisma.message.findUnique({
                where: {
                    id: message.messageReference,
                },
            });

            if (!messageRef) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Referenced message not found',
                    },
                    {
                        status: 404,
                    }
                );
            }
        }

        const newMessage = await prisma.message.create({
            data: {
                type: message.messageReference ? 'REPLY' : 'DEFAULT',
                content: String(message.content),
                attachments: message.attachments || [],
                embeds: message.embeds || [],
                messageReference: message.messageReference || null,
                mentionEveryone: message.mentionEveryone || false,
                mentionChannelIds: message.mentionChannelIds || [],
                mentionRoleIds: message.mentionRoleIds || [],
                mentionUserIds: message.mentionUserIds || [],
                author: {
                    connect: {
                        id: senderId,
                    },
                },
                channel: {
                    connect: {
                        id: channelId,
                    },
                },
            },
        });

        await prisma.channel.update({
            where: {
                id: channelId,
            },
            data: {
                messages: {
                    connect: {
                        id: newMessage.id,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully sent message',
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
