import { NextResponse } from "next/server";
import { removeImage } from "@/lib/cdn";
import { headers } from "next/headers";
import { db } from "@/lib/db/db";

export async function DELETE(req: Request): Promise<NextResponse> {
    const senderId = parseInt(headers().get("X-UserId") || "");
    const { attachments } = await req.json();

    try {
        const sender = await db.selectFrom("users").select("id").where("id", "=", senderId).executeTakeFirst();

        if (!sender) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found.",
                },
                { status: 404 }
            );
        }

        if (attachments.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No attachments found.",
                },
                { status: 404 }
            );
        }

        attachments.forEach(async (attachment: Attachment) => {
            await removeImage(attachment.id);
        });

        return NextResponse.json(
            {
                success: true,
                message: "Attachments deleted.",
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
