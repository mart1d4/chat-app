import {
    getChannel,
    getInvite,
    getInvites,
    getRandomId,
    withChannel,
    withGuild,
    withInviter,
} from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { catchError } from "@/lib/api";
import { headers } from "next/headers";
import { db } from "@/lib/db/db";

export async function GET(req: Request, { params }: { params: { channelId: string } }) {
    const senderId = parseInt(headers().get("X-UserId") || "0");
    const { channelId } = params;

    try {
        const channel = await db
            .selectFrom("channels")
            .select("id")
            .where(({ eb, and, exists, selectFrom }) =>
                and([
                    eb("id", "=", channelId),
                    eb("guildId", "is not", null),
                    exists(
                        selectFrom("guildmembers")
                            .select("userId")
                            .whereRef("userId", "=", senderId)
                            .whereRef("guildId", "=", "channels.guildId")
                    ),
                ])
            )
            .executeTakeFirst();

        if (!channel) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Channel not found or you are not in this channel",
                },
                { status: 404 }
            );
        }

        const invites = await getInvites(channelId);

        return NextResponse.json(
            {
                success: true,
                invites: invites,
            },
            { status: 200 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}

export async function POST(req: Request, { params }: { params: { channelId: string } }) {
    const senderId = parseInt(headers().get("X-UserId") || "0");
    const { channelId } = params;

    const { maxUses, maxAge, temporary } = await req.json();

    try {
        const channel = await getChannel(channelId, ["id", "guildId"]);

        if (!channel) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No channel found with this ID.",
                },
                { status: 404 }
            );
        }

        // Search for same invite, otherwise create one
        const invite = await db
            .selectFrom("invites")
            .select((eb) => [
                "id",
                "code",
                "maxUses",
                "maxAge",
                "temporary",
                withInviter(eb),
                withChannel(eb),
                withGuild(eb),
            ])
            .where(({ eb, and }) =>
                and([
                    eb("channelId", "=", channelId),
                    eb("maxUses", "=", maxUses),
                    eb("maxAge", "=", maxAge),
                    eb("temporary", "=", temporary),
                    eb("inviterId", "=", senderId),
                ])
            )
            .executeTakeFirst();

        if (invite) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Successfully found invite with same settings.",
                    invite: invite,
                },
                { status: 200 }
            );
        } else {
            const code = Math.random().toString(36).substring(2, 10);

            await db
                .insertInto("invites")
                .values({
                    id: getRandomId(),
                    channelId: channelId,
                    guildId: channel.guildId,
                    maxUses: maxUses,
                    maxAge: maxAge,
                    expiresAt: new Date(Date.now() + (maxAge || 86400) * 1000),
                    temporary: temporary,
                    inviterId: senderId,
                    code: code,
                })
                .execute();

            const newInvite = await getInvite(code);

            return NextResponse.json(
                {
                    success: true,
                    message: "Successfully created invite",
                    invite: newInvite,
                },
                { status: 200 }
            );
        }
    } catch (error) {
        return catchError(req, error);
    }
}
