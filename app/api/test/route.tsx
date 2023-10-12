import { createUser } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
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

export async function POST(req: Request): Promise<NextResponse> {
    try {
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
