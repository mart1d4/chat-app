import {
    getGuild,
    getGuildChannels,
    getUser,
    isUserInGuild,
    getMessages,
    getGuildMembers,
} from "@/lib/db/helpers";
import { GuildChannels, AppHeader, MemberList, ClickLayer } from "@components";
import styles from "../../me/FriendsPage.module.css";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { db } from "@/lib/db/db";
import Content from "./Content";
import { getFullChannel } from "@/lib/strings";

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

    const members = await getGuildMembers(guildId);

    return (
        <>
            <GuildChannels
                guild={guild}
                user={user}
                initChannels={channels}
            />

            <ClickLayer>
                <div className={styles.main}>
                    <AppHeader channel={channel} />

                    <div className={styles.content}>
                        <Suspense
                            fallback={
                                <Content
                                    guild={guild}
                                    channel={{
                                        ...channel,
                                        recipients: members,
                                    }}
                                    messagesLoading={true}
                                />
                            }
                        >
                            <FetchMessage
                                guild={guild}
                                channel={{
                                    ...channel,
                                    recipients: members,
                                }}
                            />
                        </Suspense>

                        <MemberList
                            channel={{
                                ...channel,
                                recipients: members,
                            }}
                        />
                    </div>
                </div>
            </ClickLayer>
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
