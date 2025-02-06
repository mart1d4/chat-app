import { PERMISSIONS, combinePermissions, hasPermission } from "@lib/permissions";
import type { PermissionOverwrites } from "./db.types";
import { areUsersBlocked } from "./helpers";
import { db } from "@lib/db/db";

export async function hasChannelPermission({
    userId,
    channelId,
    permission,
    dontAllowDMs = false,
    returnGuildId = false,
    returnGuildOwner = false,
    returnChannelType = false,
}: {
    userId: number;
    channelId: number;
    permission: keyof typeof PERMISSIONS;
    dontAllowDMs?: boolean;
    returnGuildId?: boolean;
    returnGuildOwner?: boolean;
    returnChannelType?: boolean;
}) {
    try {
        const channel = await db
            .selectFrom("channels")
            .leftJoin("channelRecipients", "channelRecipients.channelId", "channels.id")
            .leftJoin("guilds", "guilds.id", "channels.guildId")
            .leftJoin("guildMembers", "guildMembers.guildId", "guilds.id")
            .select([
                "channels.type",
                "channels.guildId",
                "channels.permissionOverwrites",
                "guilds.ownerId as guildOwnerId",
                "guildMembers.profile as memberProfile",
            ])
            .where("channels.id", "=", channelId)
            .where("channels.isDeleted", "=", false)
            .where(({ eb, or }) =>
                or([
                    eb("channelRecipients.userId", "=", userId),
                    eb("guildMembers.userId", "=", userId),
                ])
            )
            .executeTakeFirst();

        if (!channel) return false;

        if (channel.type === 0) {
            const otherUser = await db
                .selectFrom("channelRecipients")
                .select("userId as id")
                .where("channelId", "=", channelId)
                .where("userId", "!=", userId)
                .executeTakeFirst();

            if (!otherUser) return false;

            if (await areUsersBlocked(userId, otherUser.id)) {
                return false;
            }
        }

        if (channel.type === 0 && permission === "MANAGE_CHANNELS") return false;

        if ([0, 1].includes(channel.type)) {
            if (dontAllowDMs) return false;
            if (returnChannelType) return channel.type;
            return true;
        }

        if (channel.guildId && channel.guildOwnerId === userId) {
            if (returnGuildId) return channel.guildId;
            if (returnGuildOwner) return channel.guildOwnerId;
            return true;
        }

        if (!channel.memberProfile) return false;

        const { permissions, roles } = channel.memberProfile;
        const overwrites = channel.permissionOverwrites;

        for (const overwrite of overwrites) {
            if (overwrite.type === 0 && roles.includes(overwrite.id)) {
                if (hasPermission(overwrite.deny, PERMISSIONS[permission])) {
                    return false;
                } else if (hasPermission(overwrite.allow, PERMISSIONS[permission])) {
                    if (returnGuildId) return channel.guildId;
                    if (returnGuildOwner) return channel.guildOwnerId;
                    return true;
                }
            } else if (overwrite.type === 1 && overwrite.id === userId) {
                if (hasPermission(overwrite.deny, PERMISSIONS[permission])) {
                    return false;
                } else if (hasPermission(overwrite.allow, PERMISSIONS[permission])) {
                    if (returnGuildId) return channel.guildId;
                    if (returnGuildOwner) return channel.guildOwnerId;
                    return true;
                }
            }
        }

        if (
            hasPermission(permissions, PERMISSIONS[permission]) ||
            hasPermission(permissions, PERMISSIONS.ADMINISTRATOR)
        ) {
            if (returnGuildId) return channel.guildId;
            if (returnGuildOwner) return channel.guildOwnerId;
            return true;
        }

        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function hasGuildPermission({
    userId,
    guildId,
    permission,
}: {
    userId: number;
    guildId: number;
    permission: keyof typeof PERMISSIONS;
}) {
    try {
        const guild = await db
            .selectFrom("guilds")
            .leftJoin("guildMembers", "guildMembers.guildId", "guilds.id")
            .select(["guilds.ownerId", "guildMembers.profile as memberProfile"])
            .where("guilds.id", "=", guildId)
            .where("guilds.isDeleted", "=", false)
            .where("guildMembers.userId", "=", userId)
            .executeTakeFirst();

        if (!guild) return false;
        if (guild.ownerId === userId) return true;
        if (!guild.memberProfile) return false;

        const { permissions, roles: userRoles } = guild.memberProfile;

        if (
            hasPermission(permissions, PERMISSIONS[permission]) ||
            hasPermission(permissions, PERMISSIONS.ADMINISTRATOR)
        ) {
            return true;
        }

        const roles = await db
            .selectFrom("roles")
            .select("permissions")
            .where("id", "in", userRoles)
            .execute();

        const maxPermissions = combinePermissions(roles.map((r) => r.permissions));
        if (hasPermission(maxPermissions, PERMISSIONS[permission])) return true;

        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export function isChannelPrivate(overwrites: PermissionOverwrites[], everyoneRole: number) {
    for (const overwrite of overwrites) {
        if (overwrite.type === 0 && overwrite.id === everyoneRole) {
            return hasPermission(overwrite.deny, PERMISSIONS.VIEW_CHANNEL);
        }
    }

    return false;
}
