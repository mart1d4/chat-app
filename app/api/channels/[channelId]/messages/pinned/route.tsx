import { decryptMessage } from "@/lib/encryption";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { headers } from "next/headers";
import { getUser, isUserInChannel } from "@/lib/db/helpers";

export async function GET(req: Request, { params }: { params: { channelId: string } }) {
    const senderId = headers().get("X-UserId") || "";
    const channelId = params.channelId;

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

        return NextResponse.json(
            {
                success: true,
                message: "Successfully retrieved pinned messages",
                pinned: channel.messages.map((message) => {
                    return {
                        ...message,
                        content: decryptMessage(message.content),
                        messageReference: {
                            ...message.messageReference,
                            content: decryptMessage(message.messageReference?.content || ""),
                        },
                    };
                }),
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
