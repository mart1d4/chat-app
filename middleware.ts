import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api)(.*)"],
};

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const { pathname } = req.nextUrl;

    // Return early with 200 for CORS preflight
    if (req.method === "OPTIONS") {
        return new NextResponse(null, {
            status: 200,
        });
    }

    const publicPaths = ["/", "/login", "/register", "/reset", "/verify", "/invite", "/download"];

    const authorizedRegex = /^\/channels\/discover\/?$/;
    const channelsRegex = /^\/channels\/me(\/[0-9]{14})?\/?$/;
    const guildsRegex = /^\/channels\/[0-9]{14}(\/[0-9]{14})?\/?$/;
    const onlyGuildRegex = /^\/channels\/[0-9]{14}\/?$/;

    if (!publicPaths.includes(pathname)) {
        if (!pathname.startsWith("/channels")) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        const secret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
        const { API_URL: issuer, BASE_URL: audience } = process.env;

        try {
            const {
                payload,
            }: {
                payload: { id: number };
            } = await jwtVerify(token, secret, {
                issuer,
                audience,
            });

            if (!payload?.id) {
                req.cookies.delete("token");
                return NextResponse.redirect(new URL("/login", req.url));
            }

            if (
                !authorizedRegex.test(pathname) &&
                !channelsRegex.test(pathname) &&
                !guildsRegex.test(pathname) &&
                !onlyGuildRegex.test(pathname)
            ) {
                return NextResponse.redirect(new URL("/channels/me", req.url));
            }

            const requestHeaders = new Headers(req.headers);
            requestHeaders.set("x-user-id", payload.id.toString());

            const response = NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });

            response.headers.set("x-user-id", payload.id.toString());
            return response;
        } catch (error) {
            console.error(error);
            req.cookies.delete("token");
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    return NextResponse.next();
}
