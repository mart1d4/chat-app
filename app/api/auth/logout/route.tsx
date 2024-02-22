import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/db/helpers";
import { cookies } from "next/headers";
import { db } from "@/lib/db/db";

export async function POST(req: NextRequest) {
    try {
        const user = await getUser({
            select: {
                id: true,
                refreshTokens: true,
            },
        });

        if (user) {
            const tokens = user.refreshTokens;
            const token = cookies().get("token")?.value || "";

            const newTokens = tokens?.filter((obj: { token: string; expires: number }) => {
                return obj.token !== token && obj.expires > Date.now();
            });

            if (tokens?.length !== newTokens?.length) {
                await db
                    .updateTable("users")
                    .set({
                        refreshTokens: JSON.stringify(newTokens),
                    })
                    .where("id", "=", user.id)
                    .executeTakeFirst();
            }
        }

        return NextResponse.json(
            {
                success: true,
                message: "Successfully logged out.",
            },
            {
                status: 200,
                headers: {
                    "Set-Cookie": `token=; path=/; HttpOnly; SameSite=Strict; Max-Age=-1;`,
                    Authorization: "",
                },
            }
        );
    } catch (error) {
        console.error(`[LOGOUT] ${error}`);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            {
                status: 500,
                headers: {
                    "Set-Cookie": `token=; path=/; HttpOnly; SameSite=Strict; Max-Age=-1;`,
                    Authorization: "",
                },
            }
        );
    }
}
