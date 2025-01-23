import type { AppUser, DMChannelWithRecipients, KnownUser, UnknownUser, UserGuild } from "@/type";
import { getFullChannel } from "../lib/strings";
import { create } from "zustand";

export interface UseDataState {
    user: AppUser | null;
    token: string | null;

    guilds: UserGuild[];
    channels: DMChannelWithRecipients[];
    friends: KnownUser[];
    received: KnownUser[];
    sent: KnownUser[];
    blocked: UnknownUser[];

    setUser: (user: AppUser | null) => void;
    updateUser: (user: Partial<AppUser>) => void;
    setToken: (token: string | null) => void;

    setGuilds: (guilds: UserGuild[]) => void;

    setChannels: (channels: DMChannelWithRecipients[]) => void;
    removeChannelRecipient: (channelId: number, userId: number) => void;
    changeChannelOwner: (channelId: number, userId: number) => void;

    setFriends: (friends: KnownUser[]) => void;
    setReceived: (received: KnownUser[]) => void;
    setSent: (sent: KnownUser[]) => void;
    setBlocked: (blocked: UnknownUser[]) => void;

    modifyUser: (user: Partial<KnownUser | UnknownUser>) => void;

    addUser: <T extends "friends" | "blocked" | "received" | "sent">(
        user: T extends "blocked" ? UnknownUser : KnownUser,
        type: T
    ) => void;
    removeUser: (id: number, type: string) => void;

    addChannel: (channel: DMChannelWithRecipients) => void;
    updateChannel: (id: number, channel: Partial<DMChannelWithRecipients>) => void;
    changeChannelIcon: (channelId: number, icon: string | null) => void;
    removeChannel: (id: number) => void;
    moveChannelUp: (id: number) => void;

    addGuild: (guild: UserGuild) => void;
    updateGuild: (id: number, guild: Partial<UserGuild>) => void;
    removeGuild: (id: number) => void;
    moveGuildUp: (id: number) => void;

    reset: () => void;
}

export const useData = create<UseDataState>()((set) => ({
    user: null,
    token: null,

    channels: [],
    guilds: [],
    friends: [],
    blocked: [],
    received: [],
    sent: [],

    setUser: (user) => set(() => ({ user })),
    updateUser: (user) => set((state) => ({ user: { ...(state.user as AppUser), ...user } })),
    setToken: (token) => set(() => ({ token })),

    setChannels: (channels) => {
        set((state) => ({
            channels: channels.map((c) => getFullChannel(c, state.user)).filter((c) => !!c),
        }));
    },

    removeChannelRecipient: (channelId, userId) => {
        set((state) => ({
            channels: state.channels.map((c) => {
                if (c.id === channelId) {
                    return {
                        ...c,
                        recipients: c.recipients.filter((r) => r.id !== userId),
                    };
                }

                return c;
            }),
        }));
    },

    changeChannelOwner: (channelId, userId) => {
        set((state) => ({
            channels: state.channels.map((c) => {
                if (c.id === channelId) {
                    return {
                        ...c,
                        ownerId: userId,
                    };
                }

                return c;
            }),
        }));
    },

    changeChannelIcon: (channelId, icon) => {
        set((state) => ({
            channels: state.channels.map((c) => {
                if (c.id === channelId) {
                    return {
                        ...c,
                        icon,
                    };
                }

                return c;
            }),
        }));
    },

    setGuilds: (guilds) => set(() => ({ guilds })),
    setFriends: (friends) => set(() => ({ friends })),
    setBlocked: (blocked) => set(() => ({ blocked })),
    setReceived: (received) => set(() => ({ received })),
    setSent: (sent) => set(() => ({ sent })),

    modifyUser: (user) =>
        set((state) => ({
            friends: state.friends.map((f) => {
                if (f.id === user.id) return { ...f, ...user };
                return f;
            }),
            blocked: state.blocked.map((b) => {
                if (b.id === user.id) return { ...b, ...user };
                return b;
            }),
            received: state.received.map((r) => {
                if (r.id === user.id) return { ...r, ...user };
                return r;
            }),
            sent: state.sent.map((r) => {
                if (r.id === user.id) return { ...r, ...user };
                return r;
            }),
            channels: state.channels
                .map((c) => {
                    if (c.recipients.some((r) => r.id === user.id)) {
                        const newChannel = {
                            ...c,
                            recipients: c.recipients.map((r) => {
                                if (r.id === user.id) return { ...r, ...user };
                                return r;
                            }),
                        };

                        return getFullChannel(newChannel, state.user);
                    }

                    return c;
                })
                .filter((c) => !!c),
        })),

    addUser: (user, type) => {
        return set((state) => {
            if (type === "friends") {
                return {
                    friends: [user as KnownUser, ...state.friends],
                    received: state.received.filter((r) => r.id !== user.id),
                    sent: state.sent.filter((r) => r.id !== user.id),
                };
            } else if (type === "blocked") {
                return {
                    blocked: [user as UnknownUser, ...state.blocked],
                    friends: state.friends.filter((f) => f.id !== user.id),
                    received: state.received.filter((r) => r.id !== user.id),
                    sent: state.sent.filter((r) => r.id !== user.id),
                };
            } else if (type === "received") {
                return { received: [user as KnownUser, ...state.received] };
            } else if (type === "sent") {
                return { sent: [user as KnownUser, ...state.sent] };
            }

            return state;
        });
    },

    removeUser: (id, type) => {
        return set((state) => {
            if (["friends", "blocked", "received", "sent"].includes(type)) {
                return {
                    [type]: state[
                        type as keyof UseDataState & ("friends" | "blocked" | "received" | "sent")
                    ].filter((u) => u.id !== id),
                };
            }

            return state;
        });
    },

    addChannel: (channel) => {
        return set((state) => {
            const newChan = getFullChannel(channel, state.user);
            if (!newChan) return state;

            return {
                channels: [newChan, ...state.channels],
            };
        });
    },

    updateChannel: (id, data) => {
        return set((state) => ({
            channels: state.channels.map((c) => {
                if (c.id === id) return { ...c, ...data };
                return c;
            }),
        }));
    },

    removeChannel: (id) => {
        set((state) => ({ channels: state.channels.filter((c) => c.id !== id) }));
    },

    moveChannelUp: (id) => {
        set((state) => {
            const channel = state.channels.find((c) => c.id === id);

            if (channel) {
                const newChannels = [channel, ...state.channels.filter((c) => c.id !== id)];
                return { channels: newChannels };
            }

            return state;
        });
    },

    addGuild: (guild) => set((state) => ({ guilds: [guild, ...state.guilds] })),

    updateGuild: (id, data) => {
        set((state) => ({
            guilds: state.guilds.map((g) => {
                if (g.id === id) return { ...g, ...data };
                return g;
            }),
        }));
    },

    removeGuild: (id) => {
        set((state) => ({ guilds: state.guilds.filter((g) => g.id !== id) }));
    },

    moveGuildUp: (id) => {
        set((state) => {
            const guild = state.guilds.find((g) => g.id === id);

            if (guild) {
                const newGuilds = [guild, ...state.guilds.filter((g) => g.id !== id)];
                return { guilds: newGuilds };
            }

            return state;
        });
    },

    reset: () => {
        set({
            user: null,
            channels: [],
            guilds: [],
            friends: [],
            blocked: [],
            received: [],
            sent: [],
        });
    },
}));
