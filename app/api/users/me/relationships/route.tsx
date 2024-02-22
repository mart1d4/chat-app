import {
    areFriends,
    getUser,
    hasUserBlocked,
    hasUserReceivedRequest,
    hasUserSentRequest,
    isUserBlockedBy,
} from "@/lib/db/helpers";
import { NextRequest, NextResponse } from "next/server";
import { regexes } from "@/lib/verifications";
import { headers } from "next/headers";
import { catchError } from "@/lib/api";
import { db } from "@/lib/db/db";
import { sql } from "kysely";

export async function POST(req: NextRequest) {
    const senderId = parseInt(headers().get("X-UserId") || "0");
    const { username } = await req.json();

    if (!regexes.username.test(username)) {
        return NextResponse.json(
            {
                success: false,
                message: "The username you provided is invalid.",
            },
            { status: 400 }
        );
    }

    try {
        const sender = await getUser({ throwOnNotFound: true, id: senderId });

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
            // @ts-ignore
            .where(sql`username = BINARY ${username}`)
            .executeTakeFirst();

        if (!receiver) {
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

        return NextResponse.json(
            {
                success: true,
                message: `Success. Friend request sent to ${receiver.username}.`,
            },
            { status: 200 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}

export async function DELETE(req: NextRequest) {
    const senderId = parseInt(headers().get("X-UserId") || "0");
    const { username } = await req.json();

    if (!regexes.username.test(username)) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid Username",
            },
            { status: 400 }
        );
    }

    try {
        const sender = await getUser({ throwOnNotFound: true, id: senderId });

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
            // @ts-ignore
            .where(sql`username = BINARY ${username}`)
            .executeTakeFirst();

        if (!receiver) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No user found with that username.",
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

        return NextResponse.json(
            {
                success: true,
                message: message,
            },
            { status: 200 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}
