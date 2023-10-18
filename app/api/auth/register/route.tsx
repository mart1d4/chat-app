import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import bcrypt from "bcrypt";

const avatars = [
    {
        avatar: "178ba6e1-5551-42f3-b199-ddb9fc0f80de",
        color: "#5865F2",
    },
    {
        avatar: "9a5bf989-b884-4f81-b26c-ca1995cdce5e",
        color: "#3BA45C",
    },
    {
        avatar: "7cb3f75d-4cad-4023-a643-18c329b5b469",
        color: "#737C89",
    },
    {
        avatar: "220b2392-c4c5-4226-8b91-2b60c5a13d0f",
        color: "#ED4245",
    },
    {
        avatar: "51073721-c1b9-4d47-a2f3-34f0fbb1c0a8",
        color: "#FAA51A",
    },
];

function getRandomProfile() {
    const index = Math.floor(Math.random() * avatars.length);
    return { avatar: avatars[index].avatar, color: avatars[index].color };
}

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
        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
        });

        if (user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username already exists",
                },
                { status: 400 }
            );
        }

        const hash = await bcrypt.hash(password, 10);
        const { avatar, color } = getRandomProfile();

        await prisma.user.create({
            data: {
                username: username,
                displayName: username,
                password: hash,
                avatar: avatar,
                primaryColor: color,
                accentColor: color,
            },
        });

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
