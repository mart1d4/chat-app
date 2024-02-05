import { decryptMessage, encryptMessage } from "@/lib/encryption";
import pusher from "@/lib/pusher/server-connection";
import { removeImage } from "@/lib/cdn";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
    areUsersBlocked,
    didUserHideChannel,
    getChannel,
    getMessage,
    getRandomId,
    getUser,
    isUserInChannel,
    isUserInGuild,
} from "@/lib/db/helpers";
import { db } from "@/lib/db/db";
import { catchError } from "@/lib/api";

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
    let recipient;

    if (!message.content && !message.attachments.length && !message.embeds.length) {
        return NextResponse.json(
            {
                success: false,
                message: "Message can't be blank",
            },
            { status: 400 }
        );
    }

    if (message.content && message.content.length > 16000) {
        return NextResponse.json(
            {
                success: false,
                message: "Message must be less than 16000 characters",
            },
            { status: 400 }
        );
    }

    try {
        if (!isUserInChannel(senderId, channelId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not in this channel",
                },
                { status: 401 }
            );
        }

        const channel = await db
            .selectFrom("channels")
            .select(["guildId", "type"])
            .where("id", "=", channelId)
            .executeTakeFirst();

        if (!channel) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Channel not found",
                },
                { status: 404 }
            );
        }

        // If DM and user is blocked
        if (channel.type === 0) {
            recipient = await db
                .selectFrom("channelrecipients")
                .select("userId as id")
                .where("channelId", "=", channelId)
                .where("userId", "!=", senderId)
                .executeTakeFirst();

            if (!recipient) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "User not found",
                    },
                    { status: 404 }
                );
            }

            if (await areUsersBlocked([senderId, recipient.id])) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "You are blocked from sending messages in this channel",
                    },
                    { status: 401 }
                );
            }
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

        const regex: RegExp = /<@([0-9]{18})>/g;
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

        await db
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

        db.updateTable("channels").set({ lastMessageId: id }).where("id", "=", channelId).execute();

        if (channel.type === 0 && recipient) {
            // If the recipient has hidden the channel, unhide it
            if (await didUserHideChannel(recipient.id, channelId)) {
                db.updateTable("channelrecipients")
                    .set({ isHidden: false })
                    .where("channelId", "=", channelId)
                    .where("userId", "=", recipient.id)
                    .execute();
            }
        }

        const newMessage = await getMessage(id);

        return NextResponse.json(
            {
                success: true,
                message: "Successfully sent message",
                data: {
                    message: newMessage,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        if (message.attachments.length) {
            message.attachments.forEach((file) => {
                removeImage(file.id);
            });
        }

        return catchError(req, error);
    }
}
