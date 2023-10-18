import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";

export async function POST(req: Request): Promise<NextResponse> {
    const { requesterId } = await req.json();

    if (!requesterId) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid requesterId",
            },
            { status: 400 }
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: requesterId,
            },
            select: {
                id: true,
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
        }

        return NextResponse.json(
            {
                success: true,
                message: "User found.",
                userId: user.id,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(`[API|AUTH] ${error}`);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
