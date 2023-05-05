import connectDB from '@/lib/mongo/connectDB';
import User from '@/lib/mongo/models/User';
import cleanUser from '@/lib/mongo/cleanUser';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import mongoose from 'mongoose';

connectDB();

export async function GET(): Promise<NextResponse> {
    const headersList = headers();
    const uncleanUserId = headersList.get('userId');

    const userId = uncleanUserId?.replace(/"/g, '');

    console.log(`User ID: ${userId}`);

    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
        return NextResponse.json(
            {
                success: false,
                message: 'User Id is invalid',
            },
            {
                status: 400,
            }
        );
    }

    const user = await User.findById(userId)
        .populate('channels')
        .populate({
            path: 'channels',
            populate: {
                path: 'recipients',
                model: 'User',
            },
        });

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

    const channels = user.channels.filter((channel: ChannelType) =>
        [0, 1].includes(channel.type)
    );

    channels?.recipients?.map((recipient: UncleanUserType) =>
        cleanUser(recipient)
    );

    return NextResponse.json(
        {
            success: true,
            message: 'Channels fetched successfully',
            channels: channels,
        },
        {
            status: 200,
        }
    );
}

// export async function POST(req: Request) {}

// export async function DELETE(req: Request) {
//     const userString = req.headers.user;
//     const userJson = JSON.parse(userString);

//     let user;

//     if (req.method === 'GET' || req.method === 'POST') {
//         const userID = userJson._id;

//         if (!mongoose.Types.ObjectId.isValid(userID)) {
//             return res.status(400).json({ message: 'Invalid user ID.' });
//         }

//         user = await User.findById(userID)
//             .populate('channels')
//             .populate({
//                 path: 'channels',
//                 populate: {
//                     path: 'recipients',
//                     model: 'User',
//                 },
//             });

//         if (!user) {
//             return res.status(404).json({ message: 'User not found.' });
//         }
//     }

//     if (req.method === 'GET') {
//         const channels = user.channels.filter((channel) =>
//             [0, 1].includes(channel.type)
//         );
//         channels?.recipients?.map((recipient) => cleanUser(recipient));

//         return res.json({ success: true, channels });
//     } else if (req.method === 'POST') {
//         const { recipients, addToChannel } = req.body;
//         let recipientsObjects = [];

//         if (recipients.length === 0) {
//             const channel = await Channel.create({
//                 type: 1,
//                 recipients: [user._id],
//                 icon: defaultChannelIcons[index],
//                 name: 'Unnamed',
//                 owner: user._id,
//             });

//             user.channels.unshift(channel._id);
//             await user.save();

//             return res.json({
//                 success: true,
//                 channel: {
//                     _id: channel._id,
//                     recipients: [cleanUser(user)],
//                     type: channel.type,
//                     icon:
//                         channel.icon ||
//                         '/assets/default-channel-avatars/blue.png',
//                     name: channel.name || 'Unnamed',
//                     owner: channel.owner || null,
//                 },
//                 message: 'Channel created',
//             });
//         }

//         if (!recipients.includes(user?._id)) {
//             recipients.unshift(user?._id.toString());
//         }

//         for (const recipient of recipients) {
//             if (!mongoose.Types.ObjectId.isValid(recipient)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Invalid recipients.',
//                 });
//             }

//             const recipientUser = await User.findById(recipient);

//             if (!recipientUser) {
//                 return res.status(404).json({
//                     success: false,
//                     message: 'Recipient not found.',
//                 });
//             }

//             recipientsObjects.push(recipientUser);
//         }

//         if (addToChannel) {
//             const channel = await Channel.findById(addToChannel);

//             if (!channel) {
//                 return res.status(404).json({
//                     success: false,
//                     message: 'Channel not found.',
//                 });
//             }

//             if (channel.type !== 1) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Cannot add users to this channel.',
//                 });
//             }

//             const usersToAdd = recipients.filter((recipient) => {
//                 return !channel.recipients.includes(recipient);
//             });

//             if (usersToAdd.length === 0) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'All users are already in this channel.',
//                 });
//             }

//             if (usersToAdd.length + channel.recipients.length > 15) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Too many recipients.',
//                 });
//             }

//             for (const recipient of recipientsObjects) {
//                 if (!channel.recipients.includes(recipient._id)) {
//                     channel.recipients.push(recipient._id);

