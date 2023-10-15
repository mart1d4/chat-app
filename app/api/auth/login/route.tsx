import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcrypt";
import { getUser } from "@/lib/db/helpers";
import { db } from "@/lib/db/db";
import { sql } from "kysely";

export async function POST(req: Request): Promise<NextResponse> {
    const { username, password } = await req.json();

    if (!username || !password) {
        return NextResponse.json(
            {
                success: false,
                message: "Login or password is invalid",
            },
            { status: 400 }
        );
    }

    try {
        const user = await getUser({
            username,
            toSelect: {
                username: true,
                password: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username or password is invalid",
                },
                { status: 401 }
            );
        }

        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const accessSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
            const refreshSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
            const url = process.env.BASE_URL as string;

            const accessToken = await new SignJWT({ id: user.id })
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setIssuer(url)
                .setAudience(url)
                .setExpirationTime("1h")
                .sign(accessSecret);

            const refreshToken = await new SignJWT({ id: user.id })
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setIssuer(url)
                .setAudience(url)
                .setExpirationTime("30d")
                .sign(refreshSecret);

            // Save refresh token to database
            await db
                .updateTable("users")
                .set({
                    refreshTokens: sql`JSON_ARRAY_APPEND(refresh_tokens, "$", ${refreshToken})`,
                })
                .where("id", "=", user.id)
                .executeTakeFirst();

            return NextResponse.json(
                {
                    success: true,
                    message: "Login successful",
                    token: accessToken,
                },
                {
                    status: 200,
                    headers: {
                        "Set-Cookie": `token=${refreshToken}; path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure`,
                    },
                }
            );
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "Login or password is invalid",
                },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error(`[LOGIN] ${error}`);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
