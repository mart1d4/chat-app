import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { isLoggedIn } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { username: string } }): Promise<NextResponse> {
    const username = params.username;
    const test = isLoggedIn();
    console.log(test);

    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
            select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                banner: true,
                primaryColor: true,
                accentColor: true,
                description: true,
                customStatus: true,
                status: true,
                guildIds: true,
                channelIds: true,
                friendIds: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found.",
                },
                { status: 404 }
            );
        } else {
            return NextResponse.json(
                {
                    success: true,
                    message: "User found.",
                    user: user,
                },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
