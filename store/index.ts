import { persist, createJSONStorage } from "zustand/middleware";
import type { Channel, Guild, User } from "@/type";
import { create } from "zustand";
export { useData } from "./data";

// Layers

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

        const timeout = setTimeout(
            () => get().reallySetLayers(layer, keepPopout),
            noTimeout ? 0 : 200
        );

        return () => clearTimeout(timeout);
    },

    reallySetLayers: ({ settings, content }, keepPopout) => {
        set((state) => {
            if (settings.type === "POPUP") {
                if (!settings.setNull) {
                    if (popoutTypes.includes(content.type)) {
                        const first = state.layers.POPUP[0];

                        if (
                            first?.content?.type === content.type &&
                            // Get both elements' data-name attribute and compare them
                            first?.settings?.element?.getAttribute("data-name") ===
                                settings.element?.getAttribute("data-name")
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
                                POPUP: [{ settings, content }],
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
                            POPUP: [...newLayers, { settings, content }],
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

            if (settings.type !== "MENU") {
                return {
                    layers: {
                        ...state.layers,
                        [settings.type]: settings.setNull ? null : { settings, content },
                        MENU: null,
                    },
                };
            }

            if (
                settings.type !== "MENU" &&
                state.layers.MENU?.settings?.element?.getAttribute("data-name") ===
                    settings.element?.getAttribute("data-name")
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
                    [settings.type]: settings.setNull ? null : { settings, content },
                },
            };
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

interface MessagesState {
    drafts: {
        channelId: number;
        content: string;
    }[];
    edits: {
        messageId: number;
        content?: string;
    }[];
    replies: {
        channelId: number;
        messageId: number | null;
        username?: string;
    }[];

    setDraft: (channelId: number, content: string | null) => void;
    setEdit: (messageId: number, content: string | null) => void;
    setReply: (channelId: number, messageId: number | null, username?: string) => void;
}

export const useMessages = create(
    persist<MessagesState>(
        (set) => ({
            drafts: [],
            edits: [],
            replies: [],

            setDraft: (channelId, content) =>
                set((state) => {
                    if (content === null) {
                        return {
                            drafts: state.drafts.filter((d) => d.channelId !== channelId),
                        };
                    }

                    if (state.drafts.find((d) => d.channelId === channelId)) {
                        return {
                            drafts: state.drafts.map((d) => {
                                if (d.channelId === channelId) {
                                    return { channelId, content };
                                }

                                return d;
                            }),
                        };
                    } else {
                        return {
                            drafts: [...state.drafts, { channelId, content }],
                        };
                    }
                }),

            setEdit: (messageId, content) =>
                set((state) => {
                    if (content === null) {
                        return {
                            edits: state.edits.filter((e) => e.messageId !== messageId),
                        };
                    }

                    if (state.edits.find((e) => e.messageId === messageId)) {
                        return {
                            edits: state.edits.map((e) => {
                                if (e.messageId === messageId) {
                                    return { messageId, content };
                                }

                                return e;
                            }),
                        };
                    } else {
                        return {
                            edits: [...state.edits, { messageId, content }],
                        };
                    }
                }),

            setReply: (channelId, messageId, username) =>
                set((state) => {
                    if (messageId === null) {
                        return {
                            replies: state.replies.filter((r) => r.channelId !== channelId),
                        };
                    }

                    if (state.replies.find((r) => r.messageId === messageId)) {
                        return {
                            replies: state.replies.map((r) => {
                                if (r.messageId === messageId) {
                                    return { channelId, messageId, username };
                                }

                                return r;
                            }),
                        };
                    } else {
                        return {
                            replies: [...state.replies, { channelId, messageId, username }],
                        };
                    }
                }),
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

interface WindowSettingsState {
    widthThresholds: {
        [key: number]: boolean;
    };
    setWidthThreshold: (key: number, val: boolean) => void;
    shiftKeyDown: boolean;
    setShiftKeyDown: (val: boolean) => void;
}

export const useWindowSettings = create<WindowSettingsState>()((set) => ({
    widthThresholds: {
        1200: false,
        767: false,
        562: false,
    },
    shiftKeyDown: false,

    setWidthThreshold: (key, val) =>
        set((state) => ({
            widthThresholds: {
                ...state.widthThresholds,
                [key]: val,
            },
        })),
    setShiftKeyDown: (val) => set(() => ({ shiftKeyDown: val })),
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
    collapsed: number[];
    setCollapsed: (id: number) => void;
}

export const useCollapsedCategories = create(
    persist<CollapsedCategoriesState>(
        (set) => ({
            collapsed: [],
            setCollapsed: (id) => {
                set((state) => {
                    if (state.collapsed.includes(id)) {
                        return {
                            collapsed: state.collapsed.filter((c) => c !== id),
                        };
                    } else {
                        return {
                            collapsed: [...state.collapsed, id],
                        };
                    }
                });
            },
        }),
        {
            name: "collapsedCategories",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
