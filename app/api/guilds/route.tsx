import { defaultPermissions } from "@/lib/permissions/data";
import { getGuild, getRandomId } from "@/lib/db/helpers";
import { NextRequest, NextResponse } from "next/server";
import { removeImage } from "@/lib/cdn";
import { headers } from "next/headers";
import { catchError } from "@/lib/api";
import { db } from "@/lib/db/db";

export async function POST(req: NextRequest) {
    const senderId = parseInt(headers().get("X-UserId") || "0");
    const { name, icon } = await req.json();

    const guildId = getRandomId();
    const roleId = getRandomId();
    const textChannelId = getRandomId();
    const voiceChannelId = getRandomId();
    const textCategoryId = getRandomId();
    const voiceCategoryId = getRandomId();

    try {
        const memberObject = {
            userId: senderId,
            permissions: defaultPermissions,
            joinedAt: new Date(),
        };

        await db
            .insertInto("roles")
            .values({
                id: roleId,
                name: "everyone",
                position: 0,
                hoist: false,
                mentionable: false,
                permissions: JSON.stringify(defaultPermissions),
                guildId: guildId,
            })
            .executeTakeFirstOrThrow();

        await db
            .insertInto("channels")
            .values({
                id: textCategoryId,
                type: 4,
                name: "Text Channels",
                position: 0,
                guildId: guildId,
                permissionOverwrites: "[]",
            })
            .executeTakeFirstOrThrow();

        await db
            .insertInto("channels")
            .values({
                id: voiceCategoryId,
                type: 4,
                name: "Voice Channels",
                position: 2,
                guildId: guildId,
                permissionOverwrites: "[]",
            })
            .executeTakeFirstOrThrow();

        await db
            .insertInto("channels")
            .values({
                id: textChannelId,
                type: 2,
                name: "general",
                position: 1,
                parentId: textCategoryId,
                guildId: guildId,
                permissionOverwrites: "[]",
            })
            .executeTakeFirstOrThrow();

        await db
            .insertInto("channels")
            .values({
                id: voiceChannelId,
                type: 3,
                name: "General",
                position: 3,
                parentId: voiceCategoryId,
                guildId: guildId,
                permissionOverwrites: "[]",
            })
            .executeTakeFirstOrThrow();

        await db
            .insertInto("guilds")
            .values({
                id: guildId,
                name: name,
                icon: icon,
                ownerId: senderId,
                members: `[${JSON.stringify(memberObject)}]`,
                systemChannelId: textChannelId,
            })
            .executeTakeFirstOrThrow();

        await db
            .insertInto("guildmembers")
            .values({
                userId: senderId,
                guildId: guildId,
            })
            .executeTakeFirstOrThrow();

        const guild = await getGuild(guildId);

        return NextResponse.json(
            {
                success: true,
                message: "Successfully created guild.",
                guild: guild,
            },
            { status: 200 }
        );
    } catch (error) {
        if (icon) removeImage(icon);

        // Remove all created data
        db.deleteFrom("guilds").where("id", "=", guildId).execute();
        db.deleteFrom("roles").where("id", "=", roleId).execute();
        db.deleteFrom("channels").where("id", "=", textCategoryId).execute();
        db.deleteFrom("channels").where("id", "=", voiceCategoryId).execute();
        db.deleteFrom("channels").where("id", "=", textChannelId).execute();
        db.deleteFrom("channels").where("id", "=", voiceChannelId).execute();

        return catchError(req, error);
    }
}
