import { GuildChannels, ClickLayer } from "@components";
import { isUserInGuild } from "@/lib/db/helpers";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import styles from "./page.module.css";
import { db } from "@lib/db/db";

export default async function GuildPage({ params }: { params: { guildId: string } }) {
    const userId = parseInt(headers().get("x-user-id") as string);
    const guildId = parseInt(params.guildId);

    if (!userId || !guildId || !(await isUserInGuild(userId, guildId))) {
        return redirect("/channels/me");
    }

    const systemChannel = await db
        .selectFrom("channels")
        .innerJoin("guilds", "channels.guildId", "guilds.id")
        .select("channels.id")
        .where("guildId", "=", guildId)
        .whereRef("guilds.systemChannelId", "=", "channels.id")
        .executeTakeFirst();

    if (systemChannel) {
        return redirect(`/channels/${guildId}/${systemChannel.id}`);
    }

    return (
        <>
            <GuildChannels guildId={guildId} />

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
