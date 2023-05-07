import connectDB from '@/lib/mongo/connectDB';
import cleanUser from '@/lib/mongo/cleanUser';
import User from '@/lib/mongo/models/User';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import mongoose from 'mongoose';

connectDB();

export async function GET(): Promise<NextResponse> {
    const headersList = headers();
    const uncleanSenderId = headersList.get('userId') || '';

    const senderId = uncleanSenderId?.replace(/"/g, '');

    if (!mongoose.Types.ObjectId.isValid(senderId)) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid user ID.',
            },
            {
                status: 400,
            }
        );
    }

    try {
        const sender = await User.findById(senderId).populate('blocked');

        if (!sender) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found.',
                },
                {
                    status: 404,
                }
            );
        } else {
            const blocked = sender.blocked.map((blockedUser: UncleanUserType) =>
                cleanUser(blockedUser)
            );

            return NextResponse.json(
                {
                    success: true,
                    message: 'Successfully retrieved friends.',
                    blocked: blocked,
                },
                {
                    status: 200,
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
