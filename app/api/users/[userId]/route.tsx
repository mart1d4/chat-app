import connectDB from '@/lib/mongo/connectDB';
import cleanUser from '@/lib/utils/cleanModels';
import User from '@/lib/mongo/models/User';
import { NextResponse, NextRequest } from 'next/server';
import mongoose from 'mongoose';

connectDB();

export async function GET({
    req,
    params,
}: {
    req: NextRequest;
    params: { slug: string };
}): Promise<NextResponse> {
    const userId = params.slug;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
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
            const user = await User.findById(userId);

            if (!user) {
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
                return NextResponse.json(
                    {
                        success: true,
                        message: 'User found.',
                        user: cleanUser(user),
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
}
