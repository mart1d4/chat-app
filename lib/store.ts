import { persist, createJSONStorage } from "zustand/middleware";
import { getChannelIcon, getChannelName } from "./strings";
import { create } from "zustand";

// Tooltip

type TTooltip = null | {
    text: string;
    element: HTMLElement;
    position?: "TOP" | "BOTTOM" | "LEFT" | "RIGHT";
    gap?: number;
    big?: boolean;
    color?: string;
    delay?: number;
    arrow?: boolean;
    wide?: boolean;
};

interface TooltipState {
    tooltip: TTooltip;
    setTooltip: (tooltip: TTooltip) => void;
}

export const useTooltip = create<TooltipState>()((set) => ({
    tooltip: null,
    setTooltip: (tooltip) => set(() => ({ tooltip })),
}));

// Layers

enum EPopupType {
    DELETE_MESSAGE = "DELETE_MESSAGE",
    PIN_MESSAGE = "PIN_MESSAGE",
    UNPIN_MESSAGE = "UNPIN_MESSAGE",
    UPDATE_USERNAME = "UPDATE_USERNAME",
    UPDATE_PASSWORD = "UPDATE_PASSWORD",
}

type TMenu = null | any;

type TPopup = null | {
    type: EPopupType;
    channelId?: string;
    message?: TMessage;
};

type TUserCard = null | {
    user: TCleanUser;
};

type TUserProfile = null | {
    user: TCleanUser;
    focusNote?: boolean;
};

type TLayer = {
    settings: {
        type: "MENU" | "POPUP" | "USER_CARD" | "USER_PROFILE";
        setNull?: boolean;
        element?: any | null;
        event?: React.MouseEvent | React.KeyboardEvent;
        firstSide?: "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "CENTER";
        secondSide?: "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "CENTER";
        gap?: number;
    };
    content?: TMenu | TPopup | TUserCard | TUserProfile;
};

interface LayersState {
    layers: {
        ["MENU"]: TLayer | null;
        ["POPUP"]: TLayer[];
        ["USER_CARD"]: TLayer | null;
        ["USER_PROFILE"]: TLayer | null;
    };
    setLayers: (layer: TLayer) => void;
}

export const useLayers = create<LayersState>()((set) => ({
    layers: {
        MENU: null,
        POPUP: [],
        USER_CARD: null,
        USER_PROFILE: null,
    },
    setLayers: (layer) => {
        set((state) => {
            if (!layer.settings.setNull) {
                const setTooltip = useTooltip.getState().setTooltip;
                setTooltip(null);
            }

            if (layer.settings.type === "POPUP") {
                // If add, add to array, otherwise remove last
                if (!layer.settings.setNull) {
                    // if type already exists in array, don't add it
                    if (
                        (state.layers[layer.settings.type] as TLayer[]).find(
                            (l) => l.content.type === layer.content.type
                        )
                    ) {
                        return state;
                    }

                    return {
                        layers: {
                            ...state.layers,
                            [layer.settings.type]: [...(state.layers[layer.settings.type] as TLayer[]), layer],
                            MENU: null,
                        },
                    };
                } else {
                    const layers = state.layers[layer.settings.type] as TLayer[];

                    return {
                        layers: {
                            ...state.layers,
                            [layer.settings.type]: layers.slice(0, layers.length - 1),
                            MENU: null,
                        },
                    };
                }
            }

            if (layer.settings.type !== "MENU") {
                return {
                    layers: {
                        ...state.layers,
                        [layer.settings.type]: layer.settings.setNull ? null : layer,
                        MENU: null,
                    },
                };
            }

            return {
                layers: {
                    ...state.layers,
                    [layer.settings.type]: layer.settings.setNull ? null : layer,
                },
            };
        });
    },
}));

// Data

interface DataState {
    token: string | null;
    user: TCleanUser | null;

