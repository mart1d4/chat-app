import pusher from "@/lib/pusher/server-connection";
import { NextResponse } from "next/server";
import { removeImage } from "@/lib/cdn";
import { headers } from "next/headers";
import { catchError } from "@/lib/api";
import probe from "probe-image-size";
import { db } from "@/lib/db/db";
import {
    areUsersBlocked,
    didUserHideChannel,
    getMessage,
    getRandomId,
    isUserInChannel,
} from "@/lib/db/helpers";

const embedColors: [RegExp, string][] = [
    [
        // Youtube
        /https?:\/\/(www\.)?youtube.com/,
        "ff0000",
    ],
    [
        // youtu.be
        /https?:\/\/youtu.be/,
        "ff0000",
    ],
    [
        // Twitter
        /https?:\/\/(www\.)?twitter.com/,
        "1da1f2",
    ],
    [
        // Instagram
        /https?:\/\/(www\.)?instagram.com/,
        "e1306c",
    ],
    [
        // Reddit
        /https?:\/\/(www\.)?reddit.com/,
        "ff4500",
    ],
    [
        // Github
        /https?:\/\/(www\.)?github.com/,
        "6e5494",
    ],
    [
        // Discord
        /https?:\/\/(www\.)?discord.com/,
        "5865f2",
    ],
    [
        // Twitch
        /https?:\/\/(www\.)?twitch.tv/,
        "6441a5",
    ],
    [
        // Spotify
        /https?:\/\/(www\.)?open.spotify.com/,
        "1db954",
    ],
    [
        // Soundcloud
        /https?:\/\/(www\.)?soundcloud.com/,
        "ff5500",
    ],
    [
        // Steam
        /https?:\/\/(www\.)?store.steampowered.com/,
        "1b2838",
    ],
    [
        // Wikipedia
        /https?:\/\/(www\.)?wikipedia.org/,
        "000000",
    ],
    [
        // Facebook
        /https?:\/\/(www\.)?facebook.com/,
        "1877f2",
    ],
    [
        // Chat App (chat-app.mart1d4.dev or localhost:3000)
        /https?:\/\/(localhost:3000|chat-app.mart1d4.dev)/,
        "5865f2",
    ],
];

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
            (message.content.match(/https?:\/\/[^\s]+/g) || []).map(async (url: string) => {
                const inviteRegex =
                    /https?:\/\/(localhost:3000|chat-app.mart1d4.dev)\/[a-zA-Z0-9]{8}/;
                if (inviteRegex.test(url)) {
                    return null;
                }

                let color;
                // If domain matches a known embed type, make color the embed color
                for (const embedColor of embedColors) {
                    if (embedColor[0].test(url)) {
                        color = embedColor[1];
                        break;
                    }
                }

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

                    console.log(metadata);

                    if (metadata.status === "success") {
                        return {
                            type: "link",
                            url: url,
                            author: metadata.data.author,
                            title: metadata.data.title,
                            description: metadata.data.description,
                            image: metadata.data.image,
                            color: color,
                            date: metadata.data.date,
                        };
                    }

                    return null;
                } catch (error) {
                    console.log(error);
                    return null;
                }
            })
        );

        // Remove duplicate urls
        const uniqueEmbeds = embeds
            .filter((r: any) => r !== null)
            .filter((v, i, a) => a.findIndex((t) => t.url === v.url) === i);

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
