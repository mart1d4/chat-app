import { cleanOtherUser } from '@/lib/utils/cleanModels';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';

export async function GET(req: Request, { params }: { params: { channelId: string } }) {
    const channelId = params.channelId;
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    if (
        typeof senderId !== 'string' ||
        senderId.length !== 24 ||
        typeof channelId !== 'string' ||
        channelId.length !== 24
    ) {
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
        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId,
            },
            include: {
                recipients: {
                    orderBy: {
                        username: 'asc',
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

        const recipients = channel.recipients.map((recipient) => {
            return cleanOtherUser(recipient as UserType);
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully retrieved channel',
                channel: {
                    ...channel,
                    recipients,
                },
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

export async function DELETE(req: Request, { params }: { params: { channelId: string } }) {
    const channelId = params.channelId;
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    if (
        typeof senderId !== 'string' ||
        senderId.length !== 24 ||
        typeof channelId !== 'string' ||
        channelId.length !== 24
    ) {
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
        const channel = await prisma.channel.findUnique({
            where: {
                id: channelId,
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

        // If DM channel, just remove the channel from the user's DMs
        if (['DM', 'GROUP_DM'].includes(channel.type)) {
            const user = await prisma.user.findUnique({
                where: {
                    id: senderId,
                },
            });

            if (!user) {
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

            await prisma.user.update({
                where: {
                    id: senderId,
                },
                data: {
                    channels: {
                        disconnect: {
                            id: channel.id,
                        },
                    },
                },
            });

            if (channel.type === 'GROUP_DM') {
                if (channel.recipientIds.length === 0) {
                    await prisma.channel.delete({
                        where: {
                            id: channel.id,
                        },
                    });

                    return NextResponse.json(
                        {
                            success: true,
                            message: 'Channel deleted',
                        },
                        {
                            status: 200,
                        }
                    );
                } else {
                    const randomIndex = Math.floor(Math.random() * channel.recipientIds.length);

                    const newOwner = channel.recipientIds[randomIndex];

                    // Create new message

                    const ownerMessage = await prisma.message.create({
                        data: {
                            type: 'OWNER_CHANGE',
                            content: `<@${user.id}> has made <@${newOwner}> the owner of this group DM`,
                            mentionEveryone: false,
                            channel: {
                                connect: {
                                    id: channel.id,
                                },
                            },
                            author: {
                                connect: {
                                    id: user.id,
                                },
                            },
                        },
                    });

                    const leaveMessage = await prisma.message.create({
                        data: {
                            type: 'RECIPIENT_REMOVE',
                            content: `<@${user.id}> has left this group DM`,
                            mentionEveryone: false,
                            channel: {
                                connect: {
                                    id: channel.id,
                                },
                            },
                            author: {
                                connect: {
                                    id: user.id,
                                },
                            },
                        },
                    });

                    await prisma.channel.update({
                        where: {
                            id: channel.id,
                        },
                        data: {
                            owner: {
                                connect: {
                                    id: newOwner,
                                },
                            },
                            messages: {
                                connect: [
                                    {
                                        id: ownerMessage.id,
                                    },
                                    {
                                        id: leaveMessage.id,
                                    },
                                ],
                            },
                        },
                    });
                }
            }

            return NextResponse.json(
                {
                    success: true,
                    message: 'Successfully left channel',
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
