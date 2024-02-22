import { canUserManageChannel, getChannel, getRandomId } from "@/lib/db/helpers";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { catchError } from "@/lib/api";
import { db } from "@/lib/db/db";

export async function POST(req: NextRequest, { params }: { params: { guildId: string } }) {
    const senderId = parseInt(headers().get("X-UserId") || "0");
    const { guildId } = params;

    const { name, type, categoryId, locked } = await req.json();
    const channelId = getRandomId();

    if (!name || !type) {
        return NextResponse.json(
            {
                success: false,
                message: "Name and type are required.",
            },
            { status: 400 }
        );
    }

    try {
        if (!(await canUserManageChannel(senderId, guildId))) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You do not have permission to create a channel in this guild.",
                },
                { status: 401 }
            );
        }

        const category = categoryId ? await getChannel(categoryId, ["id", "position"]) : null;

        if (categoryId && !category) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No category found with the provided ID.",
                },
                { status: 404 }
            );
        }

        const count = (
            await db
                .selectFrom("channels")
                .select((eb) => eb.fn.countAll<number>().as("count"))
                .where("guildId", "=", guildId)
                .executeTakeFirstOrThrow()
        ).count;

        if (count >= 100) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You have reached the maximum number of channels for this guild.",
                },
                { status: 400 }
            );
        }

        if (type === 4) {
            // If channel is a category (type 4),
            // create it and add it at last position

            await db
                .insertInto("channels")
                .values({
                    id: channelId,
                    name,
                    type,
                    guildId,
                    position: count,
                    permissionOverwrites: "[]",
                })
                .execute();

            return NextResponse.json(
                {
                    success: true,
                    message: "Successfully created category.",
                },
                { status: 200 }
            );
        } else {
            // If channel is not a category, create it
            // Its position depends whether it is a text or voice channel
            // and if it is in a category or not
            // if it is in a category, it will be the last channel in the category
            // if it is not in a category, it will be the last channel in the guild
            // note that text channels must be before voice channels (type 2 < type 3)

            let position;

            if (category) {
                const max = (
                    await db
                        .selectFrom("channels")
                        .select((eb) => eb.fn.max("position").as("position"))
                        .where("guildId", "=", guildId)
                        .where("parentId", "=", categoryId)
                        .$if(type === 2, (eb) => eb.where("type", "=", 2))
                        .$if(type === 3, (eb) =>
                            eb.where(({ eb, or }) => or([eb("type", "=", 3), eb("type", "=", 2)]))
                        )
                        .executeTakeFirstOrThrow()
                ).position;

                // If there are no channels of the same type in the category,
                // set position to the category's position + 1

                if (max === null) {
                    position = category.position + 1;
                } else {
                    position = max + 1;
                }
            } else {
                const max = (
                    await db
                        .selectFrom("channels")
                        .select((eb) => eb.fn.max("position").as("position"))
                        .where("guildId", "=", guildId)
                        .$if(type === 2, (eb) => eb.where("type", "=", 2))
                        .$if(type === 3, (eb) =>
                            eb.where(({ eb, or }) => or([eb("type", "=", 3), eb("type", "=", 2)]))
                        )
                        .where("parentId", "is", null)
                        .executeTakeFirstOrThrow()
                ).position;

                if (max === null) {
                    position = 0;
                } else {
                    position = max + 1;
                }
            }

            // Update all channels after the new channel to have their position increased by 1
            await db
                .updateTable("channels")
                .set((eb) => ({
                    position: eb("position", "+", 1),
                }))
                .where("guildId", "=", guildId)
                .where("position", ">=", position)
                .execute();

            await db
                .insertInto("channels")
                .values({
                    id: channelId,
                    name: name,
                    type: type,
                    guildId: guildId,
                    parentId: categoryId,
                    position: position,
                    permissionOverwrites: "[]",
                })
                .execute();

            return NextResponse.json(
                {
                    success: true,
                    message: "Successfully created channel.",
                },
                { status: 200 }
            );
        }
    } catch (error) {
        await db.deleteFrom("channels").where("id", "=", channelId).execute();
        return catchError(req, error);
    }
}
