import { removeImage } from "@/lib/api/cdn";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { headers } from "next/headers";

export async function DELETE(req: Request): Promise<NextResponse> {
    const senderId = headers().get("X-UserId") || "";
    const { attachments } = await req.json();

    try {
        const sender = await prisma.user.findUnique({
            where: {
                id: senderId,
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
        }

        if (attachments.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No attachments found.",
                },
                { status: 404 }
            );
        }

        attachments.forEach(async (attachment: TAttachment) => {
            await removeImage(attachment.id);
        });

        return NextResponse.json(
            {
                success: true,
                message: "Attachments deleted.",
            },
            { status: 200 }
        );
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
