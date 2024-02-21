import { NextResponse } from "next/server";
import { getUser } from "@/lib/db/helpers";
import { catchError } from "@/lib/api";
import { SignJWT } from "jose";

export async function GET(req: Request) {
    try {
        const user = await getUser({
            select: {
                id: true,
                refreshTokens: true,
            },
            throwOnNotFound: true,
        });

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
        return catchError(req, error);
    }
}
