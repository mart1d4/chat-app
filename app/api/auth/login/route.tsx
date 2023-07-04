import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

type Body = {
    username: string;
    password: string;
    client?: string;
};

export async function POST(req: Request): Promise<NextResponse> {
    const { username, password, client }: Body = await req.json();

    if (!username || !password) {
        return NextResponse.json(
            {
                success: false,
                message: 'Login or password is invalid',
            },
            {
                status: 400,
            }
        );
    }

    try {
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
                password: true,
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
                channelIds: true,
                channels: {
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
                    orderBy: {
                        updatedAt: 'desc',
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
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Login or password is invalid',
                },
                {
                    status: 401,
                }
            );
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) {
            const accessToken = await new SignJWT({ id: user.id })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime(client === 'app' ? '365d' : '1h')
                .setIssuer(process.env.ISSUER as string)
                .setAudience(process.env.ISSUER as string)
                .sign(new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET));

            const refreshToken = await new SignJWT({ id: user.id })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime(client === 'app' ? '365d' : '1d')
                .setIssuer(process.env.ISSUER as string)
                .setAudience(process.env.ISSUER as string)
                .sign(new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET));

            // Save refresh token to database
            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    refreshToken: refreshToken,
                },
            });

            return NextResponse.json(
                {
                    success: true,
                    user: user,
                    accessToken: accessToken,
                },
                {
                    status: 200,
                    headers: {
                        'Set-Cookie': `token=${refreshToken}; path=/; HttpOnly; SameSite=Lax; Max-Age=604800; Secure`,
                    },
                }
            );
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Login or password is invalid',
                },
                {
                    status: 401,
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
