import { NextResponse } from "next/server";
import { removeImage } from "@/lib/cdn";
import { headers } from "next/headers";
import { catchError } from "@/lib/api";
import { db } from "@/lib/db/db";
import {
    areUsersBlocked,
    didUserHideChannel,
    getMessage,
    getRandomId,
    isUserInChannel,
} from "@/lib/db/helpers";
import pusher from "@/lib/pusher/server-connection";

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

        if (message.reference) {
            const messageRef = await db
                .selectFrom("messages")
                .select("id")
                .where("id", "=", message.reference)
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
                type: message.reference ? 1 : 0,
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
                messageReferenceId: message.reference ?? null,
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

        pusher.trigger(`app`, "message", {
            message: newMessage,
            channelId: channelId,
        });

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
