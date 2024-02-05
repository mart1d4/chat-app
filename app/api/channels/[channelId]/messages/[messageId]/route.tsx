import { NextResponse } from "next/server";
import { removeImage } from "@/lib/cdn";
import { headers } from "next/headers";
import { catchError } from "@/lib/api";
import { db } from "@/lib/db/db";

export async function PUT(req: Request, { params }: { params: { messageId: string } }) {
    const senderId = headers().get("X-UserId") || "";
    const { messageId } = params;

    const { content, attachments } = await req.json();

    if (content !== undefined && typeof content !== "string" && content !== null) {
        return NextResponse.json(
            {
                success: false,
                message: "Content must be a string or null",
            },
            { status: 400 }
        );
    }

    if (attachments !== undefined && !Array.isArray(attachments)) {
        return NextResponse.json(
            {
                success: false,
                message: "Attachments must be an array",
            },
            { status: 400 }
        );
    }

    try {
        const message = await db
            .selectFrom("messages")
            .select("attachments")
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

        const updatedMessage = await db
            .updateTable("messages")
            .set({ content: content })
            .set({ edited: new Date() })
            .$if(attachments, (q) =>
                q.set({
                    attachments: message.attachments?.length
                        ? message.attachments.filter((file) => attachments.includes(file.id))
                        : attachments,
                })
            )
            .where("id", "=", messageId)
            .where("authorId", "=", senderId)
            .executeTakeFirst();

        if (attachments && message.attachments.length !== attachments.length) {
            const toDelete = message.attachments.filter((file) => !attachments.includes(file.id));

            if (toDelete.length > 0) {
                toDelete.forEach((file) => {
                    removeImage(file.id);
                });
            }
        }

        return NextResponse.json(
            {
                success: true,
                message: "Successfully updated message",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}

export async function DELETE(req: Request, { params }: { params: { messageId: string } }) {
    const senderId = headers().get("X-UserId") || "";
    const { messageId } = params;

    try {
        const message = await db
            .selectFrom("messages")
            .select("attachments")
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

        const deletedMessage = await db
            .deleteFrom("messages")
            .where("id", "=", messageId)
            .where("authorId", "=", senderId)
            .executeTakeFirst();

        if (message.attachments?.length > 0) {
            message.attachments.forEach((file: any) => {
                removeImage(file.id);
            });
        }

        return NextResponse.json(
            {
                success: true,
                message: "Successfully deleted message",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}
