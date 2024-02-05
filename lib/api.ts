import { NextResponse } from "next/server";

export function catchError(req: Request, error: unknown) {
    console.error(`\n\n[API ERROR] ${req.url}:${req.method} \n${error}\n\n`);

    return NextResponse.json(
        {
            success: false,
            message: "Something went wrong.",
        },
        { status: 500 }
    );
}
