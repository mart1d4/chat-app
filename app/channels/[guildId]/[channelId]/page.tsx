import { getGuild, getGuildChannels, getUser, isUserInGuild, getMessages } from "@/lib/db/helpers";
import { GuildChannels, AppHeader, MemberList } from "@components";
import styles from "../../me/FriendsPage.module.css";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { db } from "@/lib/db/db";
import Content from "./Content";

export default async function GuildChannelPage({
    params,
}: {
    params: { guildId: string; channelId: string };
}) {
    const user = await getUser({});
    if (!user) redirect("/login");

    const guildId = parseInt(params.guildId);
    const channelId = params.channelId;

    if (!isUserInGuild(user.id, guildId)) redirect("/channels/me");
    const guild = await getGuild(guildId);

    const channels = await getGuildChannels(guildId);
    const channel = channels.find((c) => c.id === channelId);

    if (!channel) {
        const textChannel = channels.find((c) => c.type === 2);
        if (textChannel) redirect(`/channels/${guildId}/${textChannel.id}`);
        redirect(`/channels/${guildId}`);
    }

    return (
        <>
            <GuildChannels
                guild={guild}
                user={user}
                initChannels={channels}
            />

            <div className={styles.main}>
                <AppHeader channel={channel} />

                <div className={styles.content}>
                    <Suspense
                        fallback={
                            <Content
                                guild={guild}
                                channel={channel}
                                messagesLoading={true}
                            />
                        }
                    >
                        <FetchMessage
                            guild={guild}
                            channel={channel}
                        />
                    </Suspense>

                    <MemberList channel={channel} />
                </div>
            </div>
        </>
    );
}

async function FetchMessage({ guild, channel }: { guild: Guild; channel: Channel }) {
    const messages = await getMessages(channel.id, 50);

    const hasMore = await db
        .selectFrom("messages")
        .select((eb) => eb.fn.count("id").as("count"))
        .where("channelId", "=", channel.id)
        .execute();

    return (
        <Content
            guild={guild}
            channel={channel}
            initMessages={messages.reverse()}
            initHasMore={hasMore[0].count > 50}
        />
    );
}
