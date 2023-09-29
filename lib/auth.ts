import { getChannelIcon, getChannelName } from "./strings";
import { cookies } from "next/headers";
import { prisma } from "./prismadb";

export const isLoggedIn = async () => {
    const refreshToken = cookies().get("token")?.value;
    if (!refreshToken) return false;

    const user = await prisma.user.findFirst({
        where: {
            refreshTokens: {
                has: refreshToken,
            },
        },
        select: {
            id: true,
        },
    });

    return !!user;
};

export const useUser = async (): Promise<TCleanUser | null> => {
    const refreshToken = cookies().get("token")?.value;
    if (!refreshToken) return null;

    const user = (await prisma.user.findFirst({
        where: {
            refreshTokens: {
                has: refreshToken,
            },
        },
        select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            banner: true,
            primaryColor: true,
            accentColor: true,
            description: true,
            customStatus: true,
            status: true,
            verified: true,
            notifications: true,
            guildIds: true,
            hiddenChannelIds: true,
            channelIds: true,
            friendIds: true,
            requestReceivedIds: true,
            requestSentIds: true,
            blockedUserIds: true,
            blockedByUserIds: true,
            createdAt: true,
        },
    })) as TCleanUser | null;

    return user;
};

export const getFriends = async (): Promise<TCleanUser[]> => {
    const refreshToken = cookies().get("token")?.value;
    if (!refreshToken) return [];

    const user = (await prisma.user.findFirst({
        where: {
            refreshTokens: {
                has: refreshToken,
            },
        },
        select: {
            friends: {
                orderBy: [
                    {
                        username: "asc",
                    },
                ],
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatar: true,
                    banner: true,
                    primaryColor: true,
                    accentColor: true,
                    description: true,
                    customStatus: true,
                    status: true,
                    guildIds: true,
                    friendIds: true,
                    createdAt: true,
                },
            },
        },
    })) as TCleanUser | null;

    return user?.friends ?? [];
};

export const getRequests = async (type?: 0 | 1): Promise<TCleanUser[]> => {
    const refreshToken = cookies().get("token")?.value;
    if (!refreshToken) return [];

    const user = (await prisma.user.findFirst({
        where: {
            refreshTokens: {
                has: refreshToken,
            },
        },
        select: {
            ...(type === 0
                ? {
                      requestsReceived: {
                          orderBy: [
                              {
                                  username: "asc",
                              },
                          ],
                          select: {
                              id: true,
                              username: true,
                              displayName: true,
                              avatar: true,
                              banner: true,
                              primaryColor: true,
                              accentColor: true,
                              guildIds: true,
                              friendIds: true,
                              createdAt: true,
                          },
                      },
                  }
                : {
                      requestsSent: {
                          orderBy: [
                              {
                                  username: "asc",
                              },
                          ],
                          select: {
                              id: true,
                              username: true,
                              displayName: true,
                              avatar: true,
                              banner: true,
                              primaryColor: true,
                              accentColor: true,
                              guildIds: true,
                              friendIds: true,
                              createdAt: true,
                          },
                      },
                  }),
        },
    })) as TCleanUser | null;

    if (type === 0) return user?.requestsReceived ?? [];
    if (type === 1) return user?.requestsSent ?? [];
    else return [...(user?.requestsReceived ?? []), ...(user?.requestsSent ?? [])];
};

export const getBlocked = async (): Promise<TCleanUser[]> => {
    const refreshToken = cookies().get("token")?.value;
    if (!refreshToken) return [];

    const user = (await prisma.user.findFirst({
        where: {
            refreshTokens: {
                has: refreshToken,
            },
        },
        select: {
            blockedUsers: {
                orderBy: [
                    {
                        username: "asc",
                    },
                ],
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatar: true,
                    banner: true,
                    primaryColor: true,
                    accentColor: true,
                    guildIds: true,
                    friendIds: true,
                    createdAt: true,
                },
            },
        },
    })) as TCleanUser;
    return user?.blockedUsers ?? [];
};

export const getBlockedBy = async (): Promise<TCleanUser[]> => {
    const refreshToken = cookies().get("token")?.value;
    if (!refreshToken) return [];

    const user = (await prisma.user.findFirst({
        where: {
            refreshTokens: {
                has: refreshToken,
            },
        },
        select: {
            blockedByUsers: {
                orderBy: [
                    {
                        username: "asc",
                    },
                ],
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatar: true,
                    banner: true,
                    primaryColor: true,
                    accentColor: true,
                    guildIds: true,
                    friendIds: true,
                    createdAt: true,
                },
            },
        },
    })) as TCleanUser;
    return user?.blockedByUsers ?? [];
};

