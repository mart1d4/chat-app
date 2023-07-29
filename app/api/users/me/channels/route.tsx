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

export async function GET(req: Request): Promise<NextResponse> {
    const senderId = headers().get('X-UserId') || '';

    if (senderId === '') {
        return NextResponse.json(
            {
                success: false,
                message: 'Unauthorized',
            },
            { status: 400 }
        );
    }

    try {
        const sender = await prisma.user.findUnique({
            where: {
                id: senderId,
            },
            select: {
                hiddenChannelIds: true,
                channels: {
                    orderBy: {
                        updatedAt: 'desc',
                    },
                    select: {
                        id: true,
                        type: true,
                        icon: true,
                        ownerId: true,
                        recipientIds: true,
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
                        createdAt: true,
                        updatedAt: true,
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
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Channels fetched successfully',
                channels: sender.channels.filter((channel) => !sender.hiddenChannelIds.includes(channel.id)),
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

export async function POST(req: Request) {
    const userId = headers().get('X-UserId') || '';
    const { recipients } = await req.json();

    if (userId === '') {
        return NextResponse.json(
            {
                success: false,
                message: 'Unauthorized',
            },
            { status: 401 }
        );
    }

    if (!recipients || recipients.length < 0 || recipients.length > 9) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid recipients length',
            },
            { status: 400 }
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                hiddenChannelIds: true,
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

        if (recipients.length === 0) {
            // Create a group channel with just the user
            const channel = await prisma.channel.create({
                data: {
                    type: 1,
                    icon: getRandomIcon(),
                    ownerId: userId,
                    recipients: {
                        connect: {
                            id: userId,
                        },
                    },
                },
                select: {
                    id: true,
                    type: true,
                    icon: true,
                    ownerId: true,
                    recipientIds: true,
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
                    createdAt: true,
                },
            });

            await pusher.trigger('chat-app', 'channel-created', {
                recipients: [userId],
                channel: channel,
                redirect: true,
            });

            return NextResponse.json(
                {
                    success: true,
                    message: 'Channel created successfully',
                },
                { status: 201 }
            );
        }

        if (recipients.length === 1) {
            const recipient = await prisma.user.findUnique({
                where: {
                    id: recipients[0],
                },
                select: {
                    friendIds: true,
                },
            });

            if (!recipient) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Recipient not found',
                    },
                    { status: 404 }
                );
            }

            // Create a DM channel with the user and the recipient
            const channelExists = await prisma.channel.findFirst({
                where: {
                    type: 0,
                    OR: [
                        {
                            recipientIds: {
                                equals: [userId, recipients[0]],
                            },
                        },
                        {
                            recipientIds: {
                                equals: [recipients[0], userId],
                            },
                        },
                    ],
                },
                select: {
                    id: true,
                    type: true,
                    icon: true,
                    ownerId: true,
                    recipientIds: true,
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
                    createdAt: true,
                },
            });

            if (!channelExists) {
                // Create a DM channel
                const channel = await prisma.channel.create({
                    data: {
                        type: 0,
                        icon: getRandomIcon(),
                        recipients: {
                            connect: [{ id: userId }, { id: recipients[0] }],
                        },
                    },
                    select: {
                        id: true,
                        type: true,
                        icon: true,
                        ownerId: true,
                        recipientIds: true,
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
                        createdAt: true,
                    },
                });

                await prisma.user.update({
                    where: {
                        id: recipients[0],
                    },
                    data: {
                        hiddenChannelIds: {
                            push: channel.id,
                        },
                    },
                });

                await pusher.trigger('chat-app', 'channel-created', {
                    recipients: [userId],
                    channel: channel,
                    redirect: true,
                });

                return NextResponse.json(
                    {
                        success: true,
                        message: 'Channel created successfully',
                    },
                    { status: 201 }
                );
            } else {
                // If channel exists, check if user has the channel in his hidden channels
                // If he does, remove it from the hidden channels, otherwise do nothing
                const isHidden = user.hiddenChannelIds.includes(channelExists.id);

                if (isHidden) {
                    await prisma.user.update({
                        where: {
                            id: userId,
                        },
                        data: {
                            hiddenChannelIds: {
                                set: user.hiddenChannelIds.filter((id) => id !== channelExists.id),
                            },
                        },
                    });

                    await pusher.trigger('chat-app', 'channel-created', {
                        recipients: [userId],
                        channel: channelExists,
                        redirect: true,
                    });

                    return NextResponse.json(
                        {
                            success: true,
                            message: 'Channel added successfully',
                        },
                        { status: 201 }
                    );
                } else {
                    return NextResponse.json(
                        {
                            success: false,
                            message: 'Already in channel',
                        },
                        { status: 400 }
                    );
                }
            }
        }

        if (recipients.length > 1 && recipients.length < 10) {
            // Create a group channel

            const recipientsUser = await prisma.user.findMany({
                where: {
                    id: {
                        in: recipients,
                    },
                },
                select: {
                    id: true,
                },
            });

            if (recipientsUser.length !== recipients.length) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Invalid recipients',
                    },
                    { status: 400 }
                );
            }

            const channel = await prisma.channel.create({
                data: {
                    type: 1,
                    icon: getRandomIcon(),
                    ownerId: userId,
                    recipients: {
                        connect: [...recipients.map((recipient: string) => ({ id: recipient })), { id: userId }],
                    },
                },
                select: {
                    id: true,
                    type: true,
                    icon: true,
                    ownerId: true,
                    recipientIds: true,
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
                    createdAt: true,
                },
            });

            await pusher.trigger('chat-app', 'channel-created', {
                recipients: [...recipients, userId],
                channel: channel,
                redirect: true,
            });

            return NextResponse.json(
                {
                    success: true,
                    message: 'Channel created successfully',
                },
                { status: 201 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Invalid recipients length',
            },
            { status: 400 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong',
            },
            { status: 500 }
        );
    }
}
