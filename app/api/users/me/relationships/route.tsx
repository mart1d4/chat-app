import {
    areFriends,
    hasUserBlocked,
    hasUserReceivedRequest,
    hasUserSentRequest,
    isUserBlockedBy,
} from "@/lib/db/helpers";
import pusher from "@/lib/pusher/server-connection";
import { usernameRegex } from "@/lib/verifications";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db/db";
import { sql } from "kysely";

export async function POST(req: Request): Promise<NextResponse> {
    const senderId = parseInt(headers().get("X-UserId") || "");
    const { username } = await req.json();

    if (!usernameRegex.test(username)) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid Username",
            },
            { status: 400 }
        );
    }

    try {
        const sender = await db
            .selectFrom("users")
            .select([
                "id",
                "username",
                "displayName",
                "avatar",
                "banner",
                "status",
                "customStatus",
                "primaryColor",
                "accentColor",
                "description",
                "createdAt",
            ])
            .where("id", "=", senderId)
            .executeTakeFirst();

        const receiver = await db
            .selectFrom("users")
            .select([
                "id",
                "username",
                "displayName",
                "avatar",
                "banner",
                "status",
                "customStatus",
                "primaryColor",
                "accentColor",
                "description",
                "createdAt",
            ])
            .where(sql`username = BINARY ${username}`)
            .executeTakeFirst();

        if (!sender || !receiver) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Hm. didn't work. Double check that the username is correct.",
                },
                { status: 404 }
            );
        }

        if (sender.id === receiver.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You cannot add yourself as a friend.",
                },
                { status: 400 }
            );
        }

        if (
            (await hasUserBlocked(senderId, receiver.id)) ||
            (await isUserBlockedBy(senderId, receiver.id))
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You cannot add this user as a friend.",
                },
                { status: 400 }
            );
        }

        if (await areFriends(senderId, receiver.id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are already friends with this user.",
                },
                { status: 400 }
            );
        }

        if (await hasUserSentRequest(senderId, receiver.id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You have already sent a friend request to this user.",
                },
                { status: 400 }
            );
        }

        if (await hasUserReceivedRequest(senderId, receiver.id)) {
            await db
                .insertInto("friends")
                .values({
                    A: senderId,
                    B: receiver.id,
                })
                .execute();

            await db
                .deleteFrom("requests")
                .where("requesterId", "=", receiver.id)
                .where("requestedId", "=", sender.id)
                .execute();

            await pusher.trigger("chat-app", "user-relation", {
                type: "FRIEND_ADDED",
                sender: sender,
                receiver: receiver,
            });

            return NextResponse.json(
                {
                    success: true,
                    message: "You are now friends with this user.",
                },
                { status: 200 }
            );
        }

        await db
            .insertInto("requests")
            .values({
                requesterId: senderId,
                requestedId: receiver.id,
            })
            .execute();

        await pusher.trigger("chat-app", "user-relation", {
            type: "REQUEST_SENT",
            sender: sender,
            receiver: receiver,
        });

        return NextResponse.json(
            {
                success: true,
                message: `Success. Friend request sent to ${receiver.username}.`,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(`[ERROR] /api/users/me/friends/[username]`, error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request): Promise<NextResponse> {
    const senderId = parseInt(headers().get("X-UserId") || "");
    const { username } = await req.json();

    if (!usernameRegex.test(username)) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid Username",
            },
            { status: 400 }
        );
    }

    try {
        const sender = await db
            .selectFrom("users")
            .select([
                "id",
                "username",
                "displayName",
                "avatar",
                "banner",
                "status",
                "customStatus",
                "primaryColor",
                "accentColor",
                "description",
                "createdAt",
            ])
            .where("id", "=", senderId)
            .executeTakeFirst();

        const receiver = await db
            .selectFrom("users")
            .select([
                "id",
                "username",
                "displayName",
                "avatar",
                "banner",
                "status",
                "customStatus",
                "primaryColor",
                "accentColor",
                "description",
                "createdAt",
            ])
            .where(sql`username = BINARY ${username}`)
            .executeTakeFirst();

        if (!sender || !receiver) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found.",
                },
                { status: 404 }
            );
        }

        if (sender.id === receiver.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You cannot remove yourself as a friend.",
                },
                { status: 400 }
            );
        }

        const friend = await areFriends(sender.id, receiver.id);

        if (friend) {
            await db
                .deleteFrom("friends")
                .where(({ eb, or, and }) =>
                    or([
                        and([eb("A", "=", sender.id), eb("B", "=", receiver.id)]),
                        and([eb("A", "=", receiver.id), eb("B", "=", sender.id)]),
                    ])
                )
                .execute();
        } else if (await hasUserSentRequest(sender.id, receiver.id)) {
            await db
                .deleteFrom("requests")
                .where("requesterId", "=", sender.id)
                .where("requestedId", "=", receiver.id)
                .execute();
        } else if (await hasUserReceivedRequest(sender.id, receiver.id)) {
            await db
                .deleteFrom("requests")
                .where("requesterId", "=", receiver.id)
                .where("requestedId", "=", sender.id)
                .execute();
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not friends with this user.",
                },
                { status: 200 }
            );
        }

        const message = friend
            ? "Successfully removed friend."
            : "Successfully cancelled friend request.";

        await pusher.trigger("chat-app", "user-relation", {
            type: "FRIEND_REMOVED",
            sender: sender,
            receiver: receiver,
        });

        return NextResponse.json(
            {
                success: true,
                message: message,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(`[ERROR] /api/users/me/friends/[username]`, error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
