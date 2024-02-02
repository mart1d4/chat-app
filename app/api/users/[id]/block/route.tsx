import { getUser, hasUserBlocked, removeFriends } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const senderId = headers().get("X-UserId") || "";
    const { id } = params;

    try {
        const user = await getUser({
            id: id,
            select: { id: true },
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
                    message: "Successfuly blocked this user",
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
        console.error(`[ERROR:${req.method}] ${req.url}: ${error}`);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error.",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const senderId = headers().get("X-userId") || "";
    const { id } = params;

    try {
        const user = await getUser({
            id: id,
            select: { id: true },
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
        console.error(`[ERROR:${req.method}] ${req.url}: ${error}`);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
