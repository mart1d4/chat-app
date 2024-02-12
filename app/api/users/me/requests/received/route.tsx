import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(req: Request): Promise<NextResponse> {
    // const senderId = headers().get("X-UserId") || "";
    // if (typeof senderId !== "string" || senderId.length !== 24) {
    //     return NextResponse.json(
    //         {
    //             success: false,
    //             message: "Invalid user ID.",
    //         },
    //         {
    //             status: 400,
    //         }
    //     );
    // }
    // try {
    //     const sender = await prisma.user.findUnique({
    //         where: {
    //             id: senderId,
    //         },
    //         include: {
    //             requestsReceived: {
    //                 select: {
    //                     id: true,
    //                     username: true,
    //                     displayName: true,
    //                     avatar: true,
    //                     banner: true,
    //                     primaryColor: true,
    //                     accentColor: true,
    //                     description: true,
    //                     customStatus: true,
    //                     status: true,
    //                     guildIds: true,
    //                     channelIds: true,
    //                     friendIds: true,
    //                     createdAt: true,
    //                 },
    //             },
    //         },
    //     });
    //     if (!sender) {
    //         return NextResponse.json(
    //             {
    //                 success: false,
    //                 message: "User not found.",
    //             },
    //             {
    //                 status: 404,
    //             }
    //         );
    //     } else {
    //         return NextResponse.json(
    //             {
    //                 success: true,
    //                 message: "Successfully retrieved requests.",
    //                 requests: sender.requestsReceived,
    //             },
    //             {
    //                 status: 200,
    //             }
    //         );
    //     }
    // } catch (error) {
    //     console.error(error);
    //     return NextResponse.json(
    //         {
    //             success: false,
    //             message: "Something went wrong.",
    //         },
    //         {
    //             status: 500,
    //         }
    //     );
    // }

    return NextResponse.json(
        {
            success: false,
            message: "Something went wrong.",
        },
        {
            status: 500,
        }
    );
}
