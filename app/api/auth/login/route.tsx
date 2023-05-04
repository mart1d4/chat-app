// Ignore typescript error
// @ts-nocheck

import connectDB from '@/lib/mongo/connectDB';
import cleanUser from '@/lib/mongo/cleanUser';
import User from '@/lib/mongo/models/User';
import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

connectDB();

export async function POST(req: Request) {
    const { uid, password }: any = await req.json();

    if (!uid || !password) {
        return NextResponse.json({
            success: false,
            message: 'Login or password is invalid',
        });
    }

    try {
        const user = await User.findOne({ username: uid });

        if (!user)
            return NextResponse.json({
                success: false,
                message: 'Login or password is invalid',
            });

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) {
            const accessToken = await new SignJWT(cleanUser(user))
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('1d')
                .sign(
                    new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET)
                );

            const refreshToken = await new SignJWT(cleanUser(user))
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('7d')
                .sign(
                    new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET)
                );

            user.refreshToken = refreshToken;
            await user.save();

            return new Response(
                {
                    success: true,
                    user: cleanUser(user),
                    accessToken: accessToken,
                } as any,
                {
                    status: 200,
                    headers: {
                        'Set-Cookie': serialize('jwt', refreshToken, {
                            httpOnly: true,
                            secure: true,
                            sameSite: 'none',
                            maxAge: 60 * 60 * 24 * 7,
                            path: '/',
                        }),
                    },
                }
            );
        } else {
            return NextResponse.json({
                success: false,
                message: 'Login or password is invalid',
            });
        }
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            success: false,
            message: 'Something went wrong',
        });
    }
}
