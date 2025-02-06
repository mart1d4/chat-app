import { persist, createJSONStorage } from "zustand/middleware";
import { create } from "zustand";
import { nanoid } from "nanoid";
import { mostUsedEmojiCodes } from "@/lib/emojis";
export { useData } from "./data";

type DialogOpenType = {
    id: string;
    type: string;
    data?: {
        [key: string]: any;
    };
};

type TriggerDialogType = {
    open: DialogOpenType[];
    triggerDialog: (dialog: Omit<DialogOpenType, "id">) => void;
    removeDialog: (id: string) => void;
};

export const useTriggerDialog = create<TriggerDialogType>((set) => ({
    open: [],

    triggerDialog: (dialog) =>
        set((state) => ({
            open: [
                ...state.open,
                {
                    ...dialog,
                    id: nanoid(),
                },
            ],
        })),

    removeDialog: (id) => set((state) => ({ open: state.open.filter((d) => d.id !== id) })),
}));

// Settings

type TSettings = {
    language: "en" | "fr";
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
    userId: number | null;
    setMention: (user: number | null) => void;
}

export const useMention = create<MentionState>()((set) => ({
    userId: null,
    setMention: (userId) => set(() => ({ userId: userId })),
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

interface EmojiPickerState {
    data: {
        open: boolean;
        container: HTMLElement | null;
        onClick?: (emoji: string) => void;
        placement: "top-end" | "left-start" | "right-start" | "left-end";
        type?: "emoji" | "gif";
    };

    setData: (data: EmojiPickerState["data"]) => void;
}

export const useEmojiPicker = create<EmojiPickerState>((set) => ({
    data: {
        open: false,
        type: "emoji",
        container: null,
        onClick: undefined,
        placement: "top-end",
    },

    setData: (data) => set(() => ({ data })),
}));

interface MostUsedEmojisState {
    emojis: string[];
    addEmoji: (emoji: string) => void;
}

export const useMostUsedEmojis = create(
    persist<MostUsedEmojisState>(
        (set) => ({
            emojis: mostUsedEmojiCodes,

            addEmoji: (emoji) =>
                set((state) => {
                    // Only keep 20 most used emojis
                    // if emoji already in list, move it to the front
                    return {
                        emojis: [emoji, ...state.emojis.filter((e) => e !== emoji)].slice(0, 20),
                    };
                }),
        }),
        {
            name: "mostUsedEmojis",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
