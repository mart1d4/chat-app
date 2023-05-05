// @ts-nocheck

import connectDB from '@/lib/mongo/connectDB';
import cleanUser from '@/lib/mongo/cleanUser';
import User from '@/lib/mongo/models/User';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

connectDB();

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

    const user = await User.findOne({ refreshToken: token });
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

    const accessToken = await new SignJWT({ id: user._id })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setIssuedAt()
        .setExpirationTime('1d')
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
            message: 'Successfully refreshed token',
            accessToken: accessToken,
            user: cleanUser(user),
        },
        {
            status: 200,
        }
    );
}
