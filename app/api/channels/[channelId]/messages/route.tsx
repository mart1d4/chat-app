import { decryptMessage, encryptMessage } from "@/lib/encryption";
import pusher from "@/lib/pusher/server-connection";
import { removeImage } from "@/lib/cdn";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
    areUsersBlocked,
    getChannel,
    getRandomId,
    getUser,
    isUserInChannel,
    isUserInGuild,
} from "@/lib/db/helpers";
import { db } from "@/lib/db/db";

// export async function GET(req: Request, { params }: { params: { channelId: string } }) {
//     const senderId = headers().get("X-UserId") || "";
//     const channelId = params.channelId;
//     const { skip, limit } = { skip: 0, limit: 500 };

//     try {
//         const channel = await prisma.channel.findUnique({
//             where: {
//                 id: channelId,
//             },
//             include: {
//                 messages: {
//                     orderBy: {
//                         createdAt: "asc",
//                     },
//                     skip: skip,
//                     take: limit,
//                     include: {
//                         author: {
//                             select: {
//                                 id: true,
//                                 username: true,
//                                 displayName: true,
//                                 avatar: true,
//                                 banner: true,
//                                 primaryColor: true,
//                                 accentColor: true,
//                                 description: true,
//                                 customStatus: true,
//                                 status: true,
//                                 guildIds: true,
//                                 friendIds: true,
//                                 createdAt: true,
//                             },
//                         },
//                         messageReference: {
//                             include: {
//                                 author: {
//                                     select: {
//                                         id: true,
//                                         username: true,
//                                         displayName: true,
//                                         avatar: true,
//                                         banner: true,
//                                         primaryColor: true,
//                                         accentColor: true,
//                                         description: true,
//                                         customStatus: true,
//                                         status: true,
//                                         guildIds: true,
//                                         friendIds: true,
//                                         createdAt: true,
//                                     },
//                                 },
//                                 mentions: {
//                                     select: {
//                                         id: true,
//                                         username: true,
//                                         displayName: true,
//                                         avatar: true,
//                                         banner: true,
//                                         primaryColor: true,
//                                         accentColor: true,
//                                         description: true,
//                                         customStatus: true,
//                                         status: true,
//                                         guildIds: true,
//                                         friendIds: true,
//                                         createdAt: true,
//                                     },
//                                 },
//                             },
//                         },
//                         mentions: {
//                             select: {
//                                 id: true,
//                                 username: true,
//                                 displayName: true,
//                                 avatar: true,
//                                 banner: true,
//                                 primaryColor: true,
//                                 accentColor: true,
//                                 description: true,
//                                 customStatus: true,
//                                 status: true,
//                                 guildIds: true,
//                                 friendIds: true,
//                                 createdAt: true,
//                             },
//                         },
//                     },
//                 },
//             },
//         });

//         const sender = await prisma.user.findUnique({
//             where: {
//                 id: senderId,
//             },
//         });

//         if (!channel || !sender) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Channel not found",
//                 },
//                 { status: 404 }
//             );
//         }

//         if (
//             !channel.recipientIds.includes(senderId) &&
//             !sender.guildIds.includes(channel?.guildId ?? "")
//         ) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "You are not in this channel",
//                 },
//                 { status: 401 }
//             );
//         }

//         const messages = channel.messages.map((message) => {
//             return {
//                 ...message,
//                 content: decryptMessage(message.content),
//                 messageReference: {
//                     ...message.messageReference,
//                     content: decryptMessage(message.messageReference?.content ?? ""),
//                 },
//             };
//         });

//         return NextResponse.json(
//             {
//                 success: true,
//                 message: "Successfully retrieved messages",
//                 messages: messages,
//                 hasMore: channel.messages.length - skip > limit,
//             },
//             { status: 200 }
//         );
//     } catch (error) {
//         console.error(`[ERROR] /api/channels/[channelId]/messages/route.tsx: ${error}`);
//         return NextResponse.json(
//             {
//                 success: false,
//                 message: "Something went wrong.",
//             },
//             { status: 500 }
//         );
//     }
// }

