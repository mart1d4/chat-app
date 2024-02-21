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
                message: "Invalid Username",
            },
            { status: 400 }
        );
    }

    if (!regexes.password.test(password)) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid Password",
            },
            { status: 400 }
        );
    }

    try {
        if (await doesUserExist({ username })) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User already exists",
                },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUser({ username, password: hashedPassword });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Something went wrong.",
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "User registered successfully",
            },
            { status: 201 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}
