import { passwordRegex, usernameRegex } from "@/lib/verifications";
import { createUser, doesUserExist } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request): Promise<NextResponse> {
    const { username, password } = await req.json();

    if (!usernameRegex.test(username)) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid Username",
            },
            { status: 400 }
        );
    }

    if (!passwordRegex.test(password)) {
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
        console.error(`[REGISTER] ${error}`);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
