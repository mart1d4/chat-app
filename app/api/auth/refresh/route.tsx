import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prismadb';
import { SignJWT } from 'jose';

export async function GET(req: Request): Promise<NextResponse> {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json(
            {
                success: false,
                message: 'Unauthorized',
            },
            { status: 401 }
        );
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                refreshToken: token,
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
                system: true,
                verified: true,
                notifications: true,
                guildIds: true,
                guilds: {
                    include: {
                        channels: true,
                        roles: true,
                        emotes: true,
                        members: {
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
                hiddenChannelIds: true,
                channelIds: true,
                channels: {
                    orderBy: [
                        {
                            updatedAt: 'desc',
                        },
                    ],
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
                friendIds: true,
                friends: {
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
                requestReceivedIds: true,
                requestsReceived: {
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
                requestSentIds: true,
                requestsSent: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatar: true,
                        banner: true,
                        primaryColor: true,
                        accentColor: true,
                        createdAt: true,
                    },
                },
                blockedUserIds: true,
                blockedUsers: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatar: true,
                        banner: true,
                        primaryColor: true,
                        accentColor: true,
                        createdAt: true,
                    },
                },
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Forbidden',
                },
                { status: 401 }
            );
        }

        const accessToken = await new SignJWT({ id: user.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1d')
            .setIssuer(process.env.ISSUER as string)
            .setAudience(process.env.ISSUER as string)
            .sign(new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET));

        if (!accessToken) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Forbidden',
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully refreshed token.',
                accessToken: accessToken,
                user: {
                    ...user,
                    channels: user.channels.filter((channel) => !user.hiddenChannelIds.includes(channel.id)),
                },
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
