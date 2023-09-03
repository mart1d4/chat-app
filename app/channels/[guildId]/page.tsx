import { getGuild, getGuildChannels, useUser } from "@/lib/auth";
import { GuildChannels } from "@components";
import styles from "./page.module.css";
import { redirect } from "next/navigation";

const Page = async ({ params }: { params: { guildId: string } }) => {
    const guild = (await getGuild(params.guildId)) as TGuild;
    if (!guild) redirect("/channels/me");

    const user = (await useUser()) as TCleanUser;
    const channels = await getGuildChannels(guild.id);

    channels.sort((a, b) => (a.position as number) - (b.position as number));

    return (
        <>
            <GuildChannels
                guild={guild}
                channels={channels}
                user={user}
            />

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
};

export default Page;
