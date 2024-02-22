import { validInviteChannelTypes } from "@/lib/verifications";
import { defaultPermissions } from "@/lib/permissions/data";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { catchError } from "@/lib/api";
import { db } from "@/lib/db/db";
import {
    getChannelRecipientCount,
    getGuild,
    getInvite,
    getUser,
    isUserInChannel,
    isUserInGuild,
} from "@/lib/db/helpers";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
    const { code } = params;

    try {
        const invite = await getInvite(code);

        return NextResponse.json(
            {
                success: true,
                message: invite
                    ? "Successfuly fetched invite."
                    : "No invite was found with that code.",
                invite: invite || null,
            },
            { status: 200 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
    const senderId = parseInt(headers().get("X-UserId") || "0");
    const { code } = params;

    try {
        const user = await getUser({ id: senderId, throwOnNotFound: true });
        const invite = await getInvite(code);

        if (!invite || !invite.channel) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No invite was found with that code.",
                },
                { status: 400 }
            );
        }

        if (invite.uses >= invite.maxUses || Date.now() > invite.expiresAt.getTime()) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invite has expired.",
                },
                { status: 400 }
            );
        }

        if (!validInviteChannelTypes.includes(invite.channel.type)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid invite channel type.",
                },
                { status: 400 }
            );
        }

        if (invite.channel.type === 1) {
            const recipientCount = await getChannelRecipientCount(invite.channel.id);

            if ((await isUserInChannel(user.id, invite.channel.id)) || recipientCount >= 10) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Channel is full or you are already in it.",
                    },
                    { status: 400 }
                );
            } else {
                await db
                    .insertInto("channelrecipients")
                    .values({
                        channelId: invite.channel.id,
                        userId: user.id,
                    })
                    .execute();

                await db
                    .updateTable("invites")
                    .set({ uses: invite.uses + 1 })
                    .where("code", "=", code)
                    .execute();

                return NextResponse.json(
                    {
                        success: true,
                        message: "Successfully joined channel.",
                    },
                    { status: 200 }
                );
            }
        } else {
            if (!invite.guildId) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid invite guild id.",
                    },
                    { status: 400 }
                );
            } else if (await isUserInGuild(user.id, invite.guildId)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "You are already in this guild.",
                    },
                    { status: 400 }
                );
            } else {
                const guild = await getGuild(invite.guildId);

                if (!guild) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Invalid invite guild id.",
                        },
                        { status: 400 }
                    );
                }

                const memberObject = {
                    userId: user.id,
                    permissions: defaultPermissions,
                    joinedAt: new Date(),
                };

                const newMembers = [...guild.members, memberObject];

                await db
                    .updateTable("guilds")
                    .set({
                        members: JSON.stringify(newMembers),
                    })
                    .where("id", "=", guild.id)
                    .execute();

                await db
                    .insertInto("guildmembers")
                    .values({
                        userId: user.id,
                        guildId: guild.id,
                    })
                    .execute();

                await db
                    .updateTable("invites")
                    .set({ uses: invite.uses + 1 })
                    .where("code", "=", code)
                    .execute();

                return NextResponse.json(
                    {
                        success: true,
                        message: "Successfully joined guild.",
                    },
                    { status: 200 }
                );
            }
        }
    } catch (error) {
        return catchError(req, error);
    }
}