    channels: TChannel[];
    guilds: TGuild[];
    friends: TCleanUser[];
    blocked: TCleanUser[];
    blockedBy: TCleanUser[];
    requestsReceived: TCleanUser[];
    requestsSent: TCleanUser[];

    setToken: (token: string) => void;
    setUser: (user: TCleanUser) => void;

    setChannels: (channels: TChannel[]) => void;
    setGuilds: (guilds: TGuild[]) => void;
    setFriends: (friends: TCleanUser[]) => void;
    setBlocked: (blocked: TCleanUser[]) => void;
    setBlockedBy: (blockedBy: TCleanUser[]) => void;
    setRequestsReceived: (requestsReceived: TCleanUser[]) => void;
    setRequestsSent: (requestsSent: TCleanUser[]) => void;
    modifyUser: (user: TCleanUser) => void;

    addFriend: (friend: TCleanUser) => void;
    removeFriend: (friend: TCleanUser) => void;
    addBlocked: (blocked: TCleanUser) => void;
    addBlockedBy: (blocked: TCleanUser) => void;
    removeBlocked: (blocked: TCleanUser) => void;
    removeBlockedBy: (blocked: TCleanUser) => void;
    addRequestReceived: (request: TCleanUser) => void;
    addRequestSent: (request: TCleanUser) => void;
    removeRequests: (request: TCleanUser) => void;

    addChannel: (channel: TChannel) => void;
    updateChannel: (channel: TChannel) => void;
    removeChannel: (channel: TChannel) => void;
    moveChannelUp: (channelId: TChannel["id"]) => void;
    addGuild: (guild: TGuild) => void;
    updateGuild: (guild: TGuild) => void;
    removeGuild: (guild: TGuild) => void;

    removeData: () => void;
}

