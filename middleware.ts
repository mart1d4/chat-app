import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getGuild, useUser } from "./lib/auth";

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api)(.*)"],
};

export async function middleware(req: NextRequest) {
    const requestHeaders = new Headers(req.headers);

    const token = req.headers.get("Authorization")?.split(" ")[1];
    const refreshToken = req.cookies.get("token")?.value;

    const { pathname } = req.nextUrl;

    // Return early with 200 for CORS preflight
    if (req.method === "OPTIONS") {
        return new NextResponse(null, {
            status: 200,
        });
    }

    if (pathname.startsWith("/api")) {
        if (pathname.startsWith("/api/auth")) return NextResponse.next();

        if (!token) {
            return new NextResponse(null, {
                status: 401,
            });
        } else {
            try {
                const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

                const { payload } = await jwtVerify(token, secret, {
                    issuer: process.env.ISSUER,
                    audience: process.env.AUDIENCE,
                });

                if (!payload.id) {
                    return new NextResponse(null, {
                        status: 401,
                    });
                }

                const response = await fetch(`${process.env.BASE_URL}/api/auth`, {
                    method: "POST",
                    body: JSON.stringify({ requesterId: payload.id }),
                }).then((res) => res.json());

                if (!response.success) {
                    return new NextResponse(null, {
                        status: 401,
                    });
                } else {
                    requestHeaders.set("X-UserId", response.userId);
                    return NextResponse.next({
                        request: {
                            headers: requestHeaders,
                        },
                    });
                }
            } catch (error) {
                console.log(error);
                return new NextResponse(null, {
                    status: 401,
                });
            }
        }
    }

    if (pathname.match(/^\/channels\/me\/[0-9a-f]{24}\/?$/)) {
        const response = await fetch(`${process.env.BASE_URL}/api/middleware/user`, {
            method: "POST",
            body: JSON.stringify({ token: refreshToken }),
        }).then((res) => res.json());

        if (!response.user?.channelIds.includes(pathname.split("/")[3])) {
            return NextResponse.redirect(new URL("/channels/me", req.url));
        }
    } else if (pathname.match(/^\/channels\/[0-9a-f]{24}(\/[0-9a-f]{24})?\/?$/)) {
        const guildId = pathname.split("/")[2];
        const channelId = pathname.split("/")[3];

        const res = await fetch(`${process.env.BASE_URL}/api/middleware/channel`, {
            method: "POST",
            body: JSON.stringify({ token: refreshToken, guildId, channelId }),
        }).then((res) => res.json());

        console.log(`Middleware guild channel choice: ${res.channelId}`);

        if (res.user === null) {
            return NextResponse.redirect(new URL("/login", req.url));
        } else if (res.guild === null) {
            return NextResponse.redirect(new URL("/channels/me", req.url));
        } else if (res.channelId === guildId) {
            if (channelId) {
                return NextResponse.redirect(new URL(`/channels/${guildId}`, req.url));
            } else {
                return NextResponse.next();
            }
        } else if (res.channelId !== channelId) {
            return NextResponse.redirect(new URL(`/channels/${guildId}/${res.channelId}`, req.url));
        }
    }

    return NextResponse.next();
}
