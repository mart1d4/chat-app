import pusher from "@/lib/pusher/server-connection";
import { getUser } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { catchError } from "@/lib/api";

export async function POST(req: Request) {
    const data = await req.json();

    console.log(data);

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

        const userObj = {
            user_id: user.id,
            user_info: {
                name: user.username,
            },
        };

        const response = pusher.authorizeChannel(socketId, channel, userObj);

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        return catchError(req, error);
    }
}
