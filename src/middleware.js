import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const middleware = (req) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.sendStatus(401);
    }
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return new NextResponse(
                JSON.stringify({
                    success: false,
                    message: "authentication failed",
                }),
                { status: 401, headers: { "content-type": "application/json" } }
            );
        }
        req.user = decoded.UserInfo;
        next();
    });
};

export const config = {
    matcher: ["/users", "/users/:id*", "/conversations", "/conversations/:id*"],
};
