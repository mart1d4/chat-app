import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api)(.*)"],
};

export async function middleware(req: NextRequest) {
    const refreshToken = req.cookies.get("token")?.value;
    const { pathname } = req.nextUrl;

    // Return early with 200 for CORS preflight
    if (req.method === "OPTIONS") {
        return new NextResponse(null, {
            status: 200,
        });
    }

    const paths = [
        "/",
        "/login",
        "/register",
        "/download",
        "/channels/me",
        "/channels/discover",
        "/test",
    ];

    const regex = [/^\/channels\/me\/[0-9]{14}\/?$/, /^\/channels\/[0-9]{14}(\/[0-9]{14})?\/?$/];

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