export async function POST(req: Request, { params }: { params: { channelId: string } }) {
    const senderId = headers().get("X-UserId") || "";

    const channelId = params.channelId;
    const { message } = await req.json();

    if (!message || (!message.content && !message.attachments && !message.embeds)) {
        return NextResponse.json(
            {
                success: false,
                message: "Message is required",
            },
            { status: 400 }
        );
    }

    try {
        const channel = await getChannel(parseInt(channelId));
        const sender = await getUser({ id: parseInt(senderId) });

        if (!channel || !sender) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Channel or sender not found",
                },
                { status: 404 }
            );
        }

        if (
            !isUserInChannel(sender.id, channel.id) &&
            channel.guildId &&
            !isUserInGuild(sender.id, channel.guildId)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not in this channel",
                },
                { status: 401 }
            );
        }

        // If DM and user is blocked
        if (channel.type === 0) {
            const otherUser = await db
                .selectFrom("channelrecipients")
                .select("userId")
                .where("channelId", "=", channel.id)
                .where("userId", "!=", sender.id)
                .executeTakeFirst();

            if (await areUsersBlocked([senderId, otherUser.userId])) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "You are blocked from sending messages in this channel",
                    },
                    { status: 401 }
                );
            }
        }

        if (!message.content && message.attachments.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Message can't be blank",
                },
                { status: 400 }
            );
        }

        if (message.content && message.content.length > 4000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Message must be less than 4000 characters",
                },
                { status: 400 }
            );
        }

        if (message.messageReference) {
            const messageRef = await db
                .selectFrom("messages")
                .select("id")
                .where("id", "=", message.messageReference)
                .executeTakeFirst();

            if (!messageRef) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Referenced message not found",
                    },
                    { status: 404 }
                );
            }
        }

        const regex: RegExp = /<@([a-zA-Z0-9]{24})>/g;
        const mentions: string[] = (message.content?.match(regex) || []).map((match: string) =>
            match.slice(2, -1)
        );

        // Check if mentions are valid
        if (mentions.length > 0) {
            const validMentions = await db
                .selectFrom("users")
                .select("id")
                .where("id", "in", mentions)
                .execute();

            mentions.forEach((mention) => {
                if (!validMentions.find((user) => user.id === parseInt(mention))) {
                    mentions.splice(mentions.indexOf(mention), 1);
                }
            });
        }

        const id = getRandomId();

        const newMessage = await db
            .insertInto("messages")
            .values({
                id: id,
                type: message.messageReference ? 1 : 0,
                content: message.content,
                attachments: message.attachments ? JSON.stringify(message.attachments) : "[]",
                embeds: message.embeds ? JSON.stringify(message.embeds) : "[]",
                mentionEveryone: message.mentionEveryone ?? false,
                mentionChannelIds: message.mentionChannelIds
                    ? JSON.stringify(message.mentionChannelIds)
                    : "[]",
                mentionRoleIds: message.mentionRoleIds
                    ? JSON.stringify(message.mentionRoleIds)
                    : "[]",
                mentions: mentions ? JSON.stringify(message.mentions) : "[]",
                authorId: senderId,
                channelId: channelId,
                messageReferenceId: message.messageReference ?? null,
            })
            .executeTakeFirst();

        await db
            .updateTable("channels")
            .set("lastMessageId", id)
            .where("id", "=", channelId)
            .execute();

        // if (channel.type === 0) {
        //     // If the recipient has hidden the channel, unhide it
        //     const recipientId = channel.recipientIds.find((id) => id !== senderId);
        //     const recipient = await prisma.user.findUnique({
        //         where: {
        //             id: recipientId,
        //         },
        //         select: {
        //             hiddenChannelIds: true,
        //         },
        //     });

        //     if (recipient?.hiddenChannelIds.includes(channelId)) {
        //         await prisma.user.update({
        //             where: {
        //                 id: recipientId,
        //             },
        //             data: {
        //                 hiddenChannelIds: {
        //                     set: recipient.hiddenChannelIds.filter((id) => id !== channelId),
        //                 },
        //             },
        //         });

        //         await pusher.trigger("chat-app", "channel-created", {
        //             recipients: [recipientId],
        //             channel: channel,
        //         });
        //     }
        // }

        await pusher.trigger("chat-app", "message-sent", {
            channelId: channelId,
            message: {
                id: id,
                authorId: sender.id,
                channelId: channelId,
                content: message.content,
                createdAt: new Date(),
                author: {
                    ...sender,
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Successfully sent message",
                data: {
                    message: {
                        id: id,
                        authorId: sender.id,
                        channelId: channelId,
                        content: message.content,
                        createdAt: new Date(),
                        author: {
                            ...sender,
                        },
                    },
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(`[ERROR] /api/channels/[channelId]/messages/route.tsx: ${error}`);

        // if (message.attachments) {
        //     message.attachments.forEach(async (attachment: TAttachment) => {
        //         await removeImage(attachment.id);
        //     });
        // }

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
