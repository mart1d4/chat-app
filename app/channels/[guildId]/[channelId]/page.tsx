import { GuildChannels, AppHeader, MemberList, ClickLayer } from "@components";
import {
    doesUserHaveChannelPermission,
    hasChannelPermission,
    isChannelPrivate,
} from "@/lib/db/permissions";
import styles from "../../me/FriendsPage.module.css";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Content from "./Content";
import { db } from "@lib/db/db";
import {
    DefaultGuildChannelSelect,
    DefaultGuildMemberSelect,
    DefaultGuildRoleSelect,
} from "@/lib/default-selects";
import type { GuildChannel, GuildMember, GuildRole } from "@/type";
import { toString } from "@/lib/db/helpers";
import { PERMISSIONS } from "@/lib/permissions";

export default async function GuildChannelPage({
    params,
}: {
    params: { guildId: string; channelId: string };
}) {
    const userId = parseInt(headers().get("x-user-id") as string);
    const channelId = parseInt(params.channelId);
    const guildId = parseInt(params.guildId);

    if (
        !userId ||
        !channelId ||
        !guildId ||
        !(await hasChannelPermission({
            userId,
            channelId,
            dontAllowDMs: true,
            permission: "VIEW_CHANNEL",
        }))
    ) {
        return redirect(`/channels/${guildId}`);
    }

    const roles = (
        await db
            .selectFrom("roles")
            .select(DefaultGuildRoleSelect)
            .where("guildId", "=", guildId)
            .execute()
    ).map((role) => {
        return {
            ...role,
            permissions: BigInt(role.permissions),
        };
    }) as GuildRole[];

    const channelsQuery = (await db
        .selectFrom("channels")
        .select(DefaultGuildChannelSelect)
        .where("guildId", "=", guildId)
        .execute()) as GuildChannel[];

    const membersQuery = await db
        .selectFrom("guildMembers")
        .innerJoin("users", "users.id", "guildMembers.userId")
        .select(["profile", ...DefaultGuildMemberSelect])
        .where("guildId", "=", guildId)
        .execute();

    const members = membersQuery.map((member) => {
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
    }) as GuildMember[];

    const ownerId = (
        await db.selectFrom("guilds").select("ownerId").where("id", "=", guildId).executeTakeFirst()
    )?.ownerId;

    const member = members.find((member) => member.id === userId);

    if (!member) {
        // Just for type safety, this should never happen
        return redirect("/channels/me");
    }

    const allChannels = channelsQuery
        .map((channel) => {
            const everyoneRole = roles.find((role) => role.name === "everyone")?.id;
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

    const hasLocalChannelPermission = (
        permission: keyof typeof PERMISSIONS,
        specificChannel?: GuildChannel
    ) => {
        if (ownerId === userId) return true;
        return doesUserHaveChannelPermission(
            allChannels,
            roles,
            specificChannel ?? channel,
            member,
            permission
        );
    };

    const channels = allChannels.filter((channel) => {
        return hasLocalChannelPermission("VIEW_CHANNEL", channel);
    });

    return (
        <>
            <GuildChannels
                guildId={guildId}
                channels={channels}
            />

            <ClickLayer>
                <div className={styles.main}>
                    <AppHeader
                        initChannel={
                            {
                                ...channel,
                                recipients: members,
                            } as any
                        }
                    />

                    <div className={styles.content}>
                        <Content
                            guildId={guildId}
                            members={members}
                            channel={{
                                ...channel,
                                recipients: members,
                            }}
                        />

                        <MemberList
                            guildId={guildId}
                            channelId={channelId}
                            initChannel={{
                                ...channel,
                                recipients: members,
                            }}
                        />
                    </div>
                </div>
            </ClickLayer>
        </>
    );
}
