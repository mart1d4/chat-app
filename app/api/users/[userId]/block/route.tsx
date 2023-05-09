import connectDB from '@/lib/mongo/connectDB';
import User from '@/lib/mongo/models/User';
import { NextResponse, NextRequest } from 'next/server';
import { headers } from 'next/headers';
import mongoose from 'mongoose';

connectDB();

type RequestType = {
    type: 0 | 1;
    user: string;
};

export async function POST({
    req,
    params,
}: {
    req: NextRequest;
    params: { slug: string };
}): Promise<NextResponse> {
    const userId = params.slug;
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(senderId)
    ) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid user ID.',
            },
            {
                status: 400,
            }
        );
    } else {
        try {
            const sender = await User.findById(senderId);
            const user = await User.findById(userId);

            if (!sender || !user) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'User not found.',
                    },
                    {
                        status: 404,
                    }
                );
            }

            const isBlocked = sender.blocked.find(
                (blocked: string) => blocked === user._id
            );

            if (!isBlocked) {
                sender.friends = sender.friends.filter(
                    (friend: string) => friend !== user._id
                );

                user.friends = user.friends.filter(
                    (friend: string) => friend !== sender._id
                );

                sender.requests = sender.requests.filter(
                    (request: RequestType) => request.user !== user._id
                );

                user.requests = user.requests.filter(
                    (request: RequestType) => request.user !== sender._id
                );

                sender.blocked.push(user._id);

                await sender.save();
                await user.save();

                return NextResponse.json(
                    {
                        success: true,
                        message: 'Successfuly blocked this user',
                    },
                    {
                        status: 200,
                    }
                );
            } else {
                return NextResponse.json(
                    {
                        success: false,
                        message: "You haven't blocked this user.",
                    },
                    {
                        status: 400,
                    }
                );
            }
        } catch (error) {
            console.error(error);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Internal server error.',
                },
                {
                    status: 500,
                }
            );
        }
    }
}

export async function DELETE({
    req,
    params,
}: {
    req: NextRequest;
    params: { slug: string };
}): Promise<NextResponse> {
    const userId = params.slug;
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

    if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(senderId)
    ) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid user ID.',
            },
            {
                status: 400,
            }
        );
    } else {
        try {
            const sender = await User.findById(senderId);
            const user = await User.findById(userId);

            if (!sender || !user) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'User not found.',
                    },
                    {
                        status: 404,
                    }
                );
            }

            const isBlocked = sender.blocked.find(
                (blocked: string) => blocked === user._id
            );

            if (isBlocked) {
                sender.blocked = sender.blocked.filter(
                    (blocked: string) => blocked !== user._id
                );

                await sender.save();

                return NextResponse.json(
                    {
                        success: true,
                        message: 'Successfuly unblocked this user.',
                    },
                    {
                        status: 200,
                    }
                );
            } else {
                return NextResponse.json(
                    {
                        success: false,
                        message: "You haven't blocked this user.",
                    },
                    {
                        status: 400,
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
}
