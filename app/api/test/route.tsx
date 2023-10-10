import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const result = await db
            .insertInto("user")
            .values({
                username: "Jennifer",
                display_name: "Aniston",
                password: "123456",
                avatar: "https://www.google.com",
                primary_color: "#000000",
                accent_color: "#ffffff",
                status: "online",
                system: false,
                verified: false,
            })
            .executeTakeFirst();

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
