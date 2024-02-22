import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { catchError } from "@/lib/api";
import { db } from "@/lib/db/db";
import {
    getUser,
    getChannel,
    getRandomId,
    isUserInChannel,
    getChannelRecipientCount,
} from "@/lib/db/helpers";

export async function DELETE(req: NextRequest, { params }: { params: { channelId: string } }) {
    const userId = parseInt(headers().get("X-UserId") || "0");
    const { searchParams } = new URL(req.url);
    const { channelId } = params;

    const messageId = getRandomId();

    try {
        await getUser({ throwOnNotFound: true });

        if (!(await isUserInChannel(userId, channelId))) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not in this channel.",
                },
                { status: 401 }
            );
        }

        const channel = await getChannel(channelId);

        if (!channel) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No channel found with the provided ID.",
                },
                { status: 404 }
            );
        }

        if (channel.type === 0) {
            await db
                .updateTable("channelrecipients")
                .set({ isHidden: true })
                .where("userId", "=", userId)
                .where("channelId", "=", channelId)
                .execute();

            return NextResponse.json(
                {
                    success: true,
                    message: "Successfully hidden channel.",
                    channelId: channelId,
                },
                { status: 200 }
            );
        } else if (channel.type === 1) {
            const recipientCount = await getChannelRecipientCount(channelId);

            if (recipientCount === 1) {
                await db
                    .updateTable("channels")
                    .set({ isDeleted: true })
                    .where("id", "=", channelId)
                    .execute();

                await db
                    .deleteFrom("channelrecipients")
                    .where("channelId", "=", channelId)
                    .execute();

                return NextResponse.json(
                    {
                        success: true,
                        message: "Successfully deleted channel.",
                        channelId: channelId,
                    },
                    { status: 200 }
                );
            } else {
                const hideLeft = searchParams.get("hideLeft") === "true";

                await db
                    .deleteFrom("channelrecipients")
                    .where("userId", "=", userId)
                    .where("channelId", "=", channelId)
                    .execute();

                if (!hideLeft) {
                    await db
                        .insertInto("messages")
                        .values({
                            id: id,
                            type: 3,
                            authorId: userId,
                            channelId: channelId,
                            mentions: JSON.stringify([userId]),
                        })
                        .execute();
                }

                return NextResponse.json(
                    {
                        success: true,
                        message: "Successfully left channel.",
                        channelId: channelId,
                    },
                    { status: 200 }
                );
            }
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "The channel type is invalid.",
                },
                { status: 404 }
            );
        }
    } catch (error) {
        await db.deleteFrom("messages").where("id", "=", messageId).execute();
        return catchError(req, error);
    }
}
