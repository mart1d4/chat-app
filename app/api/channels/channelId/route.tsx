import Channel from '@/lib/mongo/models/Channel';
import connectDB from '@/lib/mongo/connectDB';
import User from '@/lib/mongo/models/User';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import mongoose from 'mongoose';

connectDB();

export async function DELETE(
    req: NextResponse,
    {
        params,
    }: {
        params: { slug: string };
    }
) {
    const headersList = headers();
    const userId = headersList.get('userId');

    // @ts-expect-error
    const channelId = params.channelId;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        return NextResponse.json(
            {
                success: false,
                message: 'Channel Id is invalid',
            },
            {
                status: 400,
            }
        );
    }

    // @ts-expect-error
    const channel = await Channel.findById(channelId);

    if (!channel) {
        return NextResponse.json(
            {
                success: false,
                message: 'Channel not found',
            },
            {
                status: 404,
            }
        );
    }

    // If DM channel, remove the channel from the user's DMs
    if (channel.type === 0 || channel.type === 1) {
        // @ts-expect-error
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found',
                },
                {
                    status: 404,
                }
            );
        }

        const channelIndex = user.channels.findIndex(
            (channel: string) => channel === channelId
        );

        if (channelIndex !== -1) {
            user.channels.splice(channelIndex, 1);
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Channel not found in user channels',
                },
                {
                    status: 404,
                }
            );
        }

        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: 'Channel deleted successfully',
            },
            {
                status: 200,
            }
        );
    }
}
