import { handleChannelDeletion } from "@/lib/channels";
import { isChannelPrivate } from "@/lib/permissions";
import { getFullChannel } from "../lib/strings";
import { create } from "zustand";
import type {
    DMChannelWithRecipients,
    ChannelRecipient,
    GuildChannel,
    UnknownUser,
    GuildMember,
    KnownUser,
    UserGuild,
    GuildRole,
    AppUser,
} from "@/type";
export interface UseDataState {
    user: AppUser | null;
    token: string | null;

    guilds: UserGuild[];
    channels: DMChannelWithRecipients[];
    friends: (KnownUser & {
        dbStatus: KnownUser["status"];
    })[];
    received: KnownUser[];
    sent: KnownUser[];
    blocked: UnknownUser[];

    setUser: (user: AppUser | null) => void;
    updateUser: (user: Partial<AppUser>) => void;
    setToken: (token: string | null) => void;

    setGuilds: (guilds: UserGuild[]) => void;

    setChannels: (channels: DMChannelWithRecipients[]) => void;
    addChannelRecipient: (channelId: number, user: ChannelRecipient) => void;
    removeChannelRecipient: (channelId: number, userId: number) => void;
    addChannel: (channel: DMChannelWithRecipients) => void;
    updateChannel: (id: number, channel: Partial<DMChannelWithRecipients>) => void;
    removeChannel: (id: number) => void;
    moveChannelUp: (id: number) => void;
    setOnlineRecipients: (channelId: number, ids: number[]) => void;
    addOnlineRecipient: (channelId: number, user: KnownUser) => void;
    removeOnlineRecipient: (channelId: number, id: number) => void;

    setFriends: (friends: KnownUser[]) => void;
    setFriendsStatus: (ids: number[], status: "online" | "offline") => void;

    setReceived: (received: KnownUser[]) => void;
    setSent: (sent: KnownUser[]) => void;
    setBlocked: (blocked: UnknownUser[]) => void;

    modifyUser: (user: Partial<KnownUser | UnknownUser>) => void;

    addUser: <T extends "friends" | "blocked" | "received" | "sent">(
        user: T extends "blocked" ? UnknownUser : KnownUser,
        type: T
    ) => void;
    removeUser: (id: number, type: string) => void;

    addGuild: (guild: UserGuild) => void;
    updateGuild: (id: number, guild: Partial<UserGuild>) => void;
    removeGuild: (id: number) => void;
    moveGuildUp: (id: number) => void;
    setOnlineMembers: (guildId: number, users: GuildMember[]) => void;
    addOnlineMember: (guildId: number, user: GuildMember) => void;
    removeOnlineMember: (guildId: number, id: number) => void;
    addGuildChannel: (guildId: number, channel: GuildChannel) => void;
    updateGuildChannel: (
        guildId: number,
        channelId: number,
        channel: Partial<GuildChannel>
    ) => void;
    removeGuildChannel: (guildId: number, channelId: number) => void;

    addGuildRole: (guildId: number, role: GuildRole) => void;
    updateGuildRole: (guildId: number, roleId: number, role: Partial<GuildRole>) => void;
    removeGuildRole: (guildId: number, roleId: number) => void;

