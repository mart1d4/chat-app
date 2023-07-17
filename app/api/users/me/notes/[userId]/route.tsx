import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    return NextResponse.json(
        {
            success: false,
            message: 'Unauthorized',
        },
        { status: 404 }
    );
}
