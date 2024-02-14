import pusher from "@/lib/pusher/server-connection";
import { getUser } from "@/lib/db/helpers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { socketId, channel } = await req.json();

    try {
        const user = await getUser({});

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 403 }
            );
        }

        const response = pusher.authorizeChannel(socketId, channel, user);

        return NextResponse.json({
            success: true,
            message: "User authorized",
            ...response,
            channel_data: JSON.stringify(user),
        });
    } catch (e) {
        return new Response("Unauthorized", { status: 401 });
    }
}
