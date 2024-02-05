import { getGuild, getGuildChannels, getUser, isUserInGuild } from "@/lib/db/helpers";
import { GuildChannels } from "@components";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export default async function GuildPage({ params }: { params: { guildId: string } }) {
    const user = await getUser({});
    if (!user) redirect("/login");

    const guildId = parseInt(params.guildId);

    if (!isUserInGuild(user.id, guildId)) redirect("/channels/me");
    const guild = await getGuild(guildId);

    const channels = await getGuildChannels(guildId);
    const textChannel = channels.find((c) => c.type === 2);
    if (textChannel) redirect(`/channels/${guildId}/${textChannel.id}`);

    return (
        <>
            <GuildChannels
                guild={guild}
                user={user}
                initChannels={channels}
            />

            <div className={styles.container}>
                <div />

                <div className={styles.content}>
                    <h2>No Text Channels</h2>
                    <div>
                        You find yourself in a strange place. You don't have access to any text
                        channels, or there are none in this server.
                    </div>
                </div>
            </div>
        </>
    );
}
