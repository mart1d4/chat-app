import { DefaultGuildChannelSelect, DefaultGuildRoleSelect } from "@/lib/default-selects";
import { GuildChannels, ClickLayer } from "@components";
import { isChannelPrivate } from "@/lib/db/permissions";
import type { GuildChannel, GuildRole } from "@/type";
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
        .where("channels.isDeleted", "=", false)
        .whereRef("guilds.systemChannelId", "=", "channels.id")
        .executeTakeFirst();

    if (systemChannel) {
        return redirect(`/channels/${guildId}/${systemChannel.id}`);
    }

    const firstTextChannel = await db
        .selectFrom("channels")
        .select("id")
        .where("guildId", "=", guildId)
        .where("type", "=", 2)
        .where("isDeleted", "=", false)
        .orderBy("position", "asc")
        .executeTakeFirst();

    if (firstTextChannel) {
        return redirect(`/channels/${guildId}/${firstTextChannel.id}`);
    }

    const roles = (
        await db
            .selectFrom("roles")
            .select(DefaultGuildRoleSelect)
            .where("guildId", "=", guildId)
            .execute()
    ).map((role) => ({
        ...role,
        permissions: BigInt(role.permissions),
    })) as GuildRole[];

    const channelsQuery = (await db
        .selectFrom("channels")
        .select(DefaultGuildChannelSelect)
        .where("guildId", "=", guildId)
        .execute()) as GuildChannel[];

    const channels = channelsQuery
        .map((channel) => {
            const everyoneRole = roles.find((role) => role.name === "@everyone")?.id;
            const overwrites = channel.permissionOverwrites || [];

            const newOverwrites = overwrites.map((overwrite: { allow: string; deny: string }) => {
                return {
                    ...overwrite,
                    allow: BigInt(overwrite.allow),
                    deny: BigInt(overwrite.deny),
                };
            });

            const isPrivate = everyoneRole
                ? isChannelPrivate(channel.permissionOverwrites, everyoneRole)
                : false;

            return {
                ...channel,
                permissionOverwrites: newOverwrites,
                isPrivate,
            };
        })
        .sort((a, b) => a.position - b.position);

    const guildMemberCount = (
        await db
            .selectFrom("guildMembers")
            .select("userId")
            .where("guildId", "=", guildId)
            .execute()
    ).length;

    // If guild member count is 100 or less, get all members, otherwise return empty array
    const guildMembers =
        guildMemberCount <= 100
            ? (
                  await db
                      .selectFrom("guildMembers")
                      .innerJoin("users", "users.id", "guildMembers.userId")
                      .select("guildMembers.profile")
                      .select([
                          "users.username",
                          "users.displayName",
                          "users.avatar",
                          "users.status",
                          "users.customStatus",
                      ])
                      .where("guildId", "=", guildId)
                      .execute()
              ).map((m) => {
                  const obj = {
                      ...m,
                      ...m.profile,
                      permissions: BigInt(m.profile.permissions),
                  };

                  // @ts-expect-error - we know profile exists
                  delete obj.profile;
                  return obj;
              })
            : [];

    return (
        <>
            <GuildChannels
                guildId={guildId}
                channels={channels}
                members={guildMembers}
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
