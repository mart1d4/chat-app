import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface notificationsState {
    notifications: {
        channels: {
            id: number;
            hasUnread: boolean;
            pings: number;
            guildId?: number;
        }[];
        guilds: {
            id: number;
            hasUnread: boolean;
            pings: number;
        }[];
    };

    addNotification: (channelId: number, isPing: boolean, guildId?: number) => void;
    removeNotification: (channelId: number, guildId?: number) => void;
    removeGuildNotifications: (guildId: number) => void;
}

export const useNotifications = create(
    persist<notificationsState>(
        (set) => ({
            notifications: {
                channels: [],
                guilds: [],
            },

            addNotification: (channelId, isPing, guildId) => {
                set((state) => ({
                    notifications: {
                        channels: (() => {
                            const existingChannel = state.notifications.channels.find(
                                (c) => c.id === channelId
                            );

                            if (existingChannel) {
                                return state.notifications.channels.map((c) =>
                                    c.id === channelId
                                        ? {
                                              ...c,
                                              hasUnread: true,
                                              pings: isPing ? c.pings + 1 : c.pings,
                                          }
                                        : c
                                );
                            }

                            return [
                                ...state.notifications.channels,
                                { id: channelId, hasUnread: true, pings: isPing ? 1 : 0, guildId },
                            ];
                        })(),
                        guilds: (() => {
                            if (!guildId) return state.notifications.guilds;

                            const existingGuild = state.notifications.guilds.find(
                                (g) => g.id === guildId
                            );

                            if (existingGuild) {
                                return state.notifications.guilds.map((g) =>
                                    g.id === guildId
                                        ? {
                                              ...g,
                                              hasUnread: true,
                                              pings: isPing ? g.pings + 1 : g.pings,
                                          }
                                        : g
                                );
                            }

                            return [
                                ...state.notifications.guilds,
                                { id: guildId, hasUnread: true, pings: isPing ? 1 : 0 },
                            ];
                        })(),
                    },
                }));
            },

            removeNotification: (channelId, guildId) => {
                set((state) => {
                    const areThereOthers = state.notifications.channels.filter(
                        (c) => c.guildId === guildId && c.hasUnread && c.id !== channelId
                    );

                    return {
                        notifications: {
                            channels: state.notifications.channels.map((c) =>
                                c.id === channelId ? { ...c, hasUnread: false, pings: 0 } : c
                            ),
                            guilds: guildId
                                ? state.notifications.guilds.map((g) =>
                                      g.id === guildId
                                          ? {
                                                ...g,
                                                hasUnread: areThereOthers.some((c) => c.hasUnread),
                                                pings: areThereOthers.reduce(
                                                    (acc, c) => acc + c.pings,
                                                    0
                                                ),
                                            }
                                          : g
                                  )
                                : state.notifications.guilds,
                        },
                    };
                });
            },

            removeGuildNotifications: (guildId) => {
                set((state) => ({
                    notifications: {
                        channels: state.notifications.channels.map((c) =>
                            c.guildId === guildId ? { ...c, hasUnread: false, pings: 0 } : c
                        ),
                        guilds: state.notifications.guilds.map((g) =>
                            g.id === guildId ? { ...g, hasUnread: false, pings: 0 } : g
                        ),
                    },
                }));
            },
        }),
        {
            name: "notifications",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
