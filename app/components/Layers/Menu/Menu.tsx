"use client";

import { useEffect, useState, ReactElement, useMemo, useCallback, useRef } from "react";
import { useData, useLayers, useMention, useSettings } from "@/lib/store";
import { shouldDisplayInlined } from "@/lib/message";
import useFetchHelper from "@/hooks/useFetchHelper";
import styles from "./Menu.module.css";
import { Icon } from "@components";

const colors = ["#22A559", "", "#F0B232", "#F23F43", "#80848E"];
const masks = ["", "", "status-mask-idle", "status-mask-dnd", "status-mask-offline"];

type UserProps = {
    isSelf: boolean;
    isFriend?: boolean;
    isBlocked?: boolean;
    sentRequest?: boolean;
    receivedRequest?: boolean;
};

type ItemType = {
    name: string | null;
    tip?: string;
    tipIcon?: string;
    icon?: string;
    iconSize?: number;
    leftIcon?: string;
    textTip?: string;
    func?: () => void;
    funcShift?: () => void;
    danger?: boolean;
    disabled?: boolean;
    checked?: boolean;
    circle?: boolean;
    items?: ItemType[];
};

enum EMenuType {
    USER = "USER",
    USER_SMALL = "USER_SMALL",
    USER_GROUP = "USER_GROUP",
    CHANNEL = "CHANNEL",
    MESSAGE = "MESSAGE",
    INPUT = "INPUT",
    IMAGE = "IMAGE",
    GUILD = "GUILD",
    GUILD_ICON = "GUILD_ICON",
    GUILD_CHANNEL = "GUILD_CHANNEL",
    GUILD_CHANNEL_LIST = "GUILD_CHANNEL_LIST",
    FILE_INPUT = "FILE_INPUT",
    STATUS = "STATUS",
}

