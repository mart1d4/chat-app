import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../prismadb";

export const useUser = async (req: NextRequest, userId: string) => {
    const idRegex = /^[0-9a-fA-F]{24}$/;
    if (!idRegex.test(userId)) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid user id",
            },
            { status: 401 }
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            banner: true,
            primaryColor: true,
            accentColor: true,
            description: true,
            customStatus: true,
            status: true,
            verified: true,
            notifications: true,
            guildIds: true,
            hiddenChannelIds: true,
            channelIds: true,
            friendIds: true,
            requestReceivedIds: true,
            requestSentIds: true,
            blockedUserIds: true,
            blockedByUserIds: true,
            createdAt: true,
        },
    });

    if (!user) {
        return NextResponse.json(
            {
                success: false,
                message: "User not found",
            },
            { status: 401 }
        );
    }

    return user;
};
