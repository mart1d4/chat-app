import pusher from "@/lib/pusher/server-connection";
import { getUser } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { catchError } from "@/lib/api";

export async function POST(req: Request) {
    // req.json() triggering error
    console.log(await req.json());

    const { socketId, channel } = await req.json();

    try {
        const user = await getUser({ throwOnNotFound: true });

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