//                     const message = new Message({
//                         channel: addToChannel,
//                         author: user._id,
//                         content: `${user.username} added ${recipient.username} to the group.`,
//                         type: 2,
//                     });

//                     channel.messages.push(message._id);
//                     await message.save();
//                 }

//                 if (!recipient.channels.includes(channel._id)) {
//                     recipient.channels.unshift(channel._id);
//                     await recipient.save();
//                 }
//             }

//             channel.name = recipientsObjects
//                 .map((recipient) => recipient.username)
//                 .join(', ');

//             await channel.save();

//             recipientsObjects.map((recipient) => cleanUser(recipient));

//             return res.json({
//                 success: true,
//                 channel: {
//                     _id: channel._id,
//                     recipients: recipientsObjects,
//                     type: channel.type,
//                     icon:
//                         channel.icon ||
//                         '/assets/default-channel-avatars/blue.png',
//                     name: channel.name || 'Unnamed',
//                     owner: channel.owner || null,
//                 },
//                 message: 'Channel updated',
//             });
//         }

//         const sameChannel = await Channel.findOne({
//             recipients: {
//                 $all: recipients,
//                 $size: recipients.length,
//             },
//         }).populate('recipients');

//         if (sameChannel) {
//             if (sameChannel?.type === 1) {
//                 for (const recipient of recipientsObjects) {
//                     const userHasChannel = recipient.channels.find(
//                         (channel) => {
//                             return (
//                                 channel.toString() ===
//                                 sameChannel?._id.toString()
//                             );
//                         }
//                     );

//                     if (!userHasChannel) {
//                         recipient.channels.unshift(sameChannel._id);
//                         await recipient.save();
//                     }
//                 }
//             } else {
//                 const userHasChannel = user.channels.find((channel) => {
//                     return (
//                         channel?._id.toString() === sameChannel?._id.toString()
//                     );
//                 });

//                 if (!userHasChannel) {
//                     user.channels.unshift(sameChannel._id);
//                     await user.save();
//                 }
//             }

//             recipientsObjects.map((recipient) => cleanUser(recipient));

//             return res.json({
//                 success: true,
//                 channel: {
//                     _id: sameChannel._id,
//                     recipients: recipientsObjects,
//                     type: sameChannel.type,
//                     icon:
//                         sameChannel.icon ||
//                         '/assets/default-channel-avatars/blue.png',
//                     name: sameChannel.name || 'Unnamed',
//                     owner: sameChannel.owner || null,
//                 },
//                 message: 'Channel already exists',
//             });
//         } else {
//             const channelName = recipientsObjects
//                 .map((recipient) => recipient.username)
//                 .join(', ');

//             const channel = await Channel.create({
//                 type: recipients.length === 2 ? 0 : 1,
//                 recipients: [...recipients],
//                 icon: defaultChannelIcons[index],
//                 name: recipients.length > 2 ? channelName : 'Unnamed',
//                 owner: recipients.length === 2 ? null : user._id,
//             });

//             user.channels.unshift(channel._id);
//             await user.save();

//             // If user isn't friend, don't add channel to recipient
//             if (
//                 recipients.length === 2 &&
//                 !user.friends.find((friend) => friend === recipients[1])
//             ) {
//                 recipientsObjects.map((recipient) => cleanUser(recipient));

//                 return res.json({
//                     success: true,
//                     channel: {
//                         _id: channel._id,
//                         recipients: recipientsObjects,
//                         type: channel.type,
//                         icon:
//                             channel.icon ||
//                             '/assets/default-channel-avatars/blue.png',
//                         name: channel.name || 'Unnamed',
//                         owner: channel.owner || null,
//                     },
//                     message: 'Channel created',
//                 });
//             }

//             for (const recipient of recipientsObjects) {
//                 if (recipient._id === user._id) continue;
//                 recipient.channels.unshift(channel._id);
//                 await recipient.save();
//             }

//             recipientsObjects.map((recipient) => cleanUser(recipient));

//             return res.json({
//                 success: true,
//                 channel: {
//                     _id: channel._id,
//                     recipients: recipientsObjects,
//                     type: channel.type,
//                     icon:
//                         channel.icon ||
//                         '/assets/default-channel-avatars/blue.png',
//                     name: channel.name || 'Unnamed',
//                     owner: channel.owner || null,
//                 },
//                 message: 'Channel created',
//             });
//         }
//     } else {
//         res.status(400).json({
//             success: false,
//             message: 'Invalid request method.',
//         });
//     }
// }
