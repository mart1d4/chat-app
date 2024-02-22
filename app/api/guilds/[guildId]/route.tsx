import { NextRequest, NextResponse } from "next/server";
import { isUserGuildOwner } from "@/lib/db/helpers";
import { catchError } from "@/lib/api";
import { headers } from "next/headers";
import { db } from "@/lib/db/db";

export async function DELETE(req: NextRequest, { params }: { params: { guildId: string } }) {
    const senderId = parseInt(headers().get("X-UserId") || "0");
    const { guildId } = params;

    try {
        if (!(await isUserGuildOwner(senderId, guildId))) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not the owner of this guild.",
                },
                { status: 401 }
            );
        }

        await db.updateTable("guilds").set({ isDeleted: true }).where("id", "=", guildId).execute();

        await db
            .updateTable("channels")
            .set({ isDeleted: true })
            .where("guildId", "=", guildId)
            .execute();

        await db.deleteFrom("guildmembers").where("guildId", "=", guildId).execute();

        return NextResponse.json(
            {
                success: true,
                message: "Successfully deleted guild.",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}
