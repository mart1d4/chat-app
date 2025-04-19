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
        // Here we need to get a lot of things because we dont know
        // whether the channel is in a guild or not
        // we need to get the channel's type, its permission overwrites,
        // the guild it is in, the guild's owner, the user's roles in the guild
        // and the user's permissions in the guild (if the channel is in a guild)
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
            .where(({ eb, or }) =>
                or([
                    eb("channelRecipients.userId", "=", userId),
                    eb("guildMembers.userId", "=", userId),
                ])
            )
            .executeTakeFirst();

        if (!channel) return false;

        // At this point we know the user is at least in the channel or in the guild the channel is in

        if (channel.type === 0) {
            // If DM, we need to make sure neither of the users have blocked each other

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

        // If channel is DM, cannot modify the channel
        if (channel.type === 0 && permission === "MANAGE_CHANNELS") return false;

        // If channel is a voice channel, cannot send messages
        if (channel.type === 3 && permission === "SEND_MESSAGES") return false;

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

        const { roles } = channel.memberProfile;
        const overwrites = channel.permissionOverwrites;

        const rolesWithPerm = await db
            .selectFrom("roles")
            .select("permissions")
            .where("id", "in", roles)
            .execute();

        const maxRolePerms = combinePermissions(rolesWithPerm.map((r) => r.permissions));

        if (hasPermission(maxRolePerms, PERMISSIONS.ADMINISTRATOR)) {
            if (returnGuildId) return channel.guildId;
            if (returnGuildOwner) return channel.guildOwnerId;
            return true;
        }

        // Check if user has permission in overwrites
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

        if (hasPermission(maxRolePerms, PERMISSIONS[permission])) {
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

        const { roles: userRoles } = guild.memberProfile;

        const roles = await db
            .selectFrom("roles")
            .select("permissions")
            .where("id", "in", userRoles)
            .execute();

        const maxPermissions = combinePermissions(roles.map((r) => r.permissions));

        if (
            hasPermission(maxPermissions, PERMISSIONS[permission]) ||
            hasPermission(maxPermissions, PERMISSIONS.ADMINISTRATOR)
        ) {
            return true;
        }

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
