import { getGuild, getGuildChannels, useUser } from "@/lib/auth";
import { GuildChannels } from "@components";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export default async function GuildPage({ params }: { params: { guildId: string } }) {
    const user = await useUser();
    if (!user) redirect("/login");

    const guild = await getGuild(params.guildId);
    if (!guild || !user.guildIds.includes(guild.id)) redirect("/channels/me");

    const channels = await getGuildChannels(guild.id);
    const textChannel = channels.find((c) => c.type === 2);
    if (textChannel) redirect(`/channels/${guild.id}/${textChannel.id}`);

    return (
        <>
            <GuildChannels guild={guild} user={user} />

            <div className={styles.container}>
                <div />

                <div className={styles.content}>
                    <h2>No Text Channels</h2>
                    <div>
                        You find yourself in a strange place. You don't have access to any text channels, or there are
                        none in this server.
                    </div>
                </div>
            </div>
        </>
    );
}
