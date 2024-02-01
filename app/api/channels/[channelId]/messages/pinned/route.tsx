import { getUser, isUserInChannel } from "@/lib/db/helpers";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db/db";

export async function GET(req: Request, { params }: { params: { channelId: string } }) {
    const senderId = headers().get("X-UserId") || "";
    const { channelId } = params;

    try {
        const user = await getUser({ id: senderId, throwOnNotFound: true });

        if (!isUserInChannel(user.id, channelId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not in this channel",
                },
                { status: 401 }
            );
        }

        // pinned is a datetime

        const messages = await db
            .selectFrom("messages")
            .innerJoin(
                (eb) =>
                    eb
                        .selectFrom("users")
                        .select(["id as userId", "username", "displayName", "avatar", "status"])
                        .as("users"),
                (join) => join.onRef("users.userId", "=", "messages.authorId")
            )
            .leftJoin(
                (eb) =>
                    eb
                        .selectFrom("messages")
                        .innerJoin(
                            (eb) =>
                                eb
                                    .selectFrom("users")
                                    .select([
                                        "id as refUserId",
                                        "username as refUsername",
                                        "displayName as refDisplayName",
                                        "avatar as refAvatar",
                                        "status as refStatus",
                                    ])
                                    .as("users"),
                            (join) => join.onRef("users.refUserId", "=", "messages.authorId")
                        )
                        .select([
                            "id as refId",
                            "type as refType",
                            "content as refContent",
                            "attachments as refAttachments",
                            "createdAt as refCreatedAt",
                            "authorId as refAuthorId",
                            "refUserId",
                            "refUsername",
                            "refDisplayName",
                            "refAvatar",
                            "refStatus",
                        ])
                        .as("ref"),
                (join) => join.onRef("ref.refId", "=", "messages.messageReferenceId")
            )
            .select([
                "id",
                "type",
                "content",
                "attachments",
                "createdAt",
                "authorId",
                "channelId",
                "userId",
                "username",
                "displayName",
                "avatar",
                "status",
                "refId",
                "refType",
                "refContent",
                "refAttachments",
                "refCreatedAt",
                "refAuthorId",
                "refUserId",
                "refUsername",
                "refDisplayName",
                "refAvatar",
                "refStatus",
            ])
            .where("channelId", "=", channelId)
            .where("pinned", "is not", null)
            .orderBy("createdAt", "desc")
            .execute();

        return NextResponse.json(
            {
                success: true,
                message: "Successfully retrieved pinned messages",
                pinned: messages.map((message) => ({
                    ...message,
                    author: {
                        id: message.userId,
                        username: message.username,
                        displayName: message.displayName,
                        avatar: message.avatar,
                        status: message.status,
                    },
                    messageReference: message.refId
                        ? {
                              id: message.refId,
                              type: message.refType,
                              content: message.refContent,
                              attachments: message.refAttachments,
                              createdAt: message.refCreatedAt,
                              author: {
                                  id: message.refUserId,
                                  username: message.refUsername,
                                  displayName: message.refDisplayName,
                                  avatar: message.refAvatar,
                                  status: message.refStatus,
                              },
                          }
                        : undefined,
                })),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(`[ERROR] GET /api/channels/${channelId}/messages/pinned`, error);
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}