export const getChannels = async (): Promise<TChannel[]> => {
    const refreshToken = cookies().get("token")?.value;
    if (!refreshToken) return [];

    const user = (await prisma.user.findFirst({
        where: {
            refreshTokens: {
                has: refreshToken,
            },
        },
        select: {
            id: true,
            channels: {
                orderBy: [
                    {
                        updatedAt: "desc",
                    },
                ],
                select: {
                    id: true,
                    type: true,
                    icon: true,
                    ownerId: true,
                    recipientIds: true,
                    recipients: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            avatar: true,
                            banner: true,
                            primaryColor: true,
                            accentColor: true,
                            description: true,
                            customStatus: true,
                            status: true,
                            guildIds: true,
                            friendIds: true,
                            createdAt: true,
                        },
                    },
                    createdAt: true,
                    updatedAt: true,
                },
            },
        },
    })) as TCleanUser | null;

    return (
        user?.channels?.map((channel) => ({
            ...channel,
            name: getChannelName(channel, user.id),
            icon: getChannelIcon(channel, user.id),
        })) ?? []
    );
};

export const getChannel = async (id: string): Promise<TChannel | null> => {
    const user = await useUser();
    if (!user) return null;

    const channel = (await prisma.channel.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            type: true,
            icon: true,
            name: true,
            ownerId: true,
            guildId: true,
            recipientIds: true,
            recipients: {
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatar: true,
                    banner: true,
                    primaryColor: true,
                    accentColor: true,
                    description: true,
                    customStatus: true,
                    status: true,
                    guildIds: true,
                    friendIds: true,
                    createdAt: true,
                },
            },
            createdAt: true,
            updatedAt: true,
        },
    })) as TChannel | null;

    if (!channel) return null;

    if (channel.guildId && !user.guildIds.includes(channel.guildId)) return null;
    if (!channel.guildId && !user.channelIds.includes(channel.id)) return null;

    return {
        ...channel,
        name: getChannelName(channel, user.id),
        icon: getChannelIcon(channel, user.id),
    };
};

export const getGuilds = async (): Promise<TGuild[]> => {
    const refreshToken = cookies().get("token")?.value;
    if (!refreshToken) return [];

    const user = (await prisma.user.findFirst({
        where: {
            refreshTokens: {
                has: refreshToken,
            },
        },
        select: {
            guilds: {
                select: {
                    id: true,
                    name: true,
                    icon: true,
                    banner: true,
                    description: true,
                    welcomeScreen: true,
                    vanityUrl: true,
                    systemChannelId: true,
                    afkChannelId: true,
                    afkTimeout: true,
                    ownerId: true,
                    rawMemberIds: true,
                    rawMembers: {
                        select: {
                            id: true,
                            username: true,
                            displayName: true,
                            avatar: true,
                            banner: true,
                            primaryColor: true,
                            accentColor: true,
                            description: true,
                            customStatus: true,
                            status: true,
                            guildIds: true,
                            friendIds: true,
                            createdAt: true,
                        },
                    },
                    members: true,
                    roles: true,
                    emotes: true,
                    channels: {
                        select: {
                            id: true,
                            type: true,
                            name: true,
                            position: true,
                            parentId: true,
                            guildId: true,
                        },
                    },
                },
            },
        },
    })) as TCleanUser | null;

    user?.guilds?.map((guild) => ({
        ...guild,
        channels: guild.channels.sort((a, b) => (a.position as number) - (b.position as number)),
    }));
    return user?.guilds ?? [];
};

export const getGuild = async (id: string): Promise<TGuild | null> => {
    const user = await useUser();
    if (!user || !user.guildIds.includes(id)) return null;

    const guild = (await prisma.guild.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            ownerId: true,
            name: true,
            icon: true,
            channels: {
                select: {
                    id: true,
                    type: true,
                    name: true,
                    position: true,
                    parentId: true,
                    guildId: true,
                },
            },
            members: true,
            rawMembers: {
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatar: true,
                    banner: true,
                    primaryColor: true,
                    accentColor: true,
                    description: true,
                    customStatus: true,
                    status: true,
                    guildIds: true,
                    friendIds: true,
                    createdAt: true,
                },
            },
            rawMemberIds: true,
            systemChannelId: true,
        },
    })) as TGuild | null;

    return guild;
};

export const getGuildChannels = async (id: string): Promise<TChannel[]> => {
    const user = await useUser();
    if (!user || !user.guildIds.includes(id)) return [];

    const guild = (await prisma.guild.findUnique({
        where: {
            id,
        },
        select: {
            channels: {
                select: {
                    id: true,
                    type: true,
                    name: true,
                    position: true,
                    parentId: true,
                    guildId: true,
                },
            },
        },
    })) as TGuild | null;

    return guild?.channels ?? [];
};
