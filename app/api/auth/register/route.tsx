// Ignore typescript error
// @ts-nocheck

import connectDB from '@/lib/mongo/connectDB';
import User from '@/lib/mongo/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

connectDB();

export async function POST(req: Request): Promise<NextResponse> {
    const { username, password }: any = await req.json();

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
        const user = await User.findOne({ username: username });
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
        await new User({
            username: username,
            password: hash,
        }).save();

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
