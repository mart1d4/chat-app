import { createUser, doesUserExist } from "@/lib/db/helpers";
import { regexes } from "@/lib/verifications";
import { NextResponse } from "next/server";
import { catchError } from "@/lib/api";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    const { username, password } = await req.json();

    if (!regexes.username.test(username)) {
        return NextResponse.json(
            {
                success: false,
                message: "The username you provided is invalid.",
            },
            { status: 400 }
        );
    }

    if (!regexes.password.test(password)) {
        return NextResponse.json(
            {
                success: false,
                message: "The password you provided is invalid.",
            },
            { status: 400 }
        );
    }

    try {
        if (await doesUserExist({ username })) {
            return NextResponse.json(
                {
                    success: false,
                    message: "A user with that username already exists.",
                },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await createUser({ username, password: hashedPassword });

        return NextResponse.json(
            {
                success: true,
                message: "Successfully created user.",
            },
            { status: 201 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}
