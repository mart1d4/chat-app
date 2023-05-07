// Ignore typescript error
// @ts-nocheck

import connectDB from '@/lib/mongo/connectDB';
import cleanUser from '@/lib/mongo/cleanUser';
import User from '@/lib/mongo/models/User';
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

connectDB();

export async function POST(req: Request): Promise<NextResponse> {
    const { username, password }: any = await req.json();

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
        const user = await User.findOne({ username: username });

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
            const accessToken = await new SignJWT({ id: user._id })
                .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
                .setIssuedAt()
                .setExpirationTime('1d')
                .sign(
                    new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET)
                );

            const refreshToken = await new SignJWT({ id: user._id })
                .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
                .setIssuedAt()
                .setExpirationTime('7d')
                .sign(
                    new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET)
                );

            user.refreshToken = refreshToken;
            await user.save();

            return NextResponse.json(
                {
                    success: true,
                    user: cleanUser(user),
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
