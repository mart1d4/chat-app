import { canUserAccessChannel, getUser, getChannel, getMessages } from "@/lib/db/helpers";
import { AppHeader, MemberList } from "@components";
import styles from "../FriendsPage.module.css";
import { Channel, User } from "@/lib/db/types";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Content from "./Content";
import { db } from "@/lib/db/db";
import { getChannelIcon, getChannelName } from "@/lib/strings";

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

    const channelFetch = await getChannel(channelId);
    if (!channelFetch) redirect("/channels/me");

    const channel = {
        ...channelFetch,
        // name: getChannelName(channelFetch, user.id),
        name: "olala",
        icon: getChannelIcon(channelFetch, user),
    };

    console.log(channel);

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
                            channel={channel}
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
                    channel={channel}
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
    const messages = await getMessages(channel.id, 50);

    const hasMore = await db
        .selectFrom("messages")
        .select((eb) => eb.fn.count("id").as("count"))
        .where("channelId", "=", channel.id)
        .execute();

    return (
        <Content
            user={user}
            friend={friend}
            channel={channel}
            initMessages={messages.reverse()}
            initHasMore={hasMore[0].count > 50}
        />
    );
}
