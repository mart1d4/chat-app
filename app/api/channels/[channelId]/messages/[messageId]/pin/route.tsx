import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { catchError } from "@/lib/api";
import { db } from "@/lib/db/db";
import { getRandomId } from "@/lib/db/helpers";

export async function POST(
    req: Request,
    { params }: { params: { channelId: string; messageId: string } }
) {
    const senderId = parseInt(headers().get("X-UserId") || "0");
    const { channelId, messageId } = params;

    try {
        const message = await db
            .updateTable("messages")
            .set({ pinned: new Date() })
            .where("id", "=", messageId)
            .where("authorId", "=", senderId)
            .executeTakeFirst();

        if (!message) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Message not found",
                },
                { status: 404 }
            );
        }

        const pinnedId = getRandomId();

        const pinMessage = await db
            .insertInto("messages")
            .values({
                id: pinnedId,
                type: 7,
                authorId: senderId,
                channelId: channelId,
                messageReferenceId: messageId,
            })
            .executeTakeFirst();

        return NextResponse.json(
            {
                success: true,
                message: "Successfully pinned message",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}

export async function DELETE(req: Request, { params }: { params: { messageId: string } }) {
    const senderId = parseInt(headers().get("X-UserId") || "0");
    const { messageId } = params;

    try {
        const message = await db
            .updateTable("messages")
            .set({ pinned: null })
            .where("id", "=", messageId)
            .where("authorId", "=", senderId)
            .executeTakeFirst();

        if (!message) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Message not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Successfully removed pin from message",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}
