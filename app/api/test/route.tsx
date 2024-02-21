import { createUser, getUser } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { catchError } from "@/lib/api";
import { db } from "@/lib/db/db";

export async function GET(req: Request): Promise<NextResponse> {
    try {
        const users = await db.selectFrom("users").selectAll().execute();

        return NextResponse.json(
            {
                success: true,
                message: "Test successful.",
                users,
            },
            { status: 201 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const user = await getUser({ select: { id: true, system: true } });

        if (!user.system) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Permission denied.",
                },
                { status: 401 }
            );
        }

        await createUser({
            username: Math.random().toString(36).substring(7),
            password: "test",
        });

        return NextResponse.json(
            {
                success: true,
                message: "Test successful.",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(`[TEST] ${error}`);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
