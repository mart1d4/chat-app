import { DefaultGuildChannelSelect, DefaultGuildRoleSelect } from "@/lib/default-selects";
import { AppHeader, ClickLayer, GuildChannels, MemberList } from "@/app/components";
import { hasChannelPermission, isChannelPrivate } from "@/lib/db/permissions";
import type { GuildChannel, GuildRole } from "@/type";
import styles from "../../me/FriendsPage.module.css";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@lib/db/db";
import Content from "./Content";

export default async function GuildChannelPage({
    params,
}: {
    params: { guildId: string; channelId: string };
}) {
    const userId = parseInt(headers().get("x-user-id") as string);
    const channelId = parseInt(params.channelId);
    const guildId = parseInt(params.guildId);

    if (!userId || !channelId || !guildId) {
        return redirect(`/channels/${guildId}`);
    }

    const canView = await hasChannelPermission({
        userId,
        channelId,
        dontAllowDMs: true,
        permission: "VIEW_CHANNEL",
        returnGuildOwner: true,
    });

    if (!canView) {
        return redirect(`/channels/${guildId}`);
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

    const channel = channels.find((channel) => channel.id === channelId);

    if (!channel) {
        // Just for type safety, this should never happen
        return redirect(`/channels/${guildId}`);
    }

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
                <div className={styles.main}>
                    <AppHeader
                        initChannel={{
                            ...channel,
                            recipients: [],
                        }}
                    />

                    <div className={styles.content}>
                        <Content
                            guildId={guildId}
                            channelId={channel.id}
                        />

                        <MemberList
                            guildId={guildId}
                            channelId={channel.id}
                            initChannel={{
                                ...channel,
                                recipients: [],
                            }}
                        />
                    </div>
                </div>
            </ClickLayer>
        </>
    );
}
