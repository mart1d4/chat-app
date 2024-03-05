import { canUserManageChannel, getChannel, getUser } from "@/lib/db/helpers";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { catchError } from "@/lib/api";
import { db } from "@/lib/db/db";

export async function PATCH(req: NextRequest, { params }: { params: { channelId: string } }) {
    const senderId = parseInt(headers().get("X-UserId") || "0");
    const { name, icon, topic } = await req.json();
    const { channelId } = params;

    if (!name && !icon && !topic) {
        return NextResponse.json(
            {
                success: false,
                message: "You must provide at least one field to update.",
            },
            { status: 400 }
        );
    }

    try {
        const channel = await getChannel(channelId);

        if (!channel) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Could not find channel with that ID.",
                },
                { status: 404 }
            );
        }

        if (
            !(await canUserManageChannel(senderId, channel.guildId)) &&
            channel.ownerId !== senderId
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You cannot edit this channel.",
                },
                { status: 401 }
            );
        }

        if (topic && channel.type !== 2) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You cannot set a topic on a non-text channel.",
                },
                { status: 400 }
            );
        }

        if (icon && channel.type !== 1) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You cannot set an icon on a non-group-dm channel.",
                },
                { status: 400 }
            );
        }

        await db
            .updateTable("channels")
            .$if(!!name, (q) => q.set({ name }))
            .$if(!!icon, (q) => q.set({ icon }))
            .$if(!!topic, (q) => q.set({ topic }))
            .where("id", "=", channelId)
            .execute();

        return NextResponse.json(
            {
                success: true,
                message: "Successfully updated channel.",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { channelId: string } }) {
    const userId = parseInt(headers().get("X-UserId") || "0");
    const { channelId } = params;

    try {
        const user = await getUser({
            id: userId,
            throwOnNotFound: true,
        });

        const channel = await getChannel(channelId);

        if (!channel) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Could not find channel with that ID.",
                },
                { status: 404 }
            );
        }

        if (!(await canUserManageChannel(user.id, channel.guildId))) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You cannot delete this channel",
                },
                { status: 401 }
            );
        }

        if (channel.type === 4) {
            const textChannels = await db
                .selectFrom("channels")
                .select(["id", "position"])
                .where("type", "=", 2)
                .where("parentId", "=", channelId)
                .orderBy("position", "asc")
                .execute();

            const voiceChannels = await db
                .selectFrom("channels")
                .select(["id", "position"])
                .where("type", "=", 3)
                .where("parentId", "=", channelId)
                .orderBy("position", "asc")
                .execute();

            if (textChannels.length > 0) {
                let position = 0;

                const max = (
                    await db
                        .selectFrom("channels")
                        .select((eb) => eb.fn.max("position").as("position"))
                        .where("guildId", "=", channel.guildId)
                        .where("type", "=", 2)
                        .where("parentId", "is", null)
                        .executeTakeFirstOrThrow()
                ).position;

                if (max !== null) {
                    position = max + 1;
                }

                let i = position;

                for (const textChannel of textChannels) {
                    console.log(
                        "Moving channel from position ",
                        textChannel.position,
                        " to position ",
                        i
                    );

                    await db
                        .updateTable("channels")
                        .set({
                            position: i,
                            parentId: null,
                        })
                        .where("id", "=", textChannel.id)
                        .execute();

                    i++;
                }

                await db
                    .updateTable("channels")
                    .set((eb) => ({
                        position: eb("position", "+", textChannels.length),
                    }))
                    .where("guildId", "=", channel.guildId)
                    .where("position", ">=", position)
                    .where("position", "<=", channel.position)
                    .where(({ not, eb }) =>
                        not(
                            eb(
                                "id",
                                "in",
                                textChannels.map((c) => c.id)
                            )
                        )
                    )
                    .execute();
            }

            if (voiceChannels.length > 0) {
                let position = 0;

                const max = (
                    await db
                        .selectFrom("channels")
                        .select((eb) => eb.fn.max("position").as("position"))
                        .where("guildId", "=", channel.guildId)
                        .where(({ eb, or }) => or([eb("type", "=", 3), eb("type", "=", 2)]))
                        .where("parentId", "is", null)
                        .executeTakeFirstOrThrow()
                ).position;

                if (max !== null) {
                    position = max + 1;
                }

                let i = position;

                for (const voiceChannel of voiceChannels) {
                    await db
                        .updateTable("channels")
                        .set({
                            position: i,
                            parentId: null,
                        })
                        .where("id", "=", voiceChannel.id)
                        .execute();

                    i++;
                }

                await db
                    .updateTable("channels")
                    .set((eb) => ({
                        position: eb("position", "+", voiceChannels.length),
                    }))
                    .where("guildId", "=", channel.guildId)
                    .where("position", ">=", position)
                    .where("position", "<=", channel.position + textChannels.length)
                    .where(({ not, eb }) =>
                        not(
                            eb(
                                "id",
                                "in",
                                voiceChannels.map((c) => c.id)
                            )
                        )
                    )
                    .execute();
            }

            await db
                .updateTable("channels")
                .set({
                    isDeleted: true,
                    guildId: null,
                })
                .where("id", "=", channelId)
                .execute();

            await db
                .updateTable("channels")
                .set((eb) => ({
                    position: eb("position", "-", 1),
                }))
                .where("guildId", "=", channel.guildId)
                .where("position", ">", channel.position)
                .execute();
        } else {
            await db
                .updateTable("channels")
                .set({
                    isDeleted: true,
                    guildId: null,
                })
                .where("id", "=", channelId)
                .execute();

            await db
                .updateTable("channels")
                .set((eb) => ({
                    position: eb("position", "-", 1),
                }))
                .where("guildId", "=", channel.guildId)
                .where("position", ">", channel.position)
                .execute();
        }

        return NextResponse.json(
            {
                success: true,
                message: `Successfully deleted ${channel.type === 4 ? "category" : "channel"}.`,
            },
            { status: 200 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}
