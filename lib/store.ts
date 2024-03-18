import { ChannelTable, GuildTable, UserTable } from "./db/types";
import { persist, createJSONStorage } from "zustand/middleware";
import { getFullChannel } from "./strings";
import { create } from "zustand";

type User = Partial<UserTable> & Pick<UserTable, "id" | "username" | "displayName">;
type Channel = Channel & Pick<ChannelTable, "id" | "type" | "name">;
type Guild = Guild & Pick<GuildTable, "id" | "name">;

// Tooltip

type Tooltip = null | {
    text: string;
    element: Partial<HTMLElement> | null;
    position?: "TOP" | "BOTTOM" | "LEFT" | "RIGHT";
    gap?: number;
    big?: boolean;
    color?: string;
    delay?: number;
    arrow?: boolean;
    wide?: boolean;
};

interface TooltipState {
    tooltip: Tooltip;
    setTooltip: (tooltip: Tooltip) => void;
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
    message?: Message;
};

type TUserCard = null | {
    user: Partial<User>;
};

type TUserProfile = null | {
    user: Partial<User>;
    focusNote?: boolean;
};

export type TLayer = {
    settings: {
        type: "MENU" | "POPUP" | "USER_CARD" | "USER_PROFILE";
        setNull?: boolean;
        element?: any | null;
        event?: React.MouseEvent | React.KeyboardEvent;
        firstSide?: "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "CENTER";
        secondSide?: "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "CENTER";
        gap?: number;
        closing?: boolean;
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
    setLayers: (layer: TLayer, keepPopout?: boolean) => void;
    reallySetLayers: (layer: TLayer, keepPopout?: boolean) => void;
}

const popoutTypes = ["PINNED_MESSAGES", "CREATE_DM"];

export const useLayers = create<LayersState>()((set, get) => ({
    layers: {
        POPUP: [],
        MENU: null,
        USER_CARD: null,
        USER_PROFILE: null,
    },

    // Set Layers adds the closing property to the layer before setting it to null with reallySetLayers
    setLayers: (layer, keepPopout) => {
        let last: TLayer | null;

        set((state) => {
            if (layer.settings.type !== "MENU" && layer.settings.setNull) {
                if (layer.settings.type === "POPUP") {
                    const layers = state.layers.POPUP;
                    last = layers[layers.length - 1];

                    return {
                        layers: {
                            ...state.layers,
                            POPUP: [
                                ...layers.slice(0, layers.length - 1),
                                {
                                    ...last,
                                    settings: {
                                        ...last.settings,
                                        closing: true,
                                    },
                                },
                            ],
                        },
                    };
                }

                const current = state.layers[layer.settings.type];

                return {
                    layers: {
                        ...state.layers,
                        [layer.settings.type]: {
                            ...current,
                            settings: {
                                ...current?.settings,
                                closing: true,
                            },
                        },
                    },
                };
            } else {
                return state;
            }
        });

        const noTimeout =
            layer.settings.type === "MENU" ||
            layer.settings.type === "USER_CARD" ||
            !layer.settings.setNull ||
            ["PINNED_MESSAGES", "CREATE_DM"].includes(last?.content?.type || "");

        setTimeout(
            () => {
                get().reallySetLayers(layer, keepPopout);
            },
            noTimeout ? 0 : 200
        );
    },

    reallySetLayers: (layer, keepPopout) => {
        set((state) => {
            // Set tooltip to null if not setNull
            if (!layer.settings.setNull) {
                const setTooltip = useTooltip.getState().setTooltip;
                setTooltip(null);
            }

            if (layer.settings.type === "POPUP") {
                if (!layer.settings.setNull) {
                    if (popoutTypes.includes(layer.content.type)) {
                        if (
                            state.layers.POPUP[0]?.content?.type === layer.content.type &&
                            state.layers.POPUP[0]?.settings?.element === layer.settings.element
                        ) {
                            return {
                                layers: {
                                    ...state.layers,
                                    POPUP: [],
                                    MENU: null,
                                },
                            };
                        }

                        return {
                            layers: {
                                ...state.layers,
                                POPUP: [layer],
                                MENU: null,
                            },
                        };
                    }

                    let newLayers = state.layers.POPUP;
                    if (!keepPopout) {
                        newLayers = newLayers.filter((l) => !popoutTypes.includes(l.content.type));
                    }

                    return {
                        layers: {
                            ...state.layers,
                            POPUP: [...newLayers, layer],
                            MENU: null,
                        },
                    };
                } else {
                    const layers = state.layers.POPUP;

                    return {
                        layers: {
                            ...state.layers,
                            POPUP: layers.slice(0, layers.length - 1),
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

            if (
                layer.settings.type !== "MENU" &&
                state.layers.MENU?.settings?.element === layer.settings.element
            ) {
                return {
                    layers: {
                        ...state.layers,
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
    user: User | null;

    channels: Channel[];
    guilds: Guild[];
    friends: User[];
    blocked: User[];
    received: User[];
    sent: User[];

    setToken: (token: string) => void;
    setUser: (user: User) => void;

    setChannels: (channels: Channel[]) => void;
    setGuilds: (guilds: Guild[]) => void;
    setFriends: (friends: User[]) => void;
    setBlocked: (blocked: User[]) => void;
    setReceived: (received: User[]) => void;
    setSent: (sent: User[]) => void;

    modifyUser: (user: User) => void;

    addUser: (user: User, type: string) => void;
    removeUser: (id: number, type: string) => void;

    addChannel: (channel: Partial<Channel>) => void;
    updateChannel: (channel: Partial<Channel>) => void;
    removeChannel: (channelId: number) => void;
    moveChannelUp: (channelId: number) => void;

    addGuild: (guild: Partial<Guild>) => void;
    updateGuild: (guild: Partial<Guild>) => void;
    removeGuild: (guildId: number) => void;
    moveGuildUp: (guildId: number) => void;

    reset: () => void;
}

export const useData = create<DataState>()((set) => ({
    token: null,
    user: null,

    channels: [],
    guilds: [],
    friends: [],
    blocked: [],
    received: [],
    sent: [],

    setToken: (token) => set(() => ({ token })),
    setUser: (user) => set(() => ({ user })),

    setChannels: (channels) => {
        set((state) => ({ channels: channels.map((c) => getFullChannel(c, state.user)) }));
    },
    setGuilds: (guilds) => set(() => ({ guilds })),
    setFriends: (friends) => set(() => ({ friends })),
    setBlocked: (blocked) => set(() => ({ blocked })),
    setReceived: (received) => set(() => ({ received })),
    setSent: (sent) => set(() => ({ sent })),

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
            received: state.received.map((r) => {
                if (r.id === user.id) {
                    return {
                        ...r,
                        ...user,
                    };
                }

                return r;
            }),
            sent: state.sent.map((r) => {
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

                    return getFullChannel(newChannel, state.user);
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

    addUser: (user, type) => {
        return set((state) => {
            if (type === "friends") {
                return {
                    friends: [user, ...state.friends],
                    received: state.received.filter((r) => r.id !== user.id),
                    sent: state.sent.filter((r) => r.id !== user.id),
                };
            } else if (type === "blocked") {
                return {
                    blocked: [user, ...state.blocked],
                    friends: state.friends.filter((f) => f.id !== user.id),
                    received: state.received.filter((r) => r.id !== user.id),
                    sent: state.sent.filter((r) => r.id !== user.id),
                };
            } else if (type === "received") {
                return {
                    received: [user, ...state.received],
                };
            } else if (type === "sent") {
                return {
                    sent: [user, ...state.sent],
                };
            } else {
                return state;
            }
        });
    },

    removeUser: (id, type) => {
        return set((state) => {
            if (type === "friends") {
                return {
                    friends: state.friends.filter((f) => f.id !== id),
                };
            } else if (type === "blocked") {
                return {
                    blocked: state.blocked.filter((b) => b.id !== id),
                };
            } else if (type === "received") {
                return {
                    received: state.received.filter((r) => r.id !== id),
                };
            } else if (type === "sent") {
                return {
                    sent: state.sent.filter((r) => r.id !== id),
                };
            } else {
                return state;
            }
        });
    },

    addChannel: (channel) => {
        return set((state) => ({
            channels: [getFullChannel(channel, state.user), ...state.channels],
        }));
    },
    updateChannel: (channel) => {
        return set((state) => ({
            channels: state.channels.map((c) => {
                if (c.id === channel.id) {
                    return {
                        ...c,
                        ...channel,
                    };
                }

                return c;
            }),
        }));
    },

    removeChannel: (channelId) => {
        set((state) => ({ channels: state.channels.filter((c) => c.id !== channelId) }));
    },
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

    addGuild: (guild) => set((state) => ({ guilds: [guild, ...state.guilds] })),
    updateGuild: (guild) => {
        set((state) => ({
            guilds: state.guilds.map((g) => {
                if (g.id === guild.id) {
                    return {
                        ...g,
                        ...guild,
                    };
                }

                return g;
            }),
        }));
    },
    removeGuild: (guildId) => {
        set((state) => ({ guilds: state.guilds.filter((g) => g.id !== guildId) }));
    },
    moveGuildUp: (guildId) => {
        set((state) => {
            const guild = state.guilds.find((g) => g.id === guildId);

            if (guild) {
                const newGuilds = [guild, ...state.guilds.filter((g) => g.id !== guildId)];
                return { guilds: newGuilds };
            }

            return state;
        });
    },

    reset: () => {
        set({
            token: null,
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

export const useSettings = create(
    persist<SettingsState>(
        (set) => ({
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
        }),
        {
            name: "settings",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Notifications

type TPing = {
    channelId: Channel["id"];
    amount: number;
};

interface NotificationsState {
    messages: Channel["id"][];
    pings: TPing[];

    addMessage: (channelId: Channel["id"]) => void;
    removeMessage: (channelId: Channel["id"]) => void;

    addPing: (channelId: Channel["id"]) => void;
    removePing: (channelId: Channel["id"]) => void;
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

    removeMessage: (channelId) =>
        set((state) => ({ messages: state.messages.filter((id) => id !== channelId) })),

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
        channelId: Channel["id"];
        content: string;
        attachments: TAttachment[];
    }[];
    edits: {
        channelId: Channel["id"];
        messageId: Message["id"] | null;
        initialContent?: string;
        content?: string;
    }[];
    replies: {
        channelId: Channel["id"];
        messageId: Message["id"] | null;
        username: string;
    }[];

    setContent: (channelId: Channel["id"], content: string) => void;
    setAttachments: (channelId: Channel["id"], attachments: TAttachment[]) => void;
    removeDraft: (channelId: Channel["id"]) => void;

    setEdit: (
        channelId: Channel["id"],
        messageId: Message["id"] | null,
        initialContent?: string,
        content?: string
    ) => void;
    setReply: (channelId: Channel["id"], messageId: Message["id"] | null, username: string) => void;
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
    userId: Partial<User>["id"] | null;
    setMention: (user: Partial<User> | null) => void;
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

type SettingsObject = null | {
    type: "USER" | "GUILD" | "CHANNEL";
    tab?: string;
    guild?: Guild;
    channel?: Channel;
};

interface ShowSettingsState {
    showSettings: SettingsObject;
    setShowSettings: (val: SettingsObject) => void;
}

export const useShowSettings = create<ShowSettingsState>()((set) => ({
    showSettings: null,
    setShowSettings: (val) => set(() => ({ showSettings: val })),
}));

interface ShowChannelsState {
    showChannels: boolean;
    setShowChannels: (val: boolean) => void;
}

export const useShowChannels = create(
    persist<ShowChannelsState>(
        (set) => ({
            showChannels: true,
            setShowChannels: (val) => set(() => ({ showChannels: val })),
        }),
        {
            name: "showChannels",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

interface WidthThresholdsState {
    widthThresholds: {
        [key: number]: boolean;
    };
    setWidthThreshold: (key: number, val: boolean) => void;
}

export const useWidthThresholds = create<WidthThresholdsState>()((set) => ({
    widthThresholds: {
        1200: false,
        767: false,
        562: false,
    },
    setWidthThreshold: (key, val) =>
        set((state) => ({
            widthThresholds: {
                ...state.widthThresholds,
                [key]: val,
            },
        })),
}));

interface PusherState {
    pusher: any;
    setPusher: (pusher: any) => void;
}

export const usePusher = create<PusherState>((set) => ({
    pusher: null,
    setPusher: (pusher) => set(() => ({ pusher })),
}));

interface CollapsedCategoriesState {
    collapsedCategories: {
        [key: string]: boolean;
    };
    setCollapsedCategory: (key: string, val: boolean) => void;
}

export const useCollapsedCategories = create(
    persist<CollapsedCategoriesState>(
        (set) => ({
            collapsedCategories: {},
            setCollapsedCategory: (key, val) => {
                // If val is false, remove the key from the object
                if (!val) {
                    return set((state) => {
                        const newState = { ...state.collapsedCategories };
                        delete newState[key];
                        return { collapsedCategories: newState };
                    });
                }

                return set((state) => ({
                    collapsedCategories: {
                        ...state.collapsedCategories,
                        [key]: val,
                    },
                }));
            },
        }),
        {
            name: "collapsedCategories",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
