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
import probe from "probe-image-size";

export async function POST(req: Request, { params }: { params: { channelId: string } }) {
    const senderId = parseInt(headers().get("X-UserId") || "0");
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

        // embeds are either images or links
        const embeds = await Promise.all(
            (message.content.match(/https?:\/\/[^\s]+/g) || [])
                .map(async (url) => {
                    try {
                        const isImage = /\.(jpe?g|png|gif|bmp)$/i.test(url);

                        const res = await fetch(url);
                        const contentType = res.headers.get("content-type");

                        if (isImage || contentType?.startsWith("image")) {
                            const result = await probe(url);
                            console.log(result);

                            return {
                                type: "image",
                                url: url,
                                dimensions: {
                                    width: result.width,
                                    height: result.height,
                                },
                                mime: result.mime,
                            };
                        }

                        const metadata = await fetch(
                            `https://api.microlink.io/?url=${encodeURIComponent(url)}`
                        ).then((res) => res.json());

                        if (metadata.status === "success") {
                            return {
                                type: "link",
                                url: url,
                                title: metadata.data.title,
                                description: metadata.data.description,
                                image: metadata.data.image,
                            };
                        }

                        return null;
                    } catch (error) {
                        console.log(error);
                        return null;
                    }
                })
                .filter((r) => r !== null)
        );

        // Remove duplicate urls
        const uniqueEmbeds = embeds.filter((v, i, a) => a.findIndex((t) => t.url === v.url) === i);

        const id = getRandomId();

        await db
            .insertInto("messages")
            .values({
                id: id,
                type: message.reference ? 1 : 0,
                content: message.content,
                attachments: message.attachments ? JSON.stringify(message.attachments) : "[]",
                embeds: uniqueEmbeds.length ? JSON.stringify(uniqueEmbeds) : "[]",
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
