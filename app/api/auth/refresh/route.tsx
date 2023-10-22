import { NextResponse } from "next/server";
import { getUser } from "@/lib/db/helpers";
import { SignJWT } from "jose";

export async function GET(req: Request): Promise<NextResponse> {
    try {
        const user = await getUser({
            select: {
                id: true,
                refreshTokens: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Forbidden",
                },
                { status: 401 }
            );
        }

        const accessSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
        const url = process.env.BASE_URL as string;

        const accessToken = await new SignJWT({ id: user.id })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setIssuer(url)
            .setAudience(url)
            .setExpirationTime("1h")
            .sign(accessSecret);

        return NextResponse.json(
            {
                success: true,
                message: "Successfully refreshed token.",
                token: accessToken,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(`[REFRESH] ${error}`);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
