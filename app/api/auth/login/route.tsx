import { cleanUser } from '@/lib/utils/cleanModels';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

export async function POST(req: Request): Promise<NextResponse> {
    const { username, password }: { username: string; password: string } = await req.json();

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
        console.log('[LOGIN] Attempting to login user:', username);
        const user = await prisma.user.findUnique({
            where: {
                username: username,
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
                .setExpirationTime('1d')
                .setIssuer(process.env.ISSUER as string)
                .setAudience(process.env.ISSUER as string)
                .sign(new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET));

            const refreshToken = await new SignJWT({ id: user.id })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('7d')
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
                    user: cleanUser(user as any),
                    accessToken: accessToken,
                },
                {
                    status: 200,
                    headers: {
                        'Set-Cookie': `token=${refreshToken}; path=/; HttpOnly; SameSite=Strict; Max-Age=604800;`,
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
