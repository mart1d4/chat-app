import pusher from '@/lib/pusher/api-connection';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';

export async function POST(req: Request, { params }: { params: { username: string } }): Promise<NextResponse> {
    const senderId = headers().get('X-UserId') || '';
    const username = params.username;

    try {
        const sender = await prisma.user.findUnique({
            where: {
                id: senderId,
            },
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
                requestReceivedIds: true,
                requestSentIds: true,
                blockedUserIds: true,
                createdAt: true,
            },
        });

        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
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
                requestReceivedIds: true,
                requestSentIds: true,
                blockedUserIds: true,
                createdAt: true,
            },
        });

        if (!sender || !user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Hm. didn't work. Double check that the username is correct.",
                },
                { status: 404 }
            );
        }

        if (sender.id === user.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You cannot add yourself as a friend.',
                },
                { status: 400 }
            );
        }

        const isBlocked = sender.blockedUserIds.find((blocked) => blocked === user.id);
        const isBlockedBy = user.blockedUserIds.find((blocked) => blocked === sender.id);
        const isFriend = sender.friendIds.find((friend) => friend === user.id);
        const sentRequest = sender.requestSentIds.find((request) => request === user.id);
        const receivedRequest = sender.requestReceivedIds.find((request) => request === user.id);

        console.log('Requests sent: ', sender.requestSentIds);

        if (isBlocked || isBlockedBy) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You cannot add this user as a friend.',
                },
                { status: 400 }
            );
        }

        if (isFriend) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You are already friends with this user.',
                },
                { status: 400 }
            );
        }

        if (sentRequest) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You have already sent a friend request to this user.',
                },
                { status: 400 }
            );
        }

        if (receivedRequest) {
            await prisma.user.update({
                where: {
                    id: sender.id,
                },
                data: {
                    friends: {
                        connect: { id: user.id },
                    },
                    requestsReceived: {
                        disconnect: { id: user.id },
                    },
                },
            });

            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    friends: {
                        connect: { id: sender.id },
                    },
                    requestsSent: {
                        disconnect: { id: sender.id },
                    },
                },
            });

            await pusher.trigger('chat-app', 'relationship-updated', {
                type: 'FRIEND_ADDED',
                sender: sender,
                receiver: user,
            });

            return NextResponse.json(
                {
                    success: true,
                    message: 'You are now friends with this user.',
                },
                { status: 200 }
            );
        }

        await prisma.user.update({
            where: {
                id: senderId,
            },
            data: {
                requestsSent: {
                    connect: { id: user.id },
                },
            },
        });

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                requestsReceived: {
                    connect: { id: sender.id },
                },
            },
        });

        await pusher.trigger('chat-app', 'relationship-updated', {
            type: 'FRIEND_REQUEST',
            sender: sender,
            receiver: user,
        });

        return NextResponse.json(
            {
                success: true,
                message: `Success. Friend request sent to ${user.username}.`,
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

export async function DELETE(req: Request, { params }: { params: { username: string } }): Promise<NextResponse> {
    const senderId = headers().get('X-UserId') || '';
    const username = params.username;

    try {
        const sender = await prisma.user.findUnique({
            where: {
                id: senderId,
            },
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
                requestReceivedIds: true,
                requestSentIds: true,
                blockedUserIds: true,
                createdAt: true,
            },
        });

        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
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
                requestReceivedIds: true,
                requestSentIds: true,
                blockedUserIds: true,
                createdAt: true,
            },
        });

        if (!sender || !user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found.',
                },
                { status: 404 }
            );
        }

        if (sender.id === user.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You cannot remove yourself as a friend.',
                },
                { status: 400 }
            );
        }

        const isFriend = sender.friendIds.find((friend) => friend === user.id);
        const sentRequest = sender.requestSentIds.find((request) => request === user.id);
        const receivedRequest = sender.requestReceivedIds.find((request) => request === user.id);

        if (!isFriend && !sentRequest && !receivedRequest) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'You are not friends with this user.',
                },
                { status: 200 }
            );
        }

        await prisma.user.update({
            where: {
                id: sender.id,
            },
            data: {
                friends: {
                    disconnect: { id: user.id },
                },
                requestsSent: {
                    disconnect: { id: user.id },
                },
                requestsReceived: {
                    disconnect: { id: user.id },
                },
            },
        });

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                friends: {
                    disconnect: { id: sender.id },
                },
                requestsSent: {
                    disconnect: { id: sender.id },
                },
                requestsReceived: {
                    disconnect: { id: sender.id },
                },
            },
        });

        const message = isFriend ? 'Friend removed' : 'Request cancelled';

        await pusher.trigger('chat-app', 'relationship-updated', {
            type: 'FRIEND_REMOVED',
            sender: sender,
            receiver: user,
        });

        return NextResponse.json(
            {
                success: true,
                message: message,
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
