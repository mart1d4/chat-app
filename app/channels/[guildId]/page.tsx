import { getGuild, getUser, isUserInGuild } from "@/lib/db/helpers";
import { GuildChannels, ClickLayer } from "@components";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export default async function GuildPage({ params }: { params: { guildId: string } }) {
    const user = await getUser({});
    if (!user) redirect("/login");

    const guildId = parseInt(params.guildId);
    if (!(await isUserInGuild(user.id, guildId))) redirect("/channels/me");

    const guild = await getGuild({
        id: guildId,
        getMembers: true,
        getChannels: true,
    });

    if (!guild) redirect("/channels/me");

    const textChannel = guild.channels.find((c) => c.type === 2);
    if (textChannel) redirect(`/channels/${guildId}/${textChannel.id}`);

    return (
        <>
            <GuildChannels
                guild={guild}
                user={user}
                initChannels={guild.channels}
            />

            <ClickLayer>
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
            </ClickLayer>
        </>
    );
}
