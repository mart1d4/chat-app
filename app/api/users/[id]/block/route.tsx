import { getUser, hasUserBlocked, removeFriends } from "@/lib/db/helpers";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { catchError } from "@/lib/api";
import { db } from "@/lib/db/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const senderId = parseInt(headers().get("X-UserId") || "0");
    const { id } = params;

    try {
        const user = await getUser({
            id: id,
            throwOnNotFound: true,
        });

        const isBlocked = await hasUserBlocked(senderId, user.id);

        if (!isBlocked) {
            await db
                .insertInto("blocked")
                .values({ blockerId: senderId, blockedId: user.id })
                .execute();

            await removeFriends(senderId, user.id);

            return NextResponse.json(
                {
                    success: true,
                    message: "Successfuly blocked this user.",
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "You have already blocked this user.",
                },
                { status: 400 }
            );
        }
    } catch (error) {
        await db
            .deleteFrom("blocked")
            .where("blockerId", "=", senderId)
            .where("blockedId", "=", id)
            .execute();

        return catchError(req, error);
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const senderId = parseInt(headers().get("X-UserId") || "0");
    const { id } = params;

    try {
        const user = await getUser({
            id: id,
            throwOnNotFound: true,
        });

        const isBlocked = await hasUserBlocked(senderId, user.id);

        if (isBlocked) {
            await db
                .deleteFrom("blocked")
                .where("blockerId", "=", senderId)
                .where("blockedId", "=", user.id)
                .execute();

            return NextResponse.json(
                {
                    success: true,
                    message: "Successfuly unblocked this user.",
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "You haven't blocked this user.",
                },
                { status: 400 }
            );
        }
    } catch (error) {
        return catchError(req, error);
    }
}
