import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(req: Request): Promise<NextResponse> {
    const senderId = headers().get("X-UserId") || "";

    try {
        const sender = await prisma.user.findUnique({
            where: {
                id: senderId,
            },
            include: {
                blockedUsers: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatar: true,
                        banner: true,
                        primaryColor: true,
                        accentColor: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!sender) {
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
                    message: "Successfully retrieved blocked users.",
                    blockedUsers: sender.blockedUsers,
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
