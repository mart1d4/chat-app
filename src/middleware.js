import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from 'jose';

export const middleware = (req) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        console.log("middleware: no auth header");
        return NextResponse.next();
    }
    console.log("middleware: auth header found");
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            req.nextUrl.searchParams.set('from', request.nextUrl.pathname)
            req.nextUrl.pathname = '/login'

            return NextResponse.next();
        }
        req.user = decoded.UserInfo;
        return NextResponse.next();
    });
};

// export const config = {
//     matcher: [
//         "/users/:path*",
//         "/private/:path*",
//         "/socket/:path*",
//     ],
// };
