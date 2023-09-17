import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";

export async function GET(req: Request, { params }: { params: { code: string } }) {
    const code = params.code;

    try {
        const invite = await prisma.invite.findFirst({
            where: {
                code: code,
            },
            include: {
                guild: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        ownerId: true,
                        rawMemberIds: true,
                    },
                },
                channel: {
                    select: {
                        id: true,
                        type: true,
                        name: true,
                        recipientIds: true,
                    },
                },
                inviter: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                invite: invite || null,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(`[ERROR] /api/invites/${code}`, error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}

export async function POST(req: Request, { params }: { params: { code: string } }) {
    const code = params.code;

    try {
        const invite = await prisma.invite.findFirst({
            where: {
                code: code,
            },
            include: {
                guild: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        ownerId: true,
                        rawMemberIds: true,
                    },
                },
                channel: {
                    select: {
                        id: true,
                        type: true,
                        name: true,
                        recipientIds: true,
                    },
                },
                inviter: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                invite: invite || null,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(`[ERROR] /api/invites/${code}`, error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
