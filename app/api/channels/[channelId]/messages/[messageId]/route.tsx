import pusher from "@/lib/pusher/server-connection";
import { NextResponse } from "next/server";
import { removeImage } from "@/lib/cdn";
import { headers } from "next/headers";
import { db } from "@/lib/db/db";

export async function PUT(
    req: Request,
    { params }: { params: { channelId: string; messageId: string } }
) {
    const senderId = headers().get("X-UserId") || "";

    const { channelId, messageId } = params;
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
            .where("id", "=", messageId)
            .selectAll()
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

        if (message.authorId != parseInt(senderId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not the author of this message",
                },
                { status: 403 }
            );
            2;
        }

        const newMessage = await db
            .updateTable("messages")
            .set({ content: content })
            .set({ edited: new Date() })
            .$if(attachments !== undefined, (q) =>
                q.set({
                    attachments: message.attachments.length
                        ? message.attachments.filter((file) => attachments.includes(file.id))
                        : attachments,
                })
            )``
            .where("id", "=", messageId)
            .executeTakeFirst();

        if (attachments && message.attachments.length !== attachments.length) {
            const toDelete = message.attachments.filter((file) => !attachments.includes(file.id));

            if (toDelete.length > 0) {
                toDelete.forEach(async (file) => {
                    removeImage(file.id);
                });
            }
        }

        pusher.trigger("chat-app", "message-edited", {
            channelId: channelId,
            message: newMessage,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Successfully updated message",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { channelId: string; messageId: string } }
) {
    const senderId = headers().get("X-UserId") || "";
    const { channelId, messageId } = params;

    try {
        const deletedMessage = await db
            .deleteFrom("messages")
            .where("id", "=", messageId)
            .where("authorId", "=", senderId)
            .executeTakeFirst();

        if (!deletedMessage) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Message not found",
                },
                { status: 404 }
            );
        }

        // if (message.attachments.length > 0) {
        //     message.attachments.forEach(async (attachment: any) => {
        //         removeImage(attachment.id);
        //     });
        // }

        await pusher.trigger("chat-app", "message-deleted", {
            channelId: channelId,
            messageId: messageId,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Successfully deleted message",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
