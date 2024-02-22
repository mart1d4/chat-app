import { NextRequest, NextResponse } from "next/server";
import { removeImage } from "@/lib/cdn";
import { catchError } from "@/lib/api";

export async function DELETE(req: NextRequest) {
    const { attachments } = await req.json();

    try {
        if (attachments?.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No attachments provided.",
                },
                { status: 404 }
            );
        }

        for (const attachment of attachments) {
            await removeImage(attachment);
        }

        return NextResponse.json(
            {
                success: true,
                message: "Successfully deleted images.",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}
