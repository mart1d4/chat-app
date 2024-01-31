import { getUser, isUserInChannel } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db/db";

export async function GET(req: Request, { params }: { params: { channelId: string } }) {
    const senderId = headers().get("X-UserId") || "";
    const { channelId } = params;

    try {
        const user = await getUser({ id: senderId, throwOnNotFound: true });

        if (!isUserInChannel(user.id, channelId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not in this channel",
                },
                { status: 401 }
            );
        }

        // pinned is a datetime

        const messages = await db
            .selectFrom("messages")
            .where("channelId", "=", channelId)
            .where("pinned", "is not", null)
            .select(["id", "content", "authorId", "createdAt", "pinned"])
            .orderBy("createdAt", "desc")
            .execute();

        return NextResponse.json(
            {
                success: true,
                message: "Successfully retrieved pinned messages",
                pinned: messages,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(`[ERROR] GET /api/channels/${channelId}/messages/pinned`, error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
