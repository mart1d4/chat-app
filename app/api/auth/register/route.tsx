import { createUser, doesUserExist } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request): Promise<NextResponse> {
    const { username, password } = await req.json();

    if (!/^.{2,32}$/.test(username)) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid Username",
            },
            { status: 400 }
        );
    }

    if (!/^.{8,256}$/.test(password)) {
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
        createUser({ username, password: hashedPassword });

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
