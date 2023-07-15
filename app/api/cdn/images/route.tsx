import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { headers } from 'next/headers';

export async function DELETE(req: Request, { params }: { params: { username: string } }): Promise<NextResponse> {
    const { attachments } = await req.json();
    const headersList = headers();
    const senderId = headersList.get('userId') || '';

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
                    message: 'User not found.',
                },
                { status: 404 }
            );
        }

        if (attachments.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No attachments found.',
                },
                { status: 404 }
            );
        }

        attachments.forEach(async (attachment: string) => {
            await fetch(`https://api.uploadcare.com/files/${attachment}/storage/`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Uploadcare.Simple ${process.env.UPLOADCARE_PUBLIC_KEY}:${process.env.UPLOADCARE_SECRET_KEY}`,
                    Accept: 'application/vnd.uploadcare-v0.7+json',
                },
            });
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Attachments deleted.',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong.',
            },
            { status: 500 }
        );
    }
}
