import { GuildChannels, AppHeader, MemberList, ClickLayer } from "@components";
import { getGuild, getUser, isUserInGuild } from "@/lib/db/helpers";
import styles from "../../me/FriendsPage.module.css";
import { redirect } from "next/navigation";
import Content from "./Content";

export default async function GuildChannelPage({
    params,
}: {
    params: { guildId: string; channelId: string };
}) {
    const user = await getUser({});
    if (!user) redirect("/login");

    const guildId = parseInt(params.guildId);
    const channelId = parseInt(params.channelId);

    if (!(await isUserInGuild(user.id, guildId))) redirect("/channels/me");

    const guild = await getGuild({
        id: guildId,
        select: ["id", "name", "icon", "ownerId", "systemChannelId"],
        getMembers: true,
        getChannels: true,
        getRoles: true,
    });

    if (!guild) redirect("/channels/me");

    const channel = guild.channels?.find((c) => c.id === channelId);

    if (!channel) {
        const textChannel = guild.channels?.find((c) => c.type === 2);
        if (textChannel) redirect(`/channels/${guildId}/${textChannel.id}`);
        redirect(`/channels/${guildId}`);
    }

    return (
        <>
            <GuildChannels
                guild={guild}
                user={user}
                initChannels={guild.channels}
            />

            <ClickLayer>
                <div className={styles.main}>
                    <AppHeader channel={channel} />

                    <div className={styles.content}>
                        <Content
                            guild={guild}
                            channel={{
                                ...channel,
                                recipients: guild.members,
                            }}
                        />

                        <MemberList
                            channel={{
                                ...channel,
                                recipients: guild.members,
                            }}
                        />
                    </div>
                </div>
            </ClickLayer>
        </>
    );
}
