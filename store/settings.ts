import { createJSONStorage, persist } from "zustand/middleware";
import { create } from "zustand";

type MuteDuration = "15m" | "1h" | "3h" | "8h" | "24h" | "always";

interface channelSettingsState {
    muted: {
        started: Date;
        duration: MuteDuration;
        channelId: number;
    }[];

    muteChannel: (duration: MuteDuration, channelId: number) => void;
    unmuteChannel: (channelId: number) => void;
}

export const useChannelSettings = create(
    persist<channelSettingsState>(
        (set) => ({
            muted: [],

            muteChannel: (duration, channelId) =>
                set((state) => {
                    if (state.muted.find((m) => m.channelId === channelId)) {
                        return state;
                    }

                    return {
                        muted: [
                            ...state.muted,
                            {
                                started: new Date(),
                                duration: duration,
                                channelId,
                            },
                        ],
                    };
                }),

            unmuteChannel: (channelId) =>
                set((state) => ({
                    muted: state.muted.filter((m) => m.channelId !== channelId),
                })),
        }),
        {
            name: "mutedChannels",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

type GuildSettingsKey = guildSettingsState["guilds"][number];

interface guildSettingsState {
    guilds: {
        [guildId: number]: {
            isMuted: boolean;
            started: Date | null;
            duration: MuteDuration | null;

            notifications: {
                get: "all" | "mentions" | "none";
                noEveryoneAndHere: boolean;
                noRoleMentions: boolean;
                noHighlights: boolean;
                noEvents: boolean;
                mobilePush: boolean;
            };

            hideMutedChannels: boolean;
            showAllChannels: boolean;

            privacy: {
                canDM: boolean;
                canRequest: boolean;
                shareActivity: boolean;
                joinActivity: boolean;
            };
        };
    };

    setGuildSettings: (
        guildId: number,
        keyOrArray:
            | keyof GuildSettingsKey
            | keyof GuildSettingsKey["notifications"]
            | keyof GuildSettingsKey["privacy"]
            | [
                  (
                      | keyof GuildSettingsKey
                      | keyof GuildSettingsKey["notifications"]
                      | keyof GuildSettingsKey["privacy"]
                  ),
                  any
              ][],
        value?: any
    ) => void;
}

export const useGuildSettings = create(
    persist<guildSettingsState>(
        (set) => ({
            guilds: {},

            setGuildSettings: (guildId, keyOrArray, value) =>
                set((state) => {
                    const guild = state.guilds[guildId] ?? {
                        isMuted: false,
                        started: null,
                        duration: null,

                        notifications: {
                            get: "all",
                            noEveryoneAndHere: false,
                            noRoleMentions: false,
                            noHighlights: false,
                            noEvents: false,
                            mobilePush: false,
                        },

                        hideMutedChannels: false,
                        showAllChannels: false,

                        privacy: {
                            canDM: true,
                            canRequest: true,
                            shareActivity: true,
                            joinActivity: true,
                        },
                    };

                    // Handle array of updates
                    if (Array.isArray(keyOrArray)) {
                        const updatedGuild = keyOrArray.reduce(
                            (acc, [key, val]) => {
                                if (key in acc) {
                                    // @ts-ignore - This is fine
                                    acc[key] = val;
                                } else if (key in acc.notifications) {
                                    acc.notifications = {
                                        ...acc.notifications,
                                        [key]: val,
                                    };
                                } else if (key in acc.privacy) {
                                    acc.privacy = {
                                        ...acc.privacy,
                                        [key]: val,
                                    };
                                }

                                return acc;
                            },
                            { ...guild }
                        );

                        return {
                            guilds: {
                                ...state.guilds,
                                [guildId]: updatedGuild,
                            },
                        };
                    }

                    // Handle single key update
                    if (keyOrArray in guild) {
                        return {
                            guilds: {
                                ...state.guilds,
                                [guildId]: {
                                    ...guild,
                                    [keyOrArray]: value,
                                },
                            },
                        };
                    }

                    if (keyOrArray in guild.notifications) {
                        return {
                            guilds: {
                                ...state.guilds,
                                [guildId]: {
                                    ...guild,
                                    notifications: {
                                        ...guild.notifications,
                                        [keyOrArray]: value,
                                    },
                                },
                            },
                        };
                    }

                    if (keyOrArray in guild.privacy) {
                        return {
                            guilds: {
                                ...state.guilds,
                                [guildId]: {
                                    ...guild,
                                    privacy: {
                                        ...guild.privacy,
                                        [keyOrArray]: value,
                                    },
                                },
                            },
                        };
                    }

                    return state;
                }),
        }),
        {
            name: "guildSettings",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
