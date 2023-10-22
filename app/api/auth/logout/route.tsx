import { getUser } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db/db";

export async function POST(req: Request): Promise<NextResponse> {
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

            // Remove current session token as well as expired tokens
            const newTokens = tokens?.filter((obj) => obj.token !== token && obj.expires > new Date());

            if (tokens?.length !== newTokens?.length) {
                await db
                    .updateTable("users")
                    .set({
                        refreshTokens: JSON.stringify(newTokens),
                    })
                    .where("id", "=", user.id as number)
                    .executeTakeFirst();
            }
        }

        return NextResponse.json(
            {
                success: true,
                message: "Logged out",
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
