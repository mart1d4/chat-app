import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prismadb';
import { cookies } from 'next/headers';

export async function POST(req: Request): Promise<NextResponse> {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json(
            {
                success: false,
                message: 'No cookie found',
            },
            { status: 401 }
        );
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                refreshToken: token,
            },
            select: {
                id: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No user found',
                },
                {
                    status: 400,
                    headers: {
                        'Set-Cookie': `token=; path=/; HttpOnly; SameSite=Strict; Max-Age=-1;`,
                    },
                }
            );
        }

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                refreshToken: null,
            },
            select: {
                id: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Logged out',
            },
            {
                status: 200,
                headers: {
                    'Set-Cookie': `token=; path=/; HttpOnly; SameSite=Strict; Max-Age=-1;`,
                },
            }
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
