import pusher from '@/lib/pusher/api-connection';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';

const channelIcons = [
    '3d035ad7-d7e0-4d8d-8efd-3ac56c9bdc88',
    '43c097c9-8748-42aa-b829-9f43c5971f44',
    '2e40ea3b-fd2a-408f-8c60-8c87e8500814',
    'db343e4f-5873-48a3-86c7-16c05230300a',
    '43f72250-ea5d-42e7-962c-dc082257ccc9',
    'ea338819-493f-4f9f-ac87-f108d1923713',
    'b173e5fb-eeee-410d-a257-27af06d7a4ba',
];

const getRandomIcon = () => {
    return channelIcons[Math.floor(Math.random() * channelIcons.length)];
};

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
                    orderBy: {
                        updatedAt: 'desc',
                    },
                    include: {
                        recipients: {
                            select: {
                                id: true,
                                username: true,
                                displayName: true,
                                avatar: true,
                                banner: true,
                                primaryColor: true,
                                accentColor: true,
                                description: true,
                                customStatus: true,
                                status: true,
                                guildIds: true,
                                channelIds: true,
                                friendIds: true,
                                createdAt: true,
                            },
                        },
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

        return NextResponse.json(
            {
                success: true,
                message: 'Channels fetched successfully',
                channels: sender.channels,
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
                    owner: {
                        connect: {
                            id: user.id,
                        },
                    },
                    icon: getRandomIcon(),
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

            await pusher.trigger('chat-app', 'channel-created', {
                userId: user.id,
                channel: channel,
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

            await pusher.trigger('chat-app', 'channel-added-users', {
                channel: channel,
                recipients: [...channel.recipients, ...usersToAdd],
            });

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

        const sameChannel = await prisma.channel.findFirst({
            where: {
                recipientIds: {
                    equals: [...recipients, user.id],
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

            await pusher.trigger('chat-app', 'channel-added-users', {
                channel: sameChannel,
            });

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
            data: {
                type: recipients.length === 1 ? 'DM' : 'GROUP_DM',
                recipients: {
                    connect: [...recipients, user.id].map((id) => ({ id })),
                },
                icon: getRandomIcon(),
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

        await pusher.trigger('chat-app', 'channel-created', {
            userIds: [...recipients, user.id],
            channel: channel,
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
