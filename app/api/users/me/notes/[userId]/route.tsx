import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/db/helpers";
import { headers } from "next/headers";
import { catchError } from "@/lib/api";
import { db } from "@/lib/db/db";

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
    const senderId = parseInt(headers().get("X-UserId") || "0");
    const userId = parseInt(params.userId);

    try {
        const user = await getUser({
            id: senderId,
            select: { notes: true },
            throwOnNotFound: true,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Successfully retrieved note.",
                note: user.notes.find((note) => note.userId === userId)?.content || "",
            },
            { status: 200 }
        );
    } catch (error) {
        return catchError(req, error);
    }
}

export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
    const senderId = parseInt(headers().get("X-UserId") || "0");
    const userId = parseInt(params.userId);
    const { newNote } = await req.json();

    if (typeof newNote !== "string" || newNote.length > 256) {
        return NextResponse.json(
            {
                success: false,
                message: "The note you provided is invalid.",
            },
            { status: 400 }
        );
    }

    try {
        const user = await getUser({
            id: senderId,
            select: { notes: true },
            throwOnNotFound: true,
        });

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
        return catchError(req, error);
    }
}
