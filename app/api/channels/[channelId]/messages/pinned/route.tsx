import { getMessages, isUserInChannel } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { catchError } from "@/lib/api";
import { db } from "@/lib/db/db";

export async function GET(req: Request, { params }: { params: { channelId: string } }) {
    const senderId = headers().get("X-UserId") || "";
    const { channelId } = params;

    try {
        if (!isUserInChannel(senderId, channelId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not in this channel",
                },
                { status: 401 }
            );
        }

        const messages = await getMessages(channelId, 100, true);

        return NextResponse.json(
            {
                success: true,
                message: "Successfully retrieved pinned messages",
                pinned: messages,
            },
            { status: 200 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}
