import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { kv } from "@vercel/kv";

const ratelimit = new Ratelimit({
    redis: kv,
    // 5 requests from the same IP in 10 seconds
    limiter: Ratelimit.slidingWindow(5, "10 s"),
});

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api)(.*)"],
};

export async function middleware(req: NextRequest) {
    const requestHeaders = new Headers(req.headers);
    const ip = req.ip ?? "127.0.0.1";
    console.log(ip);

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
        const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);

        if (!success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Rate limit exceeded",
                },
                { status: 429 }
            );
        }

        if (pathname.startsWith("/api/test")) return NextResponse.next();
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

                requestHeaders.set("X-UserId", payload.id as string);
                return NextResponse.next({
                    request: {
                        headers: requestHeaders,
                    },
                });
            } catch (error) {
                console.log(`[MIDDLEWARE] Error verifying token: ${error}`);
                return new NextResponse(null, {
                    status: 401,
                });
            }
        }
    }

    const paths = ["/", "/login", "/register", "/download", "/channels/me", "/channels/discover"];
    const regex = [/^\/channels\/me\/[0-9]{18}\/?$/, /^\/channels\/[0-9]{18}(\/[0-9]{18})?\/?$/];

    if (!paths.includes(pathname) && !regex.some((r) => pathname.match(r))) {
        if (!refreshToken) {
            if (pathname.startsWith("/channels")) {
                return NextResponse.redirect(new URL("/login", req.url));
            }
            return NextResponse.redirect(new URL("/", req.url));
        } else {
            if (pathname.startsWith("/channels")) {
                return NextResponse.redirect(new URL("/channels/me", req.url));
            }
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    return NextResponse.next();
}
