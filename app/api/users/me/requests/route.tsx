import connectDB from '@/lib/mongo/connectDB';
import cleanUser from '@/lib/mongo/cleanUser';
import User from '@/lib/mongo/models/User';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import mongoose from 'mongoose';

connectDB();

type RequestType = {
    type: 0 | 1;
    user: UncleanUserType;
};

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
        const sender = await User.findById(senderId).populate({
            path: 'requests',
            populate: {
                path: 'user',
                model: 'User',
            },
        });

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
            const requests = sender.requests.map((request: RequestType) => {
                return {
                    type: request.type,
                    user: cleanUser(request.user),
                };
            });

            return NextResponse.json(
                {
                    success: true,
                    message: 'Successfully retrieved requests.',
                    requests: requests,
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
