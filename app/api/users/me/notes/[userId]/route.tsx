import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db/db";

export async function GET(req: Request, { params }: { params: { userId: string } }) {
    const senderId = parseInt(headers().get("X-UserId") || "");
    const userId = parseInt(params.userId);

    try {
        const user = await db
            .selectFrom("users")
            .select(["id", "notes"])
            .where("id", "=", senderId)
            .executeTakeFirst();

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
                note: user.notes.find((note) => note.userId === userId)?.content,
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
    const senderId = parseInt(headers().get("X-UserId") || "");
    const userId = parseInt(params.userId);
    const { newNote } = await req.json();

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
        const user = await db
            .selectFrom("users")
            .select(["id", "notes"])
            .where("id", "=", senderId)
            .executeTakeFirst();

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
                        ...note,
                        content: newNote,
                    };
                }
                return note;
            });
        } else {
            newNotes = [...user.notes, { userId, content: newNote }];
        }

        await db
            .updateTable("users")
            .set({ notes: JSON.stringify(newNotes) })
            .where("id", "=", user.id)
            .execute();

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