    updateGuildMember: (guildId: number, memberId: number, member: Partial<GuildMember>) => void;
    removeMember: (guildId: number, memberId: number) => void;

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
            channels: channels
                .map((c) => getFullChannel(c, state.user))
                .filter((c) => !!c)
                .map((c) => ({
                    ...c,
                    recipients: c.recipients.map((r) => ({
                        ...r,
                        dbStatus: r.status,
                        status: "offline",
                    })),
                })),
        }));
    },

    addChannelRecipient: (channelId, user) => {
        set((state) => ({
            channels: state.channels.map((c) => {
                if (c.id === channelId) {
                    return {
                        ...c,
                        name: getFullChannel(c, state.user)?.name,
                        recipients: [
                            ...c.recipients,
                            {
                                ...user,
                                dbStatus: user.status,
                                status: "offline",
                            },
                        ],
                    };
                }

                return c;
            }),
        }));
    },

    removeChannelRecipient: (channelId, userId) => {
        set((state) => ({
            channels: state.channels.map((c) => {
                if (c.id === channelId) {
                    return {
                        ...c,
                        name: getFullChannel(c, state.user)?.name,
                        recipients: c.recipients.filter((r) => r.id !== userId),
                    };
                }

                return c;
            }),
        }));
    },

    addChannel: (channel) => {
        return set((state) => {
            const newChan = getFullChannel(channel, state.user);
            if (!newChan) return state;

            return {
                channels: [
                    {
                        ...newChan,
                        recipients: newChan.recipients.map((r) => ({
                            ...r,
                            dbStatus: r.status,
                            status: "offline",
                        })),
                    },
                    ...state.channels,
                ],
            };
        });
    },

    updateChannel: (id, data) => {
        return set((state) => ({
            channels: state.channels.map((c) => {
                if (c.id === id)
                    return {
                        ...c,
                        ...data,
                        name: getFullChannel({ ...c, ...data }, state.user)?.name,
                    };
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

    setOnlineRecipients: (channelId, ids) => {
        set((state) => ({
            channels: state.channels.map((c) => {
                if (c.id !== channelId) return c;

                return {
                    ...c,
                    recipients: c.recipients.map((r) => {
                        if (ids.includes(r.id)) {
                            return { ...r, status: r.dbStatus };
                        }

                        return { ...r, status: "offline" };
                    }),
                };
            }),
        }));
    },

    addOnlineRecipient: (channelId, user) => {
        set((state) => ({
            channels: state.channels.map((c) => {
                if (c.id !== channelId) return c;

                return {
                    ...c,
                    recipients: c.recipients.map((r) => {
                        if (r.id === user.id) {
                            return {
                                ...r,
                                ...user,
                                dbStatus: user.status,
                            };
                        }

                        return r;
                    }),
                };
            }),
        }));
    },

    removeOnlineRecipient: (channelId, id) => {
        set((state) => ({
            channels: state.channels.map((c) => {
                if (c.id !== channelId) return c;

                return {
                    ...c,
                    recipients: c.recipients.map((r) => {
                        if (r.id === id) {
                            return { ...r, status: "offline" };
                        }

                        return r;
                    }),
                };
            }),
        }));
    },

    setGuilds: (guilds) =>
        set(() => ({
            guilds: guilds.map((g) => ({
                ...g,
                members: g.members.map((m) => ({
                    ...m,
                    dbStatus: m.status,
                    status: "offline",
                })),
            })),
        })),

    setFriends: (friends) => {
        return set(() => ({
            friends: friends.map((f) => ({ ...f, dbStatus: f.status, status: "offline" })),
        }));
    },

    setFriendsStatus: (ids, status) => {
        set((state) => ({
            friends: state.friends.map((f) => {
                if (ids.includes(f.id)) {
                    return { ...f, status: status === "offline" ? "offline" : f.dbStatus };
                }

                return f;
            }),
        }));
    },

    setBlocked: (blocked) => set(() => ({ blocked })),
    setSent: (sent) => set(() => ({ sent: sent.map((s) => ({ ...s, status: "offline" })) })),
    setReceived: (received) => set(() => ({ received })),

    modifyUser: (user) =>
        // @ts-expect-error
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
                    friends: [
                        {
                            ...(user as KnownUser),
                            dbStatus: (user as KnownUser).status,
                            status: "offline",
                        },
                        ...state.friends,
                    ],
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
                return {
                    received: [user as KnownUser, ...state.received],
                };
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

    addGuild: (guild) =>
        set((state) => ({
            guilds: [
                {
                    ...guild,
                    channels: [],
                    members: guild.members.map((m) => ({
                        ...m,
                        permissions: BigInt(m.permissions),
                        dbStatus: m.status,
                        status: "offline",
                    })),
                    roles: guild.roles.map((r) => ({
                        ...r,
                        permissions: BigInt(r.permissions),
                    })),
                },
                ...state.guilds,
            ],
        })),

    updateGuild: (id, data) => {
        set((state) => ({
            guilds: state.guilds.map((g) => {
                if (g.id === id)
                    return {
                        ...g,
                        ...data,
                        members: data.members
                            ? [
                                  ...data.members
                                      .filter((m) => !g.members.some((gm) => gm.id === m.id))
                                      .map((m) => ({
                                          ...m,
                                          dbStatus: m.status,
                                          status: "offline",
                                      })),
                                  ...g.members,
                              ]
                            : g.members,
                    };
                return g;
            }),
        }));
    },

    removeGuild: (id) => set((state) => ({ guilds: state.guilds.filter((g) => g.id !== id) })),

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

    setOnlineMembers: (guildId, users) => {
        set((state) => ({
            guilds: state.guilds.map((g) => {
                if (g.id !== guildId) return g;

                return {
                    ...g,
                    members: [
                        // Add users that aren't in the members list
                        ...users
                            .filter((u) => !g.members.some((m) => m.id === u.id))
                            .map((u) => ({
                                ...u,
                                dbStatus: u.status,
                                status: u.status,
                            })),
                        ...g.members.map((m) => {
                            const user = users.find((u) => u.id === m.id);

                            if (user) {
                                return {
                                    ...m,
                                    ...user,
                                    dbStatus: user.status,
                                    status: user.status,
                                };
                            }

                            return { ...m, status: "offline" };
                        }),
                    ],
                };
            }),
        }));
    },

    addOnlineMember: (guildId, user) => {
        set((state) => ({
            guilds: state.guilds.map((g) => {
                if (g.id !== guildId) return g;

                return {
                    ...g,
                    members: [
                        ...g.members.filter((m) => m.id !== user.id),
                        {
                            ...user,
                            dbStatus: user.status,
                            status: user.status,
                        },
                    ],
                };
            }),
        }));
    },

    removeOnlineMember: (guildId, id) => {
        set((state) => ({
            guilds: state.guilds.map((g) => {
                if (g.id !== guildId) return g;

                return {
                    ...g,
                    members: g.members.map((m) => {
                        if (m.id === id) {
                            return { ...m, status: "offline" };
                        }

                        return m;
                    }),
                };
            }),
        }));
    },

    addGuildChannel: (guildId, channel) => {
        set((state) => ({
            guilds: state.guilds.map((g) => {
                if (g.id !== guildId) return g;

                const everyone = g.roles.find((r) => r.everyone);

                const overwrites = JSON.parse(channel.permissionOverwrites).map((o: any) => ({
                    ...o,
                    allow: BigInt(o.allow),
                    deny: BigInt(o.deny),
                }));

                return {
                    ...g,
                    channels: [
                        {
                            ...channel,
                            recipients: [],
                            permissionOverwrites: overwrites,
                            isPrivate: isChannelPrivate(overwrites, everyone!.id),
                        },
                        ...g.channels.map((c) => {
                            if (c.position >= channel.position) {
                                return { ...c, position: c.position + 1 };
                            }

                            return c;
                        }),
                    ].sort((a, b) => a.position - b.position),
                };
            }),
        }));
    },

    updateGuildChannel: (guildId, channelId, channel) => {
        set((state) => ({
            guilds: state.guilds.map((g) => {
                if (g.id !== guildId) return g;

                return {
                    ...g,
                    channels: g.channels.map((c) => {
                        if (c.id === channelId) {
                            return {
                                ...c,
                                ...channel,
                            };
                        }

                        return c;
                    }),
                };
            }),
        }));
    },

    removeGuildChannel: (guildId, channelId) => {
        set((state) => ({
            guilds: state.guilds.map((g) => {
                if (g.id !== guildId) return g;

                return {
                    ...g,
                    channels: handleChannelDeletion(g.channels, channelId),
                };
            }),
        }));
    },

    addGuildRole: (guildId, role) => {
        set((state) => ({
            guilds: state.guilds.map((g) => {
                if (g.id !== guildId) return g;

                return {
                    ...g,
                    roles: [role, ...g.roles],
                };
            }),
        }));
    },

    updateGuildRole: (guildId, roleId, role) => {
        set((state) => ({
            guilds: state.guilds.map((g) => {
                if (g.id !== guildId) return g;

                const positionChange = role.position !== undefined;
                const oldPosition = g.roles.find((r) => r.id === roleId)?.position || 0;

                return {
                    ...g,
                    roles: g.roles.map((r) => {
                        let newPosition = r.position;

                        if (r.id === roleId) {
                            return {
                                ...r,
                                ...role,
                                permissions: BigInt(role.permissions || r.permissions),
                                position: role.position || r.position,
                            };
                        }

                        if (positionChange) {
                            if (oldPosition < role.position) {
                                if (r.position > oldPosition && r.position <= role.position) {
                                    newPosition = r.position - 1;
                                }
                            } else if (oldPosition > role.position) {
                                if (r.position >= role.position && r.position < oldPosition) {
                                    newPosition = r.position + 1;
                                }
                            }
                        }

                        return {
                            ...r,
                            position: role.position ? newPosition : r.position,
                        };
                    }),
                };
            }),
        }));
    },

    removeGuildRole: (guildId, roleId) => {
        set((state) => ({
            guilds: state.guilds.map((g) => {
                if (g.id !== guildId) return g;
                const role = g.roles.find((r) => r.id === roleId);

                return {
                    ...g,
                    roles: g.roles
                        .filter((r) => r.id !== roleId)
                        .map((r) => {
                            if (r.position > role?.position) {
                                return { ...r, position: r.position - 1 };
                            }

                            return r;
                        }),
                };
            }),
        }));
    },

    updateGuildMember: (guildId, memberId, member) => {
        set((state) => ({
            guilds: state.guilds.map((g) => {
                if (g.id !== guildId) return g;

                return {
                    ...g,
                    members: g.members.map((m) => {
                        if (m.id === memberId) {
                            return {
                                ...m,
                                ...member,
                                permissions: BigInt(member.permissions || m.permissions),
                            };
                        }

                        return m;
                    }),
                };
            }),
        }));
    },

    removeMember: (guildId, memberId) => {
        set((state) => ({
            guilds: state.guilds.map((g) => {
                if (g.id !== guildId) return g;

                return {
                    ...g,
                    members: g.members.filter((m) => m.id !== memberId),
                };
            }),
        }));
    },

    reset: () => {
        set({
            user: null,
            token: null,
            channels: [],
            guilds: [],
            friends: [],
            blocked: [],
            received: [],
            sent: [],
        });
    },
}));