export const Menu = ({ content }: { content: any }): ReactElement => {
    const [hover, setHover] = useState<string>("");
    const [items, setItems] = useState<ItemType[]>([]);
    const [shift, setShift] = useState<boolean>(false);
    const [filteredItems, setFilteredItems] = useState<ItemType[]>([]);
    const [userProps, setUserProps] = useState<UserProps | null>(null);

    const requestsReceived = useData((state) => state.requestsReceived);
    const currentUser = useData((state) => state.user) as TCleanUser;
    const setSettings = useSettings((state) => state.setSettings);
    const requestsSent = useData((state) => state.requestsSent);
    const setMention = useMention((state) => state.setMention);
    const settings = useSettings((state) => state.settings);
    const setLayers = useLayers((state) => state.setLayers);
    const blockedUsers = useData((state) => state.blocked);
    const friends = useData((state) => state.friends);
    const layers = useLayers((state) => state.layers);
    const guilds = useData((state) => state.guilds);
    const { sendRequest } = useFetchHelper();

    const type: EMenuType = content.type;
    const user: TCleanUser = content.user;
    const message: TMessage = content.message;
    const menuRef = useRef<HTMLDivElement>(null);

    const writeText = async (text: string) => {
        await navigator.clipboard.writeText(text);
    };

    useEffect(() => {
        const handleShift = (e: KeyboardEvent) => {
            if (e.key === "Shift") setShift(true);
        };

        const handleShiftUp = (e: KeyboardEvent) => {
            if (e.key === "Shift") setShift(false);
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setLayers({
                    settings: {
                        type: "MENU",
                        setNull: true,
                    },
                });
            }
        };

        window.addEventListener("keydown", handleShift);
        window.addEventListener("keyup", handleShiftUp);
        window.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("keydown", handleShift);
            window.removeEventListener("keyup", handleShiftUp);
            window.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setFilteredItems(items?.filter((item) => item.name && item.name !== "Divider" && !item.disabled) || []);
    }, [items]);

    useEffect(() => {
        const handlekeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setLayers({
                    settings: {
                        type: "MENU",
                        setNull: true,
                    },
                });
            } else if (e.key === "ArrowDown") {
                if (hover === null) {
                    setHover(filteredItems[0].name as string);
                } else {
                    const index = filteredItems.findIndex((item) => item.name === hover);
                    if (index < filteredItems.length - 1) {
                        setHover(filteredItems[index + 1].name as string);
                    } else {
                        setHover(filteredItems[0].name as string);
                    }
                }
            } else if (e.key === "ArrowUp") {
                if (hover === null) {
                    setHover(filteredItems[filteredItems.length - 1].name as string);
                } else {
                    const index = filteredItems.findIndex((item) => item.name === hover);
                    if (index > 0) {
                        setHover(filteredItems[index - 1].name as string);
                    } else {
                        setHover(filteredItems[filteredItems.length - 1].name as string);
                    }
                }
            } else if (e.key === "Enter") {
                const item = filteredItems.find((item) => item.name === hover);
                if (item) {
                    if (item?.funcShift) item.funcShift();
                    else if (item?.func) item.func();
                    if ("checked" in item) return;
                    setLayers({
                        settings: {
                            type: "MENU",
                            setNull: true,
                        },
                    });
                }
            }
        };

        window.addEventListener("keydown", handlekeyDown);
        return () => window.removeEventListener("keydown", handlekeyDown);
    }, [filteredItems, hover]);

    useEffect(() => {
        if (content?.user) {
            setUserProps({
                isSelf: content.user.id === currentUser.id,
                isFriend: friends.map((f) => f.id).includes(content.user.id),
                isBlocked: blockedUsers.map((f) => f.id).includes(content.user.id),
                sentRequest: requestsSent.map((f) => f.id).includes(content.user.id),
                receivedRequest: requestsReceived.map((f) => f.id).includes(content.user.id),
            });
        } else if (content?.message) {
            setUserProps({ isSelf: content.message.author.id === currentUser.id });
        } else {
            setUserProps(null);
        }
    }, [content, friends, blockedUsers, requestsSent, requestsReceived]);

    const canDeleteMessage = useCallback(() => {
        if (message.authorId === currentUser.id) return true;
        if (content.guildOwnerId) return content.guildOwnerId === currentUser.id;
        return false;
    }, [content, userProps]);

    const muteItems = [
        {
            name: "For 15 Minutes",
            func: () => {},
        },
        {
            name: "For 1 Hour",
            func: () => {},
        },
        {
            name: "For 3 Hours",
            func: () => {},
        },
        {
            name: "For 8 Hours",
            func: () => {},
        },
        {
            name: "For 24 Hours",
            func: () => {},
        },
        {
            name: "Until I turn it back on",
            func: () => {},
        },
    ];

    const notificationItems = [
        {
            name: "Use Server Default",
            checked: true,
            circle: true,
            func: () => {},
        },
        {
            name: "All Messages",
            checked: false,
            circle: true,
            func: () => {},
        },
        {
            name: "Only @mentions",
            checked: false,
            circle: true,
            func: () => {},
        },
        {
            name: "Nothing",
            checked: false,
            circle: true,
            func: () => {},
        },
    ];

    const serverSettingsItems = [
        {
            name: "Cool Server Setting",
            func: () => {},
        },
    ];

    const serverItems = [
        {
            name: "Cool Server",
            func: () => {},
        },
    ];

    const reactionItems = [
        {
            name: "Cool Reaction",
            func: () => {},
        },
    ];

    useEffect(() => {
        if (!type || (user && !userProps)) return;

        if (type === "FILE_INPUT") {
            setItems([
                {
                    name: "Upload a File",
                    tip: "Tip: Double click the ",
                    tipIcon: "attach",
                    leftIcon: "upload",
                    func: () => content?.openInput(),
                },
                {
                    name: "Send Voice Message",
                    leftIcon: "mic",
                    func: () => {},
                },
            ]);
        }

        if (type === "GUILD_CHANNEL_LIST") {
            setItems([
                {
                    name: "Hide Muted Channels",
                    checked: false,
                    func: () => {},
                },
                {
                    name: "Divider",
                },
                {
                    name: "Create Channel",
                    func: () => {
                        setLayers({
                            settings: {
                                type: "POPUP",
                            },
                            content: {
                                type: "GUILD_CHANNEL_CREATE",
                                guild: content.guild.id,
                            },
                        });
                    },
                },
                {
                    name: "Create Category",
                    func: () => {
                        setLayers({
                            settings: {
                                type: "POPUP",
                            },
                            content: {
                                type: "GUILD_CHANNEL_CREATE",
                                guild: content.guild.id,
                                isCategory: true,
                            },
                        });
                    },
                },
                {
                    name: "Invite People",
                    func: () => {
                        setLayers({
                            settings: {
                                type: "POPUP",
                            },
                            content: {
                                type: "GUILD_INVITE",
                                guild: content.guild,
                            },
                        });
                    },
                },
            ]);
        }

        if (type === "GUILD_CHANNEL") {
            if (content.channel.type === 4) {
                setItems([
                    {
                        name: "Mark As Read",
                        disabled: true,
                        func: () => {},
                    },
                    {
                        name: "Divider",
                    },
                    {
                        name: "Collapse Category",
                        checked: true,
                        func: () => {},
                    },
                    {
                        name: "Collapse All Categories",
                        func: () => {},
                    },
                    {
                        name: "Divider",
                    },
                    {
                        name: "Mute Category",
                        items: muteItems,
                        func: () => {},
                    },
                    {
                        name: "Notifications Settings",
                        items: notificationItems,
                        func: () => {},
                    },
                    {
                        name: "Divider",
                    },
                    {
                        name: "Edit Category",
                        func: () => {},
                    },
                    {
                        name: "Delete Category",
                        danger: true,
                        func: () => {
                            setLayers({
                                settings: {
                                    type: "POPUP",
                                },
                                content: {
                                    type: "GUILD_CHANNEL_DELETE",
                                    channel: content.channel,
                                },
                            });
                        },
                    },
                    {
                        name: "Divider",
                    },
                    {
                        name: "Copy Channel ID",
                        icon: "id",
                        func: () => writeText(content.channel.id),
                    },
                ]);
            } else {
                setItems([
                    {
                        name: "Mark As Read",
                        disabled: true,
                        func: () => {},
                    },
                    {
                        name: "Divider",
                    },
                    {
                        name: "Invite People",
                        func: () => {
                            setLayers({
                                settings: {
                                    type: "POPUP",
                                },
                                content: {
                                    type: "GUILD_INVITE",
                                    guild: content.guild,
                                    channel: content.channel,
                                },
                            });
                        },
                    },
                    {
                        name: "Copy Link",
                        func: () => {},
                    },
                    {
                        name: content.channel.type === 3 ? "Divider" : null,
                    },
                    {
                        name: content.channel.type === 3 ? "Open Chat" : null,
                        func: () => {},
                    },
                    {
                        name: content.channel.type === 3 ? "Hide Names" : null,
                        checked: true,
                        func: () => {},
                    },
                    {
                        name: "Divider",
                    },
                    {
                        name: "Mute Channel",
                        items: muteItems,
                        func: () => {},
                    },
                    {
                        name: content.channel.type === 2 ? "Notifications Settings" : null,
                        items: notificationItems,
                        func: () => {},
                    },
                    {
                        name: "Divider",
                    },
                    {
                        name: "Edit Channel",
                        func: () => {},
                    },
                    {
                        name: "Duplicate Channel",
                        func: () => {},
                    },
                    {
                        name: `Create ${content.channel.type === 2 ? "Text" : "Voice"} Channel`,
                        func: () => {
                            const guild = guilds.find((guild: TGuild) => guild.id === content.channel.guildId);
                            const category = guild?.channels.find(
                                (channel: TChannel) => channel.id === content.channel?.parentId
                            );

                            setLayers({
                                settings: {
                                    type: "POPUP",
                                },
                                content: {
                                    type: "GUILD_CHANNEL_CREATE",
                                    guild: content.channel.guildId,
                                    category: category ?? null,
                                },
                            });
                        },
                    },
                    {
                        name: "Delete Channel",
                        danger: true,
                        func: () => {
                            setLayers({
                                settings: {
                                    type: "POPUP",
                                },
                                content: {
                                    type: "GUILD_CHANNEL_DELETE",
                                    channel: content.channel,
                                },
                            });
                        },
                    },
                    {
                        name: "Divider",
                    },
                    {
                        name: "Copy Channel ID",
                        icon: "id",
                        func: () => writeText(content.channel.id),
                    },
                ]);
            }
        }

        if (type === "GUILD_ICON") {
            const textChan = content.guild.channels.find((c: TChannel) => c.type === 2);
            setItems([
                {
                    name: "Mark As Read",
                    disabled: true,
                    func: () => {},
                },
                {
                    name: textChan ? "Divider" : null,
                },
                {
                    name: textChan ? "Invite People" : null,
                    icon: "addUser",
                    func: () => {
                        setLayers({
                            settings: {
                                type: "POPUP",
                            },
                            content: {
                                type: "GUILD_INVITE",
                                guild: content.guild,
                                channel: textChan,
                            },
                        });
                    },
                },
                {
                    name: "Divider",
                },
                {
                    name: "Mute Server",
                    items: muteItems,
                    func: () => {},
                },
                {
                    name: "Notification Settings",
                    items: notificationItems,
                    func: () => {},
                },
                {
                    name: "Hide Muted Channels",
                    checked: true,
                    func: () => {},
                },
                {
                    name: "Divider",
                },
                {
                    name: "Server Settings",
                    items: serverSettingsItems,
                    func: () => {},
                },
                {
                    name: "Privacy Settings",
                    func: () => {},
                },
                {
                    name: "Edit Server Profile",
                    func: () => {},
                },
                {
                    name: "Divider",
                },
                {
                    name: "Create Channel",
                    func: () => {},
                },
                {
                    name: "Create Category",
                    func: () => {},
                },
                {
                    name: "Create Event",
                    func: () => {},
                },
                {
                    name: "Divider",
                },
                {
                    name: content.guild.ownerId === currentUser.id ? "Delete Server" : "Leave Server",
                    danger: true,
                    func: () => {
                        setLayers({
                            settings: {
                                type: "POPUP",
                            },
                            content: {
                                type: "LEAVE_CONFIRM",
                                guild: content.guild,
                                isOwner: content.guild.ownerId === currentUser.id,
                            },
                        });
                    },
                },
                {
                    name: "Divider",
                },
                {
                    name: "Copy Server ID",
                    icon: "id",
                    func: () => writeText(content.guild.id),
                },
            ]);
        }

        if (type === "GUILD") {
            const textChan = content.guild.channels.find((c: TChannel) => c.type === 2);
            setItems([
                {
                    name: "Server Boost",
                    icon: "boost",
                    func: () => {},
                },
                {
                    name: "Divider",
                },
                {
                    name: textChan ? "Invite People" : null,
                    icon: "addUser",
                    func: () => {
                        setLayers({
                            settings: {
                                type: "POPUP",
                            },
                            content: {
                                type: "GUILD_INVITE",
                                guild: content.guild,
                                channel: textChan,
                            },
                        });
                    },
                },
                {
                    name: "Invite a Guest",
                    icon: "addUser",
                    func: () => {},
                },
                {
                    name: "Server Settings",
                    icon: "settings",
                    func: () => {},
                },
                {
                    name: "Create Channel",
                    icon: "addCircle",
                    func: () => {},
                },
                {
                    name: "Create Category",
                    icon: "addFolder",
                    func: () => {},
                },
                {
                    name: "Create Event",
                    icon: "calendar",
                    func: () => {},
                },
                {
                    name: "App Directory",
                    icon: "bot",
                    func: () => {},
                },
                {
                    name: "Divider",
                },
                {
                    name: "Notification Settings",
                    icon: "bell",
                    func: () => {},
                },
                {
                    name: "Privacy Settings",
                    icon: "policeBadge",
                    func: () => {},
                },
                {
                    name: "Divider",
                },
                {
                    name: "Edit Server Profile",
                    icon: "edit",
                    func: () => {},
                },
                {
                    name: "Hide Muted Channels",
                    checked: false,
                    func: () => {},
                },
                {
                    name: "Divider",
                },
                {
                    name: "Report Raid",
                    icon: "shield",
                    func: () => {},
                    danger: true,
                },
            ]);
        }

        if (type === "INPUT") {
            setItems([
                {
                    name: content.sendButton && "Send Message Button",
                    checked: settings.sendButton,
                    func: () => setSettings("sendButton", !settings.sendButton),
                },
                { name: content.sendButton && "Divider" },
                {
                    name: "Spellcheck",
                    checked: settings.spellcheck,
                    func: () => setSettings("spellcheck", !settings.spellcheck),
                },
                { name: "Divider" },
                {
                    name: "Paste",
                    textTip: "Ctrl+V",
                    func: () => content?.pasteText(),
                },
            ]);
        }

        if (type === "IMAGE") {
            setItems([
                {
                    name: content.attachment ? "Copy Image" : null,
                    func: () => {
                        const url = `${process.env.NEXT_PUBLIC_CDN_URL}/${content.attachment.id}/`;

                        fetch(url)
                            .then((res) => res.blob())
                            .then((blob) => {
                                navigator.clipboard.write([
                                    new ClipboardItem({
                                        [blob.type]: blob,
                                    }),
                                ]);
                            });
                    },
                },
                {
                    name: content.attachment ? "Save Image" : null,
                    func: () => {
                        const url = `${process.env.NEXT_PUBLIC_CDN_URL}/${content.attachment.id}/`;

                        fetch(url)
                            .then((res) => res.blob())
                            .then((blob) => {
                                const a = document.createElement("a");
                                a.href = URL.createObjectURL(blob);
                                a.download = content.attachment.name;
                                a.click();
                            });
                    },
                },
                { name: content.attachment ? "Divider" : null },
                {
                    name: content.attachment ? "Copy Link" : null,
                    func: () => writeText(`${process.env.NEXT_PUBLIC_CDN_URL}/${content.attachment.id}/`),
                },
                {
                    name: content.attachment ? "Open Link" : null,
                    func: () => {
                        window.open(`${process.env.NEXT_PUBLIC_CDN_URL}/${content.attachment.id}/`);
                    },
                },
            ]);
        }

        if (type === "MESSAGE") {
            if (shouldDisplayInlined(message.type)) {
                setItems([
                    {
                        name: "Add Reaction",
                        items: reactionItems,
                        icon: "addReaction",
                        func: () => {},
                    },
                    {
                        name: message.content ? "Copy Text" : null,
                        icon: "copy",
                        func: () => writeText(message.content as string),
                    },
                    { name: "Mark Unread", icon: "mark", func: () => {} },
                    {
                        name: "Copy Message Link",
                        icon: "link",
                        func: () => writeText(`/channels/@me/${message.channelId}/${message.id}`),
                    },
                    { name: "Divider" },
                    {
                        name: "Copy Message ID",
                        icon: "id",
                        func: () => writeText(message.id),
                    },
                ]);
            } else {
                setItems([
                    {
                        name: "Add Reaction",
                        items: reactionItems,
                        icon: "addReaction",
                        func: () => {},
                    },
                    {
                        name: !!userProps?.isSelf ? "Edit Message" : null,
                        icon: "edit",
                        func: () => content?.functions?.editMessageState(),
                    },
                    {
                        name: message.pinned ? "Unpin Message" : "Pin Message",
                        icon: "pin",
                        func: message?.pinned
                            ? () => content?.functions?.unpinPopup()
                            : () => content?.functions?.pinPopup(),
                        funcShift: message.pinned
                            ? () => {
                                  sendRequest({
                                      query: "UNPIN_MESSAGE",
                                      params: {
                                          channelId: message.channelId,
                                          messageId: message.id,
                                      },
                                  });
                              }
                            : () => {
                                  sendRequest({
                                      query: "PIN_MESSAGE",
                                      params: {
                                          channelId: message.channelId,
                                          messageId: message.id,
                                      },
                                  });
                              },
                    },
                    {
                        name: "Reply",
                        icon: "reply",
                        func: () => content?.functions?.replyToMessageState(),
                    },
                    {
                        name: message.content ? "Copy Text" : null,
                        icon: "copy",
                        func: () => writeText(message.content as string),
                    },
                    {
                        name: message.content !== null ? "Translate" : null,
                        icon: "translate",
                        func: () => {},
                    },
                    { name: "Mark Unread", icon: "mark", func: () => {} },
                    {
                        name: "Copy Message Link",
                        icon: "link",
                        func: () => writeText(`/channels/@me/${message.channelId}/${message.id}`),
                    },
                    {
                        name: message.content !== null ? "Speak Message" : null,
                        icon: "speak",
                        func: () => {
                            const msg = new SpeechSynthesisUtterance();
                            msg.text = `${message.author.username} said ${message.content}`;
                            window.speechSynthesis.speak(msg);
                        },
                    },
                    {
                        name: canDeleteMessage() ? "Delete Message" : null,
                        icon: "delete",
                        func: () => content?.functions?.deletePopup(),
                        funcShift: () =>
                            sendRequest({
                                query: "DELETE_MESSAGE",
                                params: {
                                    channelId: message.channelId,
                                    messageId: message.id,
                                },
                            }),
                        danger: true,
                    },
                    {
                        name: !userProps?.isSelf ? "Report Message" : null,
                        icon: "report",
                        func: () => {},
                        danger: true,
                    },
                    { name: content?.attachment ? "Divider" : null },
                    {
                        name: content?.attachment ? "Copy Image" : null,
                        func: () => {
                            const url = `${process.env.NEXT_PUBLIC_CDN_URL}/${content.attachment.id}/`;

                            fetch(url)
                                .then((res) => res.blob())
                                .then((blob) => {
                                    navigator.clipboard.write([
                                        new ClipboardItem({
                                            [blob.type]: blob,
                                        }),
                                    ]);
                                });
                        },
                    },
                    {
                        name: content?.attachment ? "Save Image" : null,
                        func: () => {
                            const url = `${process.env.NEXT_PUBLIC_CDN_URL}/${content.attachment.id}/`;

                            fetch(url)
                                .then((res) => res.blob())
                                .then((blob) => {
                                    const a = document.createElement("a");
                                    a.href = URL.createObjectURL(blob);
                                    a.download = content.attachment.name;
                                    a.click();
                                });
                        },
                    },
                    { name: content?.attachment ? "Divider" : null },
                    {
                        name: content?.attachment ? "Copy Link" : null,
                        func: () => writeText(`${process.env.NEXT_PUBLIC_CDN_URL}/${content.attachment.id}/`),
                    },
                    {
                        name: content?.attachment ? "Open Link" : null,
                        func: () => {
                            window.open(`${process.env.NEXT_PUBLIC_CDN_URL}/${content.attachment.id}/`);
                        },
                    },
                    { name: "Divider" },
                    {
                        name: "Copy Message ID",
                        icon: "id",
                        func: () => writeText(message.id),
                    },
                ]);
            }
        }

        if (type === "USER_SMALL") {
            setItems([
                {
                    name: "Start Video Call",
                    func: () => {},
                },
                {
                    name: "Start Voice Call",
                    func: () => {},
                },
                {
                    name: "Remove Friend",
                    func: () =>
                        sendRequest({
                            query: "REMOVE_FRIEND",
                            params: {
                                username: user.username,
                            },
                        }),
                    danger: true,
                },
            ]);
        }

        if (type === "USER" || type === "CHANNEL") {
            if (user) {
                if (userProps?.isSelf) {
                    setItems([
                        {
                            name: "Profile",
                            func: () => {
                                setLayers({
                                    settings: {
                                        type: "USER_PROFILE",
                                    },
                                    content: {
                                        user,
                                    },
                                });
                            },
                        },
                        {
                            name: "Mention",
                            func: () => setMention(user),
                        },
                        { name: "Divider" },
                        {
                            name: "Copy User ID",
                            func: () => writeText(user.id),
                            icon: "id",
                        },
                    ]);
                } else if (content?.userprofile) {
                    setItems([
                        {
                            name: !userProps?.isBlocked
                                ? userProps?.receivedRequest
                                    ? "Accept Friend Request"
                                    : userProps?.sentRequest
                                    ? "Cancel Friend Request"
                                    : userProps?.isFriend
                                    ? "Remove Friend"
                                    : "Add Friend"
                                : null,
                            func: () =>
                                userProps?.sentRequest || userProps?.isFriend
                                    ? sendRequest({
                                          query: "REMOVE_FRIEND",
                                          params: {
                                              username: user.username,
                                          },
                                      })
                                    : sendRequest({
                                          query: "ADD_FRIEND",
                                          params: {
                                              username: user.username,
                                          },
                                      }),
                            danger: userProps?.sentRequest || userProps?.isFriend,
                        },
                        {
                            name: userProps?.isBlocked ? "Unblock" : "Block",
                            func: () =>
                                userProps?.isBlocked
                                    ? sendRequest({
                                          query: "UNBLOCK_USER",
                                          params: {
                                              username: user.username,
                                          },
                                      })
                                    : sendRequest({
                                          query: "BLOCK_USER",
                                          params: {
                                              username: user.username,
                                          },
                                      }),
                            danger: !userProps?.isBlocked,
                        },
                        {
                            name: !userProps?.isBlocked ? "Message" : null,
                            func: () => {
                                sendRequest({
                                    query: "CHANNEL_CREATE",
                                    data: {
                                        recipients: [user.id],
                                    },
                                });
                                setLayers({
                                    settings: {
                                        type: "USER_PROFILE",
                                        setNull: true,
                                    },
                                });
                            },
                        },
                        { name: "Divider" },
                        {
                            name: "Copy User ID",
                            func: () => writeText(user.id),
                            icon: "id",
                        },
                    ]);
                } else if (userProps?.isBlocked) {
                    setItems([
                        {
                            name: content?.channel && "Mark As Read",
                            func: () => {},
                            disabled: true,
                        },
                        { name: content?.channel && "Divider" },
                        {
                            name: "Profile",
                            func: () => {
                                setLayers({
                                    settings: {
                                        type: "USER_PROFILE",
                                        setNull: true,
                                    },
                                });
                                setTimeout(
                                    () =>
                                        setLayers({
                                            settings: {
                                                type: "USER_PROFILE",
                                            },
                                            content: {
                                                user,
                                            },
                                        }),
                                    50
                                );
                            },
                        },
                        {
                            name: "Message",
                            func: () =>
                                sendRequest({
                                    query: "CHANNEL_CREATE",
                                    data: {
                                        recipients: [user.id],
                                    },
                                }),
                        },
                        {
                            name: "Add Note",
                            func: () => {
                                setLayers({
                                    settings: {
                                        type: "USER_PROFILE",
                                    },
                                    content: {
                                        user,
                                        focusNote: true,
                                    },
                                });
                            },
                        },
                        {
                            name: content?.channel && "Close DM",
                            func: () =>
                                sendRequest({
                                    query: "CHANNEL_DELETE",
                                    params: { channelId: content.channel.id },
                                }),
                        },
                        { name: "Divider" },
                        {
                            name: "Add Friend",
                            disabled: true,
                            func: () => {},
                        },
                        {
                            name: "Unblock User",
                            func: () =>
                                sendRequest({
                                    query: "UNBLOCK_USER",
                                    params: {
                                        username: user.username,
                                    },
                                }),
                        },
                        { name: "Divider" },
                        {
                            name: content?.channel && `Mute @${user.username}`,
                            items: muteItems,
                            func: () => {},
                        },
                        { name: content?.channel && "Divider" },
                        {
                            name: "Copy User ID",
                            func: () => writeText(user.id),
                            icon: "id",
                        },
                        {
                            name: content?.channel && "Copy Channel ID",
                            func: () => writeText(content.channel.id),
                            icon: "id",
                        },
                    ]);
                } else {
                    setItems([
                        {
                            name: content?.channel && "Mark As Read",
                            func: () => {},
                            disabled: true,
                        },
                        { name: content?.channel && "Divider" },
                        {
                            name: "Profile",
                            func: () => {
                                setLayers({
                                    settings: {
                                        type: "USER_PROFILE",
                                    },
                                    content: {
                                        user,
                                    },
                                });
                            },
                        },
                        {
                            name: "Message",
                            func: () =>
                                sendRequest({
                                    query: "CHANNEL_CREATE",
                                    data: {
                                        recipients: [user.id],
                                    },
                                }),
                        },
                        {
                            name: !userProps?.sentRequest ? "Call" : null,
                            func: () => {},
                        },
                        {
                            name: "Add Note",
                            func: () => {
                                setLayers({
                                    settings: {
                                        type: "USER_PROFILE",
                                    },
                                    content: {
                                        user,
                                        focusNote: true,
                                    },
                                });
                            },
                        },
                        {
                            name: !(userProps?.receivedRequest || userProps?.sentRequest || !userProps?.isFriend)
                                ? "Add Friend Nickname"
                                : null,
                            func: () => {},
                        },
                        {
                            name: content?.channel && "Close DM",
                            func: () =>
                                sendRequest({
                                    query: "CHANNEL_DELETE",
                                    params: { channelId: content.channel.id },
                                }),
                        },
                        { name: "Divider" },
                        {
                            name: !userProps?.sentRequest ? "Invite to Server" : null,
                            items: serverItems,
                            func: () => {},
                        },
                        {
                            name: userProps?.receivedRequest
                                ? "Accept Friend Request"
                                : userProps?.sentRequest
                                ? "Cancel Friend Request"
                                : userProps?.isFriend
                                ? "Remove Friend"
                                : "Add Friend",
                            func: () =>
                                userProps?.sentRequest || userProps?.isFriend
                                    ? sendRequest({
                                          query: "REMOVE_FRIEND",
                                          params: { username: user.username },
                                      })
                                    : sendRequest({
                                          query: "ADD_FRIEND",
                                          params: { username: user.username },
                                      }),
                        },
                        {
                            name: userProps?.isBlocked ? "Unblock" : "Block",
                            func: () =>
                                userProps?.isBlocked
                                    ? sendRequest({
                                          query: "UNBLOCK_USER",
                                          params: { username: user.username },
                                      })
                                    : sendRequest({
                                          query: "BLOCK_USER",
                                          params: { username: user.username },
                                      }),
                            danger: !userProps?.isBlocked,
                        },
                        { name: "Divider" },
                        {
                            name: content?.channel && `Mute @${user.username}`,
                            items: muteItems,
                            func: () => {},
                        },
                        { name: content?.channel && "Divider" },
                        {
                            name: "Copy User ID",
                            func: () => writeText(user.id),
                            icon: "id",
                        },
                        {
                            name: content?.channel && "Copy Channel ID",
                            func: () => writeText(content.channel.id),
                            icon: "id",
                        },
                    ]);
                }
            } else {
                setItems([
                    {
                        name: "Mark As Read",
                        disabled: true,
                        func: () => {},
                    },
                    { name: "Divider" },
                    {
                        func: () => {},
                        name: "Invites",
                    },
                    {
                        name: "Change Icon",
                        func: () => {},
                    },
                    { name: "Divider" },
                    {
                        name: "Mute Conversation",
                        items: muteItems,
                        func: () => {},
                    },
                    { name: "Divider" },
                    {
                        name: "Leave Group",
                        func: () => {
                            if (content.channel.recipients.length === 1) {
                                sendRequest({
                                    query: "CHANNEL_DELETE",
                                    params: {
                                        channelId: content.channel.id,
                                    },
                                });
                            } else {
                                setLayers({
                                    settings: {
                                        type: "POPUP",
                                    },
                                    content: {
                                        type: "LEAVE_CONFIRM",
                                        channel: content.channel,
                                    },
                                });
                            }
                        },
                        danger: true,
                    },
                    { name: "Divider" },
                    {
                        name: "Copy Channel ID",
                        func: () => writeText(content.channel.id),
                        icon: "id",
                    },
                ]);
            }
        }

        if (type === "USER_GROUP") {
            if (userProps?.isSelf) {
                setItems([
                    {
                        name: "Profile",
                        func: () => {
                            setLayers({
                                settings: {
                                    type: "USER_PROFILE",
                                    setNull: true,
                                },
                            });
                            setTimeout(() => {
                                setLayers({
                                    settings: {
                                        type: "USER_PROFILE",
                                    },
                                    content: {
                                        user,
                                        focusNote: true,
                                    },
                                });
                            }, 50);
                        },
                    },
                    {
                        name: "Mention",
                        func: () => setMention(user),
                    },
                    { name: "Divider" },
                    {
                        name: "Copy User ID",
                        func: () => writeText(user.id),
                        icon: "id",
                    },
                ]);
            } else {
                setItems([
                    {
                        name: "Profile",
                        func: () => {
                            setLayers({
                                settings: {
                                    type: "USER_PROFILE",
                                },
                                content: {
                                    user,
                                    focusNote: true,
                                },
                            });
                        },
                    },
                    {
                        name: "Mention",
                        func: () => setMention(user),
                    },
                    {
                        name: "Message",
                        func: () =>
                            sendRequest({
                                query: "CHANNEL_CREATE",
                                data: {
                                    recipients: [user.id],
                                },
                            }),
                    },
                    {
                        name: !userProps?.sentRequest ? "Call" : null,
                        func: () => {},
                    },
                    {
                        name: "Add Note",
                        func: () => {
                            setLayers({
                                settings: {
                                    type: "USER_PROFILE",
                                },
                                content: {
                                    user,
                                    focusNote: true,
                                },
                            });
                        },
                    },
                    {
                        name: !(userProps?.receivedRequest || userProps?.sentRequest || !userProps?.isFriend)
                            ? "Add Friend Nickname"
                            : null,
                        func: () => {},
                    },
                    {
                        name: content.channel.ownerId === currentUser.id ? "Divider" : null,
                    },
                    {
                        name: content.channel.ownerId === currentUser.id ? "Remove From Group" : null,
                        func: () => {
                            sendRequest({
                                query: "CHANNEL_RECIPIENT_REMOVE",
                                params: {
                                    channelId: content.channel.id,
                                    recipientId: user.id,
                                },
                            });
                        },
                        danger: true,
                    },
                    {
                        name: content.channel.ownerId === currentUser.id ? "Make Group Owner" : null,
                        func: () => {
                            setLayers({
                                settings: {
                                    type: "POPUP",
                                },
                                content: {
                                    type: "GROUP_OWNER_CHANGE",
                                    channelId: content.channel.id,
                                    recipient: user,
                                },
                            });
                        },
                        danger: true,
                    },
                    { name: "Divider" },
                    {
                        name: !userProps?.sentRequest ? "Invite to Server" : null,
                        items: serverItems,
                        func: () => {},
                    },
                    {
                        name: userProps?.receivedRequest
                            ? "Accept Friend Request"
                            : userProps?.sentRequest
                            ? "Cancel Friend Request"
                            : userProps?.isFriend
                            ? "Remove Friend"
                            : "Add Friend",
                        func: () =>
                            userProps?.sentRequest || userProps?.isFriend
                                ? sendRequest({
                                      query: "REMOVE_FRIEND",
                                      params: { username: user.username },
                                  })
                                : sendRequest({
                                      query: "ADD_FRIEND",
                                      params: { username: user.username },
                                  }),
                    },
                    {
                        name: userProps?.isBlocked ? "Unblock" : "Block",
                        func: () =>
                            userProps?.isBlocked
                                ? sendRequest({
                                      query: "UNBLOCK_USER",
                                      params: { username: user.username },
                                  })
                                : sendRequest({
                                      query: "BLOCK_USER",
                                      params: { username: user.username },
                                  }),
                    },
                    { name: content?.channel && "Divider" },
                    {
                        name: "Copy User ID",
                        func: () => writeText(user.id),
                        icon: "id",
                    },
                ]);
            }
        } else if (type === "STATUS") {
            setItems([
                {
                    name: "Online",
                    func: async () => {
                        setLayers({
                            settings: {
                                type: "USER_CARD",
                                setNull: true,
                            },
                        });
                        await sendRequest({
                            query: "UPDATE_USER",
                            data: {
                                status: "ONLINE",
                            },
                        });
                    },
                },
                {
                    name: "Divider",
                },
                {
                    name: "Idle",
                    func: async () => {
                        setLayers({
                            settings: {
                                type: "USER_CARD",
                                setNull: true,
                            },
                        });
                        await sendRequest({
                            query: "UPDATE_USER",
                            data: {
                                status: "IDLE",
                            },
                        });
                    },
                },
                {
                    name: "Do Not Disturb",
                    tip: "You will not receive any desktop notifications.",
                    func: async () => {
                        setLayers({
                            settings: {
                                type: "USER_CARD",
                                setNull: true,
                            },
                        });
                        await sendRequest({
                            query: "UPDATE_USER",
                            data: {
                                status: "DO_NOT_DISTURB",
                            },
                        });
                    },
                },
                {
                    name: "Invisible",
                    tip: "You will not appear online, but will have all access to all of Chat App.",
                    func: async () => {
                        setLayers({
                            settings: {
                                type: "USER_CARD",
                                setNull: true,
                            },
                        });
                        await sendRequest({
                            query: "UPDATE_USER",
                            data: {
                                status: "INVISIBLE",
                            },
                        });
                    },
                },
            ]);
        }
    }, [userProps, settings.sendButton, settings.spellcheck, layers]);

    return useMemo(
        () => (
            <div
                ref={menuRef}
                className={`${styles.container} ${type === "GUILD" ? "big" : ""}`}
                onMouseLeave={() => setHover("")}
                style={{
                    width: type === "GUILD" ? 220 : "",
                    transform: type === "GUILD" ? "translateX(+10px)" : "",
                    visibility: items?.length ? "visible" : "hidden",
                }}
            >
                <div>
                    {items?.map((item, index) => {
                        if (!item.name) return;
                        else if (item.name === "Divider") return <div key={index} className={styles.divider} />;
                        else
                            return (
                                <div
                                    key={index}
                                    className={`${item.danger ? styles.itemDanger : styles.item} ${
                                        item.disabled ? styles.disabled : ""
                                    } ${hover === item.name ? styles.hover : ""}`}
                                    onClick={() => {
                                        if (item.disabled) return;
                                        if (shift && item.funcShift) item.funcShift();
                                        else if (item.func) item.func();
                                        if ("checked" in item) return;
                                        setLayers({
                                            settings: {
                                                type: "MENU",
                                                setNull: true,
                                            },
                                        });
                                    }}
                                    onMouseEnter={() => setHover(item.name as string)}
                                >
                                    <div
                                        style={{
                                            justifyContent: item.leftIcon ? "flex-start" : "",
                                        }}
                                    >
                                        {item.leftIcon && (
                                            <div style={{ marginRight: "8px" }}>
                                                <Icon name={item.leftIcon} />
                                            </div>
                                        )}

                                        {content.type === "STATUS" && (
                                            <div className={styles.statusIcon}>
                                                <svg width={10} height={10}>
                                                    <rect
                                                        height="10px"
                                                        width="10px"
                                                        rx={8}
                                                        ry={8}
                                                        fill={colors[index]}
                                                        mask={`url(#${masks[index]})`}
                                                    />
                                                </svg>
                                            </div>
                                        )}

                                        <div className={styles.label} style={{ fontSize: item.leftIcon ? "12px" : "" }}>
                                            {item.name}
                                        </div>

                                        {(item.icon || "checked" in item || "items" in item) && (
                                            <div
                                                className={`${styles.icon} ${
                                                    "checked" in item && item.checked ? styles.revert : ""
                                                }`}
                                                style={{
                                                    transform: "items" in item ? "rotate(-90deg)" : "",
                                                }}
                                            >
                                                <Icon
                                                    name={
                                                        "checked" in item
                                                            ? item.checked
                                                                ? "checkboxFilled"
                                                                : "checkbox"
                                                            : "items" in item
                                                            ? "arrow"
                                                            : item.icon ?? ""
                                                    }
                                                    size={item.iconSize ?? type === "GUILD" ? 18 : 16}
                                                    viewbox={
                                                        item.icon === "boost"
                                                            ? "0 0 8 12"
                                                            : item.icon === "translate"
                                                            ? "0 96 960 960"
                                                            : ""
                                                    }
                                                />
                                            </div>
                                        )}

                                        {item.textTip && <div className={styles.text}>{item.textTip}</div>}
                                    </div>

                                    {item.tip && (
                                        <div
                                            className={styles.tip}
                                            style={{ marginLeft: content.type === "STATUS" ? "18px" : "" }}
                                        >
                                            {item.tip}
                                            {item.tipIcon && <Icon name={item.tipIcon} size={16} />}
                                        </div>
                                    )}
                                </div>
                            );
                    })}
                </div>
            </div>
        ),
        [items, shift, hover]
    );
};
