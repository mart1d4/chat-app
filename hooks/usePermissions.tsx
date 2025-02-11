"use client";

import { useAuthenticatedUser } from "./useAuthenticatedUser";
import { useCallback } from "react";
import { useData } from "@/store";
import {
    doesUserHaveChannelPermission,
    doesUserHaveGuildPermission,
    PERMISSIONS,
} from "@/lib/permissions";

export const usePermissions = ({
    guildId,
    channelId,
}: {
    guildId?: number;
    channelId?: number;
}) => {
    const user = useAuthenticatedUser();
    const { guilds } = useData();

    const hasPermission = useCallback(
        ({
            permission,
            specificChannelId,
            userId,
        }: {
            permission: keyof typeof PERMISSIONS;
            specificChannelId?: number;
            userId?: number;
        }) => {
            if (!userId) userId = user.id;
            if (specificChannelId) channelId = specificChannelId;

            const guild = guilds.find((g) => g.id === guildId);
            if (!guild) return false;

            if (guild.ownerId === userId) return true;

            const channel = guild.channels?.find((c) => c.id === channelId);
            if (channelId && !channel) return false;

            const member = guild.members.find((m) => m.id === userId);
            if (!member) return false;

            if (channel) {
                return doesUserHaveChannelPermission(
                    guild.channels,
                    guild.roles,
                    channel,
                    member,
                    permission
                );
            } else {
                return doesUserHaveGuildPermission(guild.roles, member, permission);
            }
        },
        [guilds, user]
    );

    return { hasPermission };
};