export const useData = create<DataState>()((set) => ({
    token: null,
    user: null,

    channels: [],
    guilds: [],
    friends: [],
    blocked: [],
    blockedBy: [],
    requestsReceived: [],
    requestsSent: [],

    setToken: (token) => set(() => ({ token })),
    setUser: (user) => set(() => ({ user })),

    setChannels: (channels) => set(() => ({ channels })),
    setGuilds: (guilds) => set(() => ({ guilds })),
    setFriends: (friends) => set(() => ({ friends })),
    setBlocked: (blocked) => set(() => ({ blocked })),
    setBlockedBy: (blockedBy) => set(() => ({ blockedBy })),
    setRequestsReceived: (requestsReceived) => set(() => ({ requestsReceived })),
    setRequestsSent: (requestsSent) => set(() => ({ requestsSent })),
    modifyUser: (user) =>
        set((state) => ({
            friends: state.friends.map((f) => {
                if (f.id === user.id) {
                    return {
                        ...f,
                        ...user,
                    };
                }

                return f;
            }),
            blocked: state.blocked.map((b) => {
                if (b.id === user.id) {
                    return {
                        ...b,
                        ...user,
                    };
                }

                return b;
            }),
            blockedBy: state.blockedBy.map((b) => {
                if (b.id === user.id) {
                    return {
                        ...b,
                        ...user,
                    };
                }

                return b;
            }),
            requestsReceived: state.requestsReceived.map((r) => {
                if (r.id === user.id) {
                    return {
                        ...r,
                        ...user,
                    };
                }

                return r;
            }),
            requestsSent: state.requestsSent.map((r) => {
                if (r.id === user.id) {
                    return {
                        ...r,
                        ...user,
                    };
                }

                return r;
            }),
            channels: state.channels.map((c) => {
                if (c.recipientIds.includes(user.id)) {
                    const newChannel = {
                        ...c,
                        recipients: c.recipients.map((r) => {
                            if (r.id === user.id) {
                                return {
                                    ...r,
                                    ...user,
                                };
                            }

                            return r;
                        }),
                    };

                    return {
                        ...newChannel,
                        name: getChannelName(newChannel, state.user?.id as string),
                        icon: getChannelIcon(newChannel, state.user?.id as string),
                    };
                }

                return c;
            }),
            guilds: state.guilds.map((g) => {
                if (g.rawMemberIds.includes(user.id)) {
                    return {
                        ...g,
                        members: g.members.map((m) => {
                            if (m.id === user.id) {
                                return {
                                    ...m,
                                    username: user.username,
                                };
                            }

                            return m;
                        }),
                        rawMembers: g.rawMembers.map((m) => {
                            if (m.id === user.id) {
                                return {
                                    ...m,
                                    ...user,
                                };
                            }

                            return m;
                        }),
                    };
                }

                return g;
            }),
        })),

    addFriend: (friend) => set((state) => ({ friends: [...state.friends, friend] })),
    removeFriend: (friend) => set((state) => ({ friends: state.friends.filter((f) => f.id !== friend.id) })),
    addBlocked: (blocked) =>
        set((state) => ({
            blocked: [...state.blocked, blocked],
            friends: state.friends.filter((f) => f.id !== blocked.id),
            requestsReceived: state.requestsReceived.filter((r) => r.id !== blocked.id),
            requestsSent: state.requestsSent.filter((r) => r.id !== blocked.id),
        })),
    addBlockedBy: (blocked) =>
        set((state) => ({
            blockedBy: [...state.blockedBy, blocked],
            friends: state.friends.filter((f) => f.id !== blocked.id),
            requestsReceived: state.requestsReceived.filter((r) => r.id !== blocked.id),
            requestsSent: state.requestsSent.filter((r) => r.id !== blocked.id),
        })),
    removeBlocked: (blocked) => set((state) => ({ blocked: state.blocked.filter((b) => b.id !== blocked.id) })),
    removeBlockedBy: (blocked) => set((state) => ({ blockedBy: state.blockedBy.filter((b) => b.id !== blocked.id) })),
    addRequestReceived: (request) => set((state) => ({ requestsReceived: [...state.requestsReceived, request] })),
    addRequestSent: (request) => set((state) => ({ requestsSent: [...state.requestsSent, request] })),
    removeRequests: (request) =>
        set((state) => ({
            requestsReceived: state.requestsReceived.filter((r) => r.id !== request.id),
            requestsSent: state.requestsSent.filter((r) => r.id !== request.id),
        })),

    addChannel: (channel) =>
        set((state) => {
            if (!state.user) return state;
            else {
                return {
                    channels: [
                        {
                            ...channel,
                            name: getChannelName(channel, state?.user.id),
                            icon: getChannelIcon(channel, state?.user.id),
                        },
                        ...state.channels,
                    ],
                };
            }
        }),
    updateChannel: (channel) =>
        set((state) => {
            if (state.channels.find((c) => c.id === channel.id)) {
                return {
                    channels: state.channels.map((c) => {
                        if (c.id === channel.id) {
                            return {
                                ...c,
                                ...channel,
                            };
                        }

                        return c;
                    }),
                };
            } else {
                return {
                    channels: [channel, ...state.channels],
                };
            }
        }),

    removeChannel: (channel) => set((state) => ({ channels: state.channels.filter((c) => c.id !== channel.id) })),
    moveChannelUp: (channelId) => {
        set((state) => {
            const channel = state.channels.find((c) => c.id === channelId);

            if (channel) {
                const newChannels = [channel, ...state.channels.filter((c) => c.id !== channelId)];
                return { channels: newChannels };
            }

            return state;
        });
    },
    addGuild: (guild) => set((state) => ({ guilds: [...state.guilds, guild] })),
    updateGuild: (guild) => set((state) => ({ guilds: state.guilds.map((g) => (g.id === guild.id ? guild : g)) })),
    removeGuild: (guild) => set((state) => ({ guilds: state.guilds.filter((g) => g.id !== guild.id) })),

    removeData: () =>
        set(() => ({
            token: null,
            user: null,
            channels: [],
            guilds: [],
            friends: [],
            blocked: [],
            requestsReceived: [],
            requestsSent: [],
        })),
}));

