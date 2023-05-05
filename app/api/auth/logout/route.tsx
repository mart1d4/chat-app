// @ts-nocheck

import connectDB from '@/lib/mongo/connectDB';
import User from '@/lib/mongo/models/User';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

connectDB();

export async function POST(req: Request): Promise<NextResponse> {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
        return NextResponse.json(
            {
                success: false,
                message: 'No cookie found',
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
                message: 'No user found',
            },
            {
                status: 400,
                headers: {
                    'Set-Cookie': `token=; path=/; HttpOnly; SameSite=Strict; Max-Age=-1;`,
                },
            }
        );
    }

    user.refreshToken = '';
    await user.save();

    return NextResponse.json(
        {
            success: true,
            message: 'Logged out',
        },
        {
            status: 200,
            headers: {
                'Set-Cookie': `token=; path=/; HttpOnly; SameSite=Strict; Max-Age=-1;`,
            },
        }
    );
}
