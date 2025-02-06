import { doesUserHaveChannelPermission, PERMISSIONS } from "@/lib/permissions";
import { hasChannelPermission, isChannelPrivate } from "@/lib/db/permissions";
import type { GuildChannel, GuildMember, GuildRole, KnownUser } from "@/type";
import { GuildChannelPageClient } from "./client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@lib/db/db";
import {
    DefaultGuildChannelSelect,
    DefaultGuildMemberSelect,
    DefaultGuildRoleSelect,
} from "@/lib/default-selects";

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

    const { count } = (await db
        .selectFrom("guildMembers")
        .where("guildId", "=", guildId)
        .select(({ fn }) => fn.count<number>("userId").as("count"))
        .executeTakeFirst()) || { count: 0 };

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

    const members: (GuildMember & KnownUser)[] =
        // count <= 100
        false
            ? (
                  await db
                      .selectFrom("guildMembers")
                      .innerJoin("users", "users.id", "guildMembers.userId")
                      .select(["profile", ...DefaultGuildMemberSelect])
                      .where("guildId", "=", guildId)
                      .execute()
              ).map((member) => {
                  const obj = {
                      ...member,
                      nickname: member.profile.nickname,
                      roles: member.profile.roles,
                      permissions: BigInt(member.profile.permissions),
                      joinedAt: member.profile.joinedAt,
                  };

                  // @ts-ignore - we know this is safe
                  delete obj.profile;
                  return obj;
              })
            : [];

    const member = members.find((member) => member.id === userId);

    if (!member) {
        // Just for type safety, this should never happen
        return redirect("/channels/me");
    }

    const allChannels = channelsQuery
        .map((channel) => {
            const everyoneRole = roles.find((role) => role.name === "@everyone")?.id;
            const overwrites = channel.permissionOverwrites || [];

            const newOverwrites = overwrites.map((overwrite) => {
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

    const channel = allChannels.find((channel) => channel.id === channelId);

    if (!channel) {
        // Just for type safety, this should never happen
        return redirect(`/channels/${guildId}`);
    }

    const hasPerm = (permission: keyof typeof PERMISSIONS, specificChannel?: GuildChannel) => {
        return (
            doesUserHaveChannelPermission(
                allChannels,
                roles,
                specificChannel ?? channel,
                member,
                permission
            ) || canView === userId
        );
    };

    const channels = allChannels.filter((channel) => {
        return hasPerm("VIEW_CHANNEL", channel);
    });

    return (
        <GuildChannelPageClient
            userId={userId}
            allChannels={allChannels}
            roles={roles}
            channel={channel}
            member={member}
            ownerId={canView}
            guildId={guildId}
            channels={channels}
            members={members}
        />
    );
}
