import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prismadb';

const avatars = [
    '178ba6e1-5551-42f3-b199-ddb9fc0f80de',
    '9a5bf989-b884-4f81-b26c-ca1995cdce5e',
    '7cb3f75d-4cad-4023-a643-18c329b5b469',
    '220b2392-c4c5-4226-8b91-2b60c5a13d0f',
    '51073721-c1b9-4d47-a2f3-34f0fbb1c0a8',
];
const colors = ['#5865F2', '#3BA45C', '#737C89', '#ED4245', '#FAA51A'];

const getRandomAvatar = (): { avatar: string; color: string } => {
    const index = Math.floor(Math.random() * avatars.length);

    return { avatar: avatars[index], color: colors[index] };
};

export async function POST(req: Request): Promise<NextResponse> {
    const { username, password }: { username: string; password: string } = await req.json();

    if (!username || !password) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid Username or Password',
            },
            {
                status: 400,
            }
        );
    }

    const USER_REGEX = /^.{2,32}$/;
    const PWD_REGEX = /^.{8,256}$/;

    const v1: boolean = USER_REGEX.test(username);
    const v2: boolean = PWD_REGEX.test(password);

    if (!v1) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid Username',
            },
            {
                status: 400,
            }
        );
    }

    if (!v2) {
        return NextResponse.json(
            {
                success: false,
                message: 'Invalid Password',
            },
            {
                status: 400,
            }
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
        });

        if (user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User already exists',
                },
                {
                    status: 400,
                }
            );
        }

        const hash = await bcrypt.hash(password, 10);
        const { avatar, color } = getRandomAvatar();

        await prisma.user.create({
            data: {
                username: username,
                password: hash,
                avatar: avatar,
                primaryColor: color,
                notifications: [
                    {
                        type: 'welcome',
                        message: 'Welcome to Chat App!',
                    },
                ],
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: 'User registered successfully',
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong.',
            },
            {
                status: 500,
            }
        );
    }
}
