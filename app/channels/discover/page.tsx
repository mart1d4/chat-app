import { Icon, UserSection } from "@/app/components";
import styles from "./Discover.module.css";
import { ServerCard } from "./ServerCard";
import { headers } from "next/headers";
import { db } from "@/lib/db/db";
import { sql } from "kysely";
import { Init } from "./Init";

export default async function DiscoverPage() {
    const userId = parseInt(headers().get("x-user-id") as string);

    const discoverable = await db
        .selectFrom("guilds")
        // @ts-expect-error
        .select([
            "id",
            "name",
            "description",
            "icon",
            "banner",
            "vanityUrl",
            "welcomeScreen",
            "systemChannelId",
            "createdAt",
            sql`(SELECT COUNT(*) FROM guild_members WHERE guild_members.guild_id = guilds.id) as memberCount`,
            sql`(SELECT COUNT(*) FROM guild_members WHERE guild_members.guild_id = guilds.id AND guild_members.user_id = ${userId}) as isMember`,
        ])
        .where("discoverable", "=", true)
        .where("isDeleted", "=", false)
        .where("vanityUrl", "is not", null)
        .where("banner", "is not", null)
        .where("icon", "is not", null)
        .where("description", "is not", null)
        .execute();

    return (
        <div className={styles.container}>
            <aside>
                <div className={styles.sidebar}>
                    <h2>Discover</h2>

                    <nav>
                        <div className={styles.tab}>
                            <Icon name="home" />
                            <div>Servers</div>
                        </div>
                    </nav>
                </div>

                <UserSection />
            </aside>

            <main className="scrollbar">
                <header className={styles.header}>
                    <div>
                        <h1>Find your community on Spark</h1>
                        <p>From gaming, to music, to learning, there's a place for you.</p>
                    </div>
                </header>

                <section className={styles.servers}>
                    <h3>Discoverable Servers</h3>

                    <ol>
                        {discoverable.map((guild) => (
                            <ServerCard
                                key={guild.id}
                                guild={guild}
                            />
                        ))}
                    </ol>
                </section>
            </main>

            <Init />
        </div>
    );
}
