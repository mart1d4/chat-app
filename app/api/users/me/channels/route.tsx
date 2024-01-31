import { getRandomId, getUser } from "@/lib/db/helpers";
import pusher from "@/lib/pusher/server-connection";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db/db";

const channelIcons = [
    "3d035ad7-d7e0-4d8d-8efd-3ac56c9bdc88",
    "43c097c9-8748-42aa-b829-9f43c5971f44",
    "2e40ea3b-fd2a-408f-8c60-8c87e8500814",
    "db343e4f-5873-48a3-86c7-16c05230300a",
    "43f72250-ea5d-42e7-962c-dc082257ccc9",
    "ea338819-493f-4f9f-ac87-f108d1923713",
    "b173e5fb-eeee-410d-a257-27af06d7a4ba",
];

const getRandomIcon = () => {
    return channelIcons[Math.floor(Math.random() * channelIcons.length)];
};

export async function POST(req: Request) {
    const userId = parseInt(headers().get("X-UserId") || "");
    const { recipients } = await req.json();

    if (!recipients || recipients.length < 0 || recipients.length > 9) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid recipients",
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
            // Create a DM with just the user

            const id = getRandomId();

            await db
                .insertInto("channels")
                .values({
                    id: id,
                    type: 1,
                    icon: getRandomIcon(),
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

            const channel = await db
                .selectFrom("channels")
                .selectAll()
                .where("id", "=", id)
                .executeTakeFirst();

            await pusher.trigger("chat-app", "channel-update", {
                type: "CHANNEL_ADDED",
                channel: {
                    ...channel,
                    recipients: [],
                },
            });

            return NextResponse.json(
                {
                    success: true,
                    message: "Channel created successfully",
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
                // Create a DM channel

                const id = getRandomId();

                const channel = await db
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

                await pusher.trigger("chat-app", "channel-update", {
                    type: "CHANNEL_ADDED",
                    channel: channel,
                });

                return NextResponse.json(
                    {
                        success: true,
                        message: "Channel created successfully",
                        channelId: id,
                    },
                    { status: 201 }
                );
            } else {
                // If channel exists, check if the user has it hidden
                // If so, unhide it, otherwise, do nothing

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

                    await pusher.trigger("chat-app", "channel-update", {
                        type: "CHANNEL_ADDED",
                        channel: channelExists,
                    });

                    return NextResponse.json(
                        {
                            success: true,
                            message: "Channel added successfully",
                            channelId: channelExists.id,
                        },
                        { status: 201 }
                    );
                } else {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Already in channel",
                        },
                        { status: 400 }
                    );
                }
            }
        }

        if (recipients.length > 1) {
            // Create a group channel

            const recipientsUser = await db
                .selectFrom("users")
                .selectAll()
                .where("id", "in", recipients)
                .execute();

            if (recipientsUser.length !== recipients.length) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid recipients",
                    },
                    { status: 400 }
                );
            }

            const id = getRandomId();

            const channel = await db
                .insertInto("channels")
                .values({
                    id: id,
                    type: 1,
                    icon: getRandomIcon(),
                    ownerId: user.id,
                    permissionOverwrites: "[]",
                })
                .execute();

            await db
                .insertInto("channelrecipients")
                .values([
                    ...recipients.map((r) => ({
                        channelId: id,
                        userId: r,
                    })),
                    {
                        channelId: id,
                        userId: user.id,
                    },
                ])
                .execute();

            await pusher.trigger("chat-app", "channel-update", {
                type: "CHANNEL_ADDED",
                channel: channel,
            });

            return NextResponse.json(
                {
                    success: true,
                    message: "Channel created successfully",
                    channelId: id,
                },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error(`[ERROR] /api/users/me/channels - ${error}`);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
}
