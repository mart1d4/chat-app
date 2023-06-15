import { cleanUser } from '@/lib/utils/cleanModels';
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
            {
                status: 401,
            }
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                refreshToken: token,
            },
            include: {
                channels: {
                    include: {
                        recipients: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                                banner: true,
                                primaryColor: true,
                                accentColor: true,
                                description: true,
                                customStatus: true,
                                status: true,
                                friendIds: true,
                                channelIds: true,
                                guildIds: true,
                                createdAt: true,
                            },
                        },
                    },
                },
                guilds: true,
                friends: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        banner: true,
                        primaryColor: true,
                        accentColor: true,
                        description: true,
                        customStatus: true,
                        status: true,
                        friendIds: true,
                        channelIds: true,
                        guildIds: true,
                        createdAt: true,
                    },
                },
                requestsReceived: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        banner: true,
                        primaryColor: true,
                        accentColor: true,
                        description: true,
                        customStatus: true,
                        status: true,
                        friendIds: true,
                        channelIds: true,
                        guildIds: true,
                        createdAt: true,
                    },
                },
                requestsSent: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        banner: true,
                        primaryColor: true,
                        accentColor: true,
                        createdAt: true,
                    },
                },
                blockedUsers: {
                    select: {
                        id: true,
                        username: true,
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
                    message: 'Forbidden',
                },
                {
                    status: 401,
                }
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
                {
                    status: 401,
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Successfully refreshed token.',
                accessToken: accessToken,
                user: cleanUser(user as any),
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