// Settings

type TSettings = {
    language: "en" | "pl";
    microphone: boolean;
    sound: boolean;
    camera: boolean;
    appearance: "system" | "light" | "dark";
    font: "default" | "monospace";
    theme: "default" | "red" | "green" | "blue" | "purple";
    friendTab: "online" | "all" | "pending" | "blocked" | "add";
    sendButton: boolean;
    spellcheck: boolean;
    showUsers: boolean;
};

interface SettingsState {
    settings: TSettings;
    setSettings: (key: keyof TSettings, val: any) => void;
}

export const useSettings = create<SettingsState>()((set) => ({
    settings: {
        language: "en",
        microphone: false,
        sound: true,
        camera: true,
        appearance: "system",
        font: "default",
        theme: "default",
        friendTab: "online",
        sendButton: true,
        spellcheck: true,
        showUsers: true,
    },

    setSettings: (key, val) =>
        set((state) => {
            return {
                settings: {
                    ...state.settings,
                    [key]: val,
                },
            };
        }),
}));

// Notifications

type TPing = {
    channelId: TChannel["id"];
    amount: number;
};

interface NotificationsState {
    messages: TChannel["id"][];
    pings: TPing[];

    addMessage: (channelId: TChannel["id"]) => void;
    removeMessage: (channelId: TChannel["id"]) => void;

    addPing: (channelId: TChannel["id"]) => void;
    removePing: (channelId: TChannel["id"]) => void;
}

export const useNotifications = create<NotificationsState>()((set) => ({
    messages: [],
    pings: [],

    addMessage: (channelId) =>
        set((state) => {
            if (state.messages.includes(channelId)) return state;

            return {
                messages: [...state.messages, channelId],
            };
        }),

    removeMessage: (channelId) => set((state) => ({ messages: state.messages.filter((id) => id !== channelId) })),

    addPing: (channelId) =>
        set((state) => {
            // If ping already exists, increase amount
            if (state.pings.find((p) => p.channelId === channelId)) {
                return {
                    pings: state.pings.map((p) => {
                        if (p.channelId === channelId) {
                            return {
                                ...p,
                                amount: p.amount + 1,
                            };
                        }

                        return p;
                    }),
                };
            } else {
                return {
                    pings: [...state.pings, { channelId, amount: 1 }],
                };
            }
        }),

    removePing: (channelId) =>
        set((state) => {
            if (!state.pings.find((p) => p.channelId === channelId)) return state;

            return {
                pings: state.pings.filter((p) => p.channelId !== channelId),
            };
        }),
}));

// Messages

// This state just stores the content of the textarea of specific channels if the user started typing something but didn't send it yet
// It also needs to store potential attachments such as images

interface MessagesState {
    drafts: {
        channelId: TChannel["id"];
        content: string;
        attachments: TAttachment[];
    }[];
    edits: {
        channelId: TChannel["id"];
        messageId: TMessage["id"] | null;
        initialContent?: string;
        content?: string;
    }[];
    replies: {
        channelId: TChannel["id"];
        messageId: TMessage["id"] | null;
        username: string;
    }[];

    setContent: (channelId: TChannel["id"], content: string) => void;
    setAttachments: (channelId: TChannel["id"], attachments: TAttachment[]) => void;
    removeDraft: (channelId: TChannel["id"]) => void;

    setEdit: (
        channelId: TChannel["id"],
        messageId: TMessage["id"] | null,
        initialContent?: string,
        content?: string
    ) => void;
    setReply: (channelId: TChannel["id"], messageId: TMessage["id"] | null, username: string) => void;
}

