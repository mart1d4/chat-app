import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { headers } from "next/headers";

export async function GET(req: Request, { params }: { params: { userId: string } }) {
    const senderId = headers().get("X-UserId") || "";
    const userId = params.userId;

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: senderId,
            },
            select: {
                id: true,
                notes: true,
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
                note: user.notes.find((note) => note.userId === userId)?.note || "",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(`[ERROR] /api/users/me/notes/${userId}`, error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request, { params }: { params: { userId: string } }) {
    const senderId = headers().get("X-UserId") || "";
    const { newNote } = await req.json();
    const userId = params.userId;

    if (typeof newNote !== "string" || newNote.length > 256) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid note.",
            },
            { status: 400 }
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: senderId,
            },
            select: {
                id: true,
                notes: true,
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

        const alreadyExists = user.notes.find((note) => note.userId === userId);
        let newNotes;
        if (alreadyExists) {
            newNotes = user.notes.map((note) => {
                if (note.userId === userId) {
                    return {
                        userId,
                        note: newNote,
                    };
                }
                return note;
            });
        } else {
            newNotes = [...user.notes, { userId, note: newNote }];
        }

        await prisma.user.update({
            where: {
                id: senderId,
            },
            data: {
                notes: {
                    set: newNotes,
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Successfully updated note.",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(`[ERROR] /api/users/me/notes/${userId}`, error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
