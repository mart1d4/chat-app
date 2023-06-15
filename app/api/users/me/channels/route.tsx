import { cleanOtherUser } from '@/lib/utils/cleanModels';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';

export async function GET(): Promise<NextResponse> {
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    if (typeof senderId !== 'string' || senderId.length !== 24) {
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
        const sender = await prisma.user.findUnique({
            where: {
                id: senderId,
            },
            include: {
                channels: {
                    where: {
                        type: {
                            in: ['DM', 'GROUP_DM'],
                        },
                    },
                    include: {
                        recipients: true,
                    },
                    orderBy: {
                        updatedAt: 'desc',
                    },
                },
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

        const channels = sender.channels.map((channel) => {
            const recipients = channel.recipients.map((recipient) => {
                // @ts-ignore
                return cleanOtherUser(recipient);
            });

            return {
                ...channel,
                recipients: recipients,
            };
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Channels fetched successfully',
                channels: channels,
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

export async function POST(req: Request) {
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    const { recipients, channelId } = await req.json();
    let recipientObjects = [];

    recipients.forEach((recipient: string) => {
        if (typeof recipient !== 'string' || recipient.length !== 24) {
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
    });

    if (recipients.includes(senderId)) {
        recipients.splice(recipients.indexOf(senderId), 1);
    }

    if (recipients?.length > 10 && recipients?.length < 1) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid recipients.',
            },
            {
                status: 400,
            }
        );
    }

    if (typeof senderId !== 'string' || senderId.length !== 24) {
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

        if (recipients.length === 0) {
            // Create channel with just user
            const channel = await prisma.channel.create({
                data: {
                    type: 'GROUP_DM',
                    recipients: {
                        connect: {
                            id: user.id,
                        },
                    },
                    icon: '/assets/channel-avatars/blue.png',
                    owner: {
                        connect: {
                            id: user.id,
                        },
                    },
                },
            });

            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    channels: {
                        connect: {
                            id: channel.id,
                        },
                    },
                },
            });

            return NextResponse.json(
                {
                    success: true,
                    message: 'Successfully created channel',
                },
                {
                    status: 200,
                }
            );
        }

        for (const recipient of recipients) {
            const recipientUser = await prisma.user.findUnique({
                where: {
                    id: recipient,
                },
            });

            if (!recipientUser) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Recipient not found.',
                    },
                    {
                        status: 404,
                    }
                );
            }

            recipientObjects.push(recipientUser);
        }

        if (channelId) {
            // Add users to existing channel
            const channel = await prisma.channel.findUnique({
                where: {
                    id: channelId,
                },
                include: {
                    recipients: true,
                },
            });

            if (!channel || channel.type !== 'GROUP_DM') {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Channel not found.',
                    },
                    {
                        status: 404,
                    }
                );
            }

            const usersToAdd = recipientObjects.filter((recipient) => {
                return !channel.recipientIds.includes(recipient.id);
            });

            if (usersToAdd.length === 0) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'No users to add.',
                    },
                    {
                        status: 400,
                    }
                );
            }

            for (const newUser of usersToAdd) {
                const message = await prisma.message.create({
                    data: {
                        type: 'RECIPIENT_ADD',
                        content: `<@${user.id}> added <@${newUser.id}> to the group.`,
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
                        messages: {
                            connect: {
                                id: message.id,
                            },
                        },
                        recipients: {
                            connect: {
                                id: newUser.id,
                            },
                        },
                    },
                });

                if (!newUser.channelIds.includes(channel.id)) {
                    await prisma.user.update({
                        where: {
                            id: newUser.id,
                        },
                        data: {
                            channels: {
                                connect: {
                                    id: channel.id,
                                },
                            },
                        },
                    });
                }
            }

            return NextResponse.json(
                {
                    success: true,
                    message: 'Successfully added users to channel.',
                },
                {
                    status: 200,
                }
            );
        }

        console.log([...recipients, user.id]);

        const sameChannel = await prisma.channel.findFirst({
            where: {
                recipientIds: {
                    every: {
                        id: [...recipients, user.id],
                    },
                },
            },
            include: {
                recipients: true,
            },
        });

        if (sameChannel) {
            if (sameChannel.type === 'GROUP_DM') {
                for (const recipient of recipientObjects) {
                    if (!recipient.channelIds.includes(sameChannel.id)) {
                        await prisma.user.update({
                            where: {
                                id: recipient.id,
                            },
                            data: {
                                channels: {
                                    connect: {
                                        id: sameChannel.id,
                                    },
                                },
                            },
                        });
                    }
                }
            } else {
                if (!user.channelIds.includes(sameChannel.id)) {
                    await prisma.user.update({
                        where: {
                            id: user.id,
                        },
                        data: {
                            channels: {
                                connect: {
                                    id: sameChannel.id,
                                },
                            },
                        },
                    });
                }
            }

            return NextResponse.json(
                {
                    success: true,
                    message: 'Successfully added users to channel.',
                },
                {
                    status: 200,
                }
            );
        }

        const channel = await prisma.channel.create({
            // @ts-ignore
            data: {
                type: recipients.length === 1 ? 'DM' : 'GROUP_DM',
                recipients: {
                    connect: [...recipients, user.id].map((id) => ({ id })),
                },
                icon: '/assets/channel-avatars/blue.png',
                owner:
                    recipients.length > 1
                        ? {
                              connect: {
                                  id: user.id,
                              },
                          }
                        : undefined,
            },
        });

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                channels: {
                    connect: {
                        id: channel.id,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully created channel.',
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