export const useMessages = create(
    persist<MessagesState>(
        (set) => ({
            drafts: [],
            edits: [],
            replies: [],

            setContent: (channelId, content) => {
                set((state) => {
                    if (channelId.length !== 24) return state;
                    if (state.drafts.find((d) => d.channelId === channelId)) {
                        return {
                            drafts: state.drafts.map((d) => {
                                if (d.channelId === channelId) {
                                    return {
                                        ...d,
                                        content,
                                    };
                                }

                                return d;
                            }),
                        };
                    } else {
                        return {
                            drafts: [...state.drafts, { channelId, content, attachments: [] }],
                        };
                    }
                });
            },

            setAttachments: (channelId, attachments) => {
                set((state) => {
                    if (state.drafts.find((d) => d.channelId === channelId)) {
                        return {
                            drafts: state.drafts.map((d) => {
                                if (d.channelId === channelId) {
                                    return {
                                        ...d,
                                        attachments,
                                    };
                                }

                                return d;
                            }),
                        };
                    } else {
                        return {
                            drafts: [...state.drafts, { channelId, content: "", attachments }],
                        };
                    }
                });
            },

            removeDraft: (channelId) => {
                set((state) => ({ drafts: state.drafts.filter((d) => d.channelId !== channelId) }));
            },

            setEdit: (channelId, messageId, initialContent, content) => {
                set((state) => {
                    if (state.edits.find((e) => e.channelId === channelId)) {
                        return {
                            edits: state.edits.map((e) => {
                                if (e.channelId === channelId) {
                                    if (messageId === null) {
                                        return {
                                            ...e,
                                            messageId,
                                            initialContent: "",
                                            content: "",
                                        };
                                    } else if (typeof initialContent === "string") {
                                        return {
                                            ...e,
                                            messageId,
                                            initialContent,
                                            content: initialContent,
                                        };
                                    } else if (typeof content === "string") {
                                        return {
                                            ...e,
                                            messageId,
                                            content,
                                        };
                                    }
                                }

                                return e;
                            }),
                        };
                    } else {
                        return {
                            edits: [
                                ...state.edits,
                                {
                                    channelId,
                                    messageId,
                                    initialContent: initialContent || "",
                                    content: initialContent || "",
                                },
                            ],
                        };
                    }
                });
            },

            setReply: (channelId, messageId, username) => {
                set((state) => {
                    if (state.replies.find((r) => r.channelId === channelId)) {
                        return {
                            replies: state.replies.map((r) => {
                                if (r.channelId === channelId) {
                                    return {
                                        ...r,
                                        messageId,
                                    };
                                }

                                return r;
                            }),
                        };
                    } else {
                        return {
                            replies: [...state.replies, { channelId, messageId, username }],
                        };
                    }
                });
            },
        }),
        {
            name: "messages",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Text Area Mention

interface MentionState {
    userId: TCleanUser["id"] | null;
    setMention: (user: TCleanUser | null) => void;
}

export const useMention = create<MentionState>()((set) => ({
    userId: null,
    setMention: (user) => set(() => ({ userId: user?.id || null })),
}));

// Urls store

interface UrlsState {
    me: string;
    guilds: {
        guildId: string;
        channelId: string;
    }[];

    setMe: (me: string) => void;
    setGuild: (guildId: string, channelId: string) => void;
}

export const useUrls = create(
    persist<UrlsState>(
        (set) => ({
            me: "",
            guilds: [],

            setMe: (me) => set(() => ({ me })),
            setGuild: (guildId, channelId) => {
                set((state) => {
                    if (state.guilds.find((g) => g.guildId === guildId)) {
                        return {
                            guilds: state.guilds.map((g) => {
                                if (g.guildId === guildId) {
                                    return {
                                        ...g,
                                        channelId,
                                    };
                                }

                                return g;
                            }),
                        };
                    } else {
                        return {
                            guilds: [...state.guilds, { guildId, channelId }],
                        };
                    }
                });
            },
        }),
        {
            name: "urls",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Settings popup store

interface ShowSettingsState {
    showSettings: string | null;
    setShowSettings: (val: string | null) => void;
}

export const useShowSettings = create<ShowSettingsState>()((set) => ({
    showSettings: null,
    setShowSettings: (val) => set(() => ({ showSettings: val })),
}));
