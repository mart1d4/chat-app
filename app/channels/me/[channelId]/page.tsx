import { canUserAccessChannel, getUser, getChannel } from "@/lib/db/helpers";
import { AppHeader, MemberList } from "@components";
import styles from "../FriendsPage.module.css";
import { Channel, User } from "@/lib/db/types";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Content from "./Content";
import { db } from "@/lib/db/db";

async function getFriend(userId: string, channelId: string) {
    const friend = await db
        .selectFrom("channelrecipients as cr")
        .innerJoin(
            (eb) =>
                eb
                    .selectFrom("users")
                    .select([
                        "id",
                        "username",
                        "displayName",
                        "avatar",
                        "status",
                        "primaryColor",
                        "accentColor",
                        "createdAt",
                    ])
                    .as("users"),
            (join) => join.onRef("users.id", "=", "cr.userId")
        )
        .select([
            "id",
            "username",
            "displayName",
            "avatar",
            "status",
            "primaryColor",
            "accentColor",
            "createdAt",
        ])
        .where("channelId", "=", channelId)
        .where("userId", "!=", userId)
        .executeTakeFirst();

    return friend;
}

export default async function ChannelPage({ params }: { params: { channelId: string } }) {
    const user = await getUser({});
    if (!user) redirect("/login");

    const channelId = parseInt(params.channelId);

    if (!canUserAccessChannel(user.id, channelId)) {
        redirect("/channels/me");
    }

    const channel = await getChannel(channelId);
    if (!channel) redirect("/channels/me");

    const friend = channel.type === 0 ? await getFriend(user.id, channel.id) : undefined;

    return (
        <div className={styles.main}>
            <AppHeader channelId={channel.id} />

            <div className={styles.content}>
                <Suspense
                    fallback={
                        <Content
                            user={user}
                            friend={friend}
                            channelId={channel.id}
                            messagesLoading={true}
                        />
                    }
                >
                    <FetchMessage
                        user={user}
                        friend={friend}
                        channel={channel}
                    />
                </Suspense>

                <MemberList
                    channelId={channel.id}
                    friend={friend}
                />
            </div>
        </div>
    );
}

async function FetchMessage({
    user,
    friend,
    channel,
}: {
    user: User;
    friend: User;
    channel: Channel;
}) {
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
        .where("channelId", "=", channel.id)
        .orderBy("messages.createdAt", "desc")
        .limit(50)
        .execute();

    console.log(messages);

    const hasMore = await db
        .selectFrom("messages")
        .select((eb) => eb.fn.count("id").as("count"))
        .where("channelId", "=", channel.id)
        .execute();

    const messages2 = messages
        .map((message) => ({
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
        }))
        .reverse();

    return (
        <Content
            user={user}
            friend={friend}
            channelId={channel.id}
            initMessages={messages2}
            initHasMore={hasMore[0].count > 50}
        />
    );
}
