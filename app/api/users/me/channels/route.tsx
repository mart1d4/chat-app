import { getRandomId, getUser } from "@/lib/db/helpers";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { catchError } from "@/lib/api";
import { db } from "@/lib/db/db";

export async function POST(req: NextRequest) {
    const userId = parseInt(headers().get("X-UserId") || "0");
    const { recipients } = await req.json();
    const id = getRandomId();

    if (!recipients || recipients.length < 0 || recipients.length > 9) {
        return NextResponse.json(
            {
                success: false,
                message: "The recipients you provided are invalid.",
            },
            { status: 400 }
        );
    }

    try {
        const user = await getUser({
            select: {
                id: true,
                hiddenChannelIds: true,
            },
            throwOnNotFound: true,
        });

        if (recipients.length === 0) {
            await db
                .insertInto("channels")
                .values({
                    id: id,
                    type: 1,
                    ownerId: user.id,
                    permissionOverwrites: "[]",
                })
                .execute();

            await db
                .insertInto("channelrecipients")
                .values({
                    channelId: id,
                    userId: user.id,
                })
                .execute();

            return NextResponse.json(
                {
                    success: true,
                    message: "Successfully created a channel.",
                },
                { status: 201 }
            );
        }

        if (recipients.length === 1) {
            const recipient = await getUser({
                id: recipients[0],
                select: {
                    id: true,
                    username: true,
                },
                throwOnNotFound: true,
            });

            const channelExists = await db
                .selectFrom("channels")
                .innerJoin(
                    (eb) =>
                        eb
                            .selectFrom("channelrecipients")
                            .select(["channelId", "userId"])
                            .where("userId", "in", [userId, recipient.id])
                            .as("cr"),
                    (join) => join.onRef("channels.id", "=", "cr.channelId")
                )
                .select(["channels.id", "channels.icon", "channels.type"])
                .groupBy("channels.id")
                .having((eb) =>
                    eb.and([
                        eb(eb.fn.count("cr.userId").distinct(), "=", 2),
                        eb(eb.fn.count("channels.id").distinct(), "=", 1),
                        eb("channels.type", "=", 0),
                    ])
                )
                .executeTakeFirst();

            if (!channelExists) {
                await db
                    .insertInto("channels")
                    .values({
                        id: id,
                        type: 0,
                        permissionOverwrites: "[]",
                    })
                    .execute();

                await db
                    .insertInto("channelrecipients")
                    .values([
                        {
                            channelId: id,
                            userId: userId,
                        },
                        {
                            channelId: id,
                            userId: recipient.id,
                        },
                    ])
                    .execute();

                return NextResponse.json(
                    {
                        success: true,
                        message: "Successfully created a DM channel.",
                    },
                    { status: 201 }
                );
            } else {
                const channelLink = await db
                    .selectFrom("channelrecipients")
                    .select("isHidden")
                    .where("channelId", "=", channelExists.id)
                    .where("userId", "=", userId)
                    .executeTakeFirst();

                const isHidden = channelLink?.isHidden;

                if (isHidden) {
                    await db
                        .updateTable("channelrecipients")
                        .set("isHidden", false)
                        .where("channelId", "=", channelExists.id)
                        .where("userId", "=", userId)
                        .execute();

                    return NextResponse.json(
                        {
                            success: true,
                            message: "Successfully joined channel.",
                        },
                        { status: 201 }
                    );
                } else {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "You are already in this channel.",
                        },
                        { status: 400 }
                    );
                }
            }
        }

        if (recipients.length > 1) {
            const recipientsUser = await db
                .selectFrom("users")
                .selectAll()
                .where("id", "in", recipients)
                .execute();

            if (recipientsUser.length !== recipients.length) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "The recipients you provided are invalid.",
                    },
                    { status: 400 }
                );
            }

            await db
                .insertInto("channels")
                .values({
                    id: id,
                    type: 1,
                    ownerId: user.id,
                    permissionOverwrites: "[]",
                })
                .execute();

            await db
                .insertInto("channelrecipients")
                .values([
                    ...recipients.map((r: number) => ({
                        channelId: id,
                        userId: r,
                    })),
                    {
                        channelId: id,
                        userId: user.id,
                    },
                ])
                .execute();

            return NextResponse.json(
                {
                    success: true,
                    message: "Successfully created a channel.",
                },
                { status: 201 }
            );
        }
    } catch (error) {
        await db.deleteFrom("channels").where("id", "=", id).execute();
        return catchError(req, error);
    }
}
