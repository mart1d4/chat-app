import { useData, useLayers, useMention, useSettings, useShowSettings } from "@/store";
import useFetchHelper from "@/hooks/useFetchHelper";
import { isInline } from "@/lib/message";
import type { Message } from "@/type";

function canDeleteMessage() {
    return true;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;

export function MenuItems() {
    const setShowSettings = useShowSettings((state) => state.setShowSettings);
    const setSettings = useSettings((state) => state.setSettings);
    const setMention = useMention((state) => state.setMention);
    const settings = useSettings((state) => state.settings);
    const setLayers = useLayers((state) => state.setLayers);
    const currentUser = useData((state) => state.user);

    const { sendRequest } = useFetchHelper();

    async function writeToClip(text: string) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    }

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

    function getFileInput({ ...props }) {
        return [
            {
                name: "Upload a File",
                tip: "Tip: Double click the ",
                tipIcon: "attach",
                leftIcon: "upload",
                func: () => props.content.openInput(),
            },
            {
                name: "Send Voice Message",
                leftIcon: "voiceMessage",
                func: () => {},
            },
        ];
    }

    function getGuildChannelList({ ...props }) {
        return [
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
                            guild: props.content.guild.id,
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
                            guild: props.content.guild.id,
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
                            guild: props.content.guild,
                        },
                    });
                },
            },
        ];
    }

    function getGuildChannel({ ...props }) {
        const channel = props.content.channel;

        if (channel.type === 4) {
            return [
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
                    func: () => {
                        setShowSettings({ type: "CHANNEL", channel });
                    },
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
                                channel: channel,
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

                    func: () => writeToClip(channel.id),
                },
            ];
        } else {
            return [
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
                                guild: props.content.guild,
                                channel: channel,
                            },
                        });
                    },
                },
                {
                    name: "Copy Link",
                    func: () => writeToClip(`${baseUrl}/channels/${channel.guildId}/${channel.id}`),
                },
                {
                    name: channel.type == 3 ? "Divider" : null,
                },
                {
                    name: channel.type == 3 ? "Open Chat" : null,
                    func: () => {},
                },
                {
                    name: channel.type == 3 ? "Hide Names" : null,
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
                    name: channel.type == 2 ? "Notifications Settings" : null,
                    items: notificationItems,
                    func: () => {},
                },
                {
                    name: "Divider",
                },
                {
                    name: "Edit Channel",
                    func: () => setShowSettings({ type: "CHANNEL", channel: channel }),
                },
                {
                    name: "Duplicate Channel",
                    func: () => {},
                },
                {
                    name: `Create ${channel.type === 2 ? "Text" : "Voice"} Channel`,
                    func: () => {
                        setLayers({
                            settings: {
                                type: "POPUP",
                            },
                            content: {
                                type: "GUILD_CHANNEL_CREATE",
                                guild: props.content.guild.id,
                                category: props.content.category,
                                voice: channel.type === 3,
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
                                channel: channel,
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
                    func: () => writeToClip(channel.id),
                },
            ];
        }
    }

    function getGuild({ ...props }) {
        return [
            {
                name: "Server Boost",
                icon: "boost",
                func: () => {},
            },
            {
                name: "Divider",
            },
            {
                name: null ? "Invite People" : null,
                icon: "addUser",
                func: () => {
                    setLayers({
                        settings: {
                            type: "POPUP",
                        },
                        content: {
                            type: "GUILD_INVITE",
                            guild: props.content.guild,
                            channel: null,
                        },
                    });
                },
            },
            {
                name: "Server Settings",
                icon: "cog",
                func: () => setShowSettings({ type: "GUILD", guild: props.content.guild }),
            },
            {
                name: "Server Insights",
                icon: "chart",
                func: () => {},
            },
            {
                name: "Create Channel",
                icon: "attach",
                func: () => {
                    setLayers({
                        settings: {
                            type: "POPUP",
                        },
                        content: {
                            type: "GUILD_CHANNEL_CREATE",
                            guild: props.content.guild.id,
                        },
                    });
                },
            },
            {
                name: "Create Category",
                icon: "folder",
                func: () => {
                    setLayers({
                        settings: {
                            type: "POPUP",
                        },
                        content: {
                            type: "GUILD_CHANNEL_CREATE",
                            guild: props.content.guild.id,
                            isCategory: true,
                        },
                    });
                },
            },
            {
                name: "Create Event",
                icon: "calendar",
                func: () => {},
            },
            {
                name: "Active Threads",
                icon: "message",
                func: () => {},
            },
            {
                name: "App Directory",
                icon: "app",
                func: () => {},
            },
            {
                name: "Divider",
            },
            {
                name: "Show All Channels",
                checked: true,
                func: () => {},
            },
            {
                name: "Notification Settings",
                icon: "bell",
                func: () => {},
            },
            {
                name: "Privacy Settings",
                icon: "shield",
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
                name: "Security Actions",
                icon: "lock",
                func: () => {},
                danger: true,
            },
            {
                name: "Report Raid",
                icon: "shield",
                func: () => {},
                danger: true,
            },
            {
                name: !props.isGuildOwner ? "Leave Server" : null,
                icon: "logout",
                func: () => {},
                danger: true,
            },
        ];
    }

    function getInput({ ...props }) {
        return [
            {
                name: props.content.sendButton && "Send Message Button",
                checked: settings.sendButton,
                func: () => setSettings("sendButton", !settings.sendButton),
            },
            { name: props.content.sendButton && "Divider" },
            {
                name: "Spellcheck",
                checked: settings.spellcheck,
                func: () => setSettings("spellcheck", !settings.spellcheck),
            },
            { name: "Divider" },
            {
                name: "Paste",
                textTip: "Ctrl+V",
                func: () => props.content.pasteText(),
            },
        ];
    }

    function getImage({ ...props }) {
        return [
            {
                name: props.content.attachment ? "Copy Image" : null,
                func: () => {
                    const url = `${cdnUrl}/${props.content.attachment.id}/`;

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
                name: props.content.attachment ? "Save Image" : null,
                func: () => {
                    const url = `${cdnUrl}/${props.content.attachment.id}/`;

                    fetch(url)
                        .then((res) => res.blob())
                        .then((blob) => {
                            const a = document.createElement("a");
                            a.href = URL.createObjectURL(blob);
                            a.download = props.content.attachment.name;
                            a.click();
                            a.remove();
                        });
                },
            },
            { name: props.content.attachment ? "Divider" : null },
            {
                name: props.content.attachment ? "Copy Link" : null,
                func: () => writeToClip(`${cdnUrl}/${props.content.attachment.id}/`),
            },
            {
                name: props.content.attachment ? "Open Link" : null,
                func: () => window.open(`${cdnUrl}/${props.content.attachment.id}/`),
            },
        ];
    }

    function getMessage({ ...props }) {
        const message: Message = props.content.message;
        const functions = message.functions;

        if (isInline(message.type)) {
            return [
                {
                    name: "Add Reaction",
                    items: reactionItems,
                    icon: "addReaction",
                    func: () => {},
                },
                {
                    name: message.content ? "Copy Text" : null,
                    icon: "copy",
                    func: functions?.copyText,
                },
                { name: "Mark Unread", icon: "mark", func: () => {} },
                {
                    name: "Copy Message Link",
                    icon: "link",
                    func: functions?.copyLink,
                },
                { name: "Divider" },
                {
                    name: "Copy Message ID",
                    icon: "id",

                    func: functions?.copyId,
                },
            ];
        } else {
            return [
                {
                    name: "Add Reaction",
                    items: reactionItems,
                    icon: "addReaction",
                    func: () => {},
                },
                {
                    name: !!props.relationships.self ? "Edit Message" : null,
                    icon: "edit",
                    func: functions?.editState,
                },
                {
                    name: message.pinned ? "Unpin Message" : "Pin Message",
                    icon: "pin",
                    func: message?.pinned ? functions?.unpinPopup : functions?.pinPopup,
                    funcShift: message.pinned ? functions?.unpin : functions?.pin,
                },
                {
                    name: "Reply",
                    icon: "reply",
                    func: functions?.replyState,
                },
                {
                    name: message.content ? "Copy Text" : null,
                    icon: "copy",
                    func: functions?.copyText,
                },
                {
                    name: message.content ? "Translate" : null,
                    icon: "translate",
                    func: functions?.translate,
                },
                { name: "Mark Unread", icon: "mark", func: () => {} },
                {
                    name: "Copy Message Link",
                    icon: "link",
                    func: functions?.copyLink,
                },
                {
                    name: message.content ? "Speak Message" : null,
                    icon: "speak",
                    func: functions?.speak,
                },
                {
                    name: canDeleteMessage() ? "Delete Message" : null,
                    icon: "delete",
                    func: functions?.deletePopup,
                    funcShift: functions?.delete,
                    danger: true,
                },
                {
                    name: !props.relationships.self ? "Report Message" : null,
                    icon: "report",
                    func: functions?.report,
                    danger: true,
                },
                { name: props.content?.attachment ? "Divider" : null },
                {
                    name: props.content?.attachment ? "Copy Image" : null,
                    func: () => {
                        fetch(props.content.attachment.url)
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
                    name: props.content?.attachment ? "Save Image" : null,
                    func: () => {
                        fetch(props.content.attachment.url)
                            .then((res) => res.blob())
                            .then((blob) => {
                                const a = document.createElement("a");
                                a.href = URL.createObjectURL(blob);
                                a.download = props.content.attachment.name;
                                a.click();
                            });
                    },
                },
                { name: props.content?.attachment ? "Divider" : null },
                {
                    name: props.content?.attachment ? "Copy Link" : null,
                    func: () => writeToClip(props.content.attachment.url),
                },
                {
                    name: props.content?.attachment ? "Open Link" : null,
                    func: () => window.open(props.content.attachment.url),
                },
                { name: "Divider" },
                {
                    name: "Copy Message ID",
                    icon: "id",

                    func: functions?.copyId,
                },
            ];
        }
    }

    function getUserSmall({ ...props }) {
        const user = props.content.user;

        return [
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
                func: () => {
                    sendRequest({
                        query: "REMOVE_FRIEND",
                        body: { username: user.username },
                    });
                },
                danger: true,
            },
        ];
    }

    function getChannel({ ...props }) {
        const user = props.content.user;
        const channel = props.content.channel;

        if (user) {
            if (props.relationships.self) {
                return [
                    {
                        name: "Profile",
                        func: () => {
                            setLayers({
                                settings: { type: "USER_PROFILE" },
                                content: { user: currentUser },
                            });
                        },
                    },
                    {
                        name: "Mention",
                        func: () => setMention(currentUser),
                    },
                    { name: "Divider" },
                    {
                        name: "Copy User ID",
                        func: () => writeToClip(currentUser.id),
                        icon: "id",
                    },
                ];
            } else if (props.content.userprofile) {
                return [
                    {
                        name: !props.relationships.blocked
                            ? props.relationships.received
                                ? "Accept Friend Request"
                                : props.relationships.sent
                                ? "Cancel Friend Request"
                                : props.relationships.friend
                                ? "Remove Friend"
                                : "Add Friend"
                            : null,
                        func: () => {
                            if (props.relationships.sent || props.relationships.friend) {
                                sendRequest({
                                    query: "REMOVE_FRIEND",
                                    body: { username: user.username },
                                });
                            } else {
                                sendRequest({
                                    query: "ADD_FRIEND",
                                    body: { username: user.username },
                                });
                            }
                        },
                        danger: props.relationships.sent || props.relationships.friend,
                    },
                    {
                        name: props.relationships.blocked ? "Unblock" : "Block",
                        func: () => {
                            if (props.relationships.blocked) {
                                sendRequest({
                                    query: "UNBLOCK_USER",
                                    params: { userId: user.id },
                                });
                            } else {
                                sendRequest({
                                    query: "BLOCK_USER",
                                    params: { userId: user.id },
                                });
                            }
                        },
                        danger: !props.relationships.blocked,
                    },
                    {
                        name: !props.relationships.blocked ? "Message" : null,
                        func: () => {
                            sendRequest({
                                query: "CHANNEL_CREATE",
                                body: { recipients: [user.id] },
                            });
                            setLayers({
                                settings: { type: "USER_PROFILE", setNull: true },
                            });
                        },
                    },
                    { name: "Divider" },
                    {
                        name: "Copy User ID",
                        func: () => writeToClip(user.id),
                        icon: "id",
                    },
                ];
            } else if (props.relationships.blocked) {
                return [
                    {
                        name: channel ? "Mark As Read" : null,
                        func: () => {},
                        disabled: true,
                    },
                    { name: channel ? "Divider" : null },
                    {
                        name: "Profile",
                        func: () => {
                            setLayers({
                                settings: { type: "USER_PROFILE" },
                                content: { user },
                            });
                        },
                    },
                    {
                        name: "Message",
                        func: () => {
                            sendRequest({
                                query: "CHANNEL_CREATE",
                                body: { recipients: [user.id] },
                            });
                        },
                    },
                    {
                        name: "Add Note",
                        func: () => {
                            setLayers({
                                settings: { type: "USER_PROFILE" },
                                content: { user, focusNote: true },
                            });
                        },
                    },
                    {
                        name: channel ? "Close DM" : null,
                        func: () => {
                            sendRequest({
                                query: "CHANNEL_DELETE",
                                params: { channelId: channel.id },
                            });
                        },
                    },
                    { name: "Divider" },
                    {
                        name: "Add Friend",
                        disabled: true,
                        func: () => {},
                    },
                    {
                        name: "Unblock User",
                        func: () => {
                            sendRequest({
                                query: "UNBLOCK_USER",
                                params: { userId: user.id },
                            });
                        },
                    },
                    { name: "Divider" },
                    {
                        name: channel ? `Mute @${user.username}` : null,
                        items: muteItems,
                        func: () => {},
                    },
                    { name: channel ? "Divider" : null },
                    {
                        name: "Copy User ID",
                        func: () => writeToClip(user.id),
                        icon: "id",
                    },
                    {
                        name: channel ? "Copy Channel ID" : null,
                        func: () => writeToClip(channel.id),
                        icon: "id",
                    },
                ];
            } else {
                return [
                    {
                        name: channel ? "Mark As Read" : null,
                        func: () => {},
                        disabled: true,
                    },
                    { name: channel ? "Divider" : null },
                    {
                        name: "Profile",
                        func: () => {
                            setLayers({
                                settings: { type: "USER_PROFILE" },
                                content: { user },
                            });
                        },
                    },
                    {
                        name: "Message",
                        func: () =>
                            sendRequest({
                                query: "CHANNEL_CREATE",
                                body: { recipients: [user.id] },
                            }),
                    },
                    {
                        name: !props.relationships.sent ? "Call" : null,
                        func: () => {},
                    },
                    {
                        name: "Add Note",
                        func: () => {
                            setLayers({
                                settings: { type: "USER_PROFILE" },
                                content: { user, focusNote: true },
                            });
                        },
                    },
                    {
                        name: !(
                            props.relationships.received ||
                            props.relationships.sent ||
                            !props.relationships.friend
                        )
                            ? "Add Friend Nickname"
                            : null,
                        func: () => {},
                    },
                    {
                        name: channel ? "Close DM" : null,
                        func: () => {
                            sendRequest({
                                query: "CHANNEL_DELETE",
                                params: { channelId: channel.id },
                            });
                        },
                    },
                    { name: "Divider" },
                    {
                        name: !props.relationships.sent ? "Invite to Server" : null,
                        items: serverItems,
                        func: () => {},
                    },
                    {
                        name: props.relationships.received
                            ? "Accept Friend Request"
                            : props.relationships.sent
                            ? "Cancel Friend Request"
                            : props.relationships.friend
                            ? "Remove Friend"
                            : "Add Friend",
                        func: () => {
                            if (props.relationships.sent || props.relationships.friend) {
                                sendRequest({
                                    query: "REMOVE_FRIEND",
                                    body: { username: user.username },
                                });
                            } else {
                                sendRequest({
                                    query: "ADD_FRIEND",
                                    body: { username: user.username },
                                });
                            }
                        },
                    },
                    {
                        name: props.relationships.blocked ? "Unblock" : "Block",
                        func: () => {
                            if (props.relationships.blocked) {
                                sendRequest({
                                    query: "UNBLOCK_USER",
                                    params: { userId: user.id },
                                });
                            } else {
                                sendRequest({
                                    query: "BLOCK_USER",
                                    params: { userId: user.id },
                                });
                            }
                        },
                        danger: !props.relationships.blocked,
                    },
                    { name: "Divider" },
                    {
                        name: channel ? `Mute @${user.username}` : null,
                        items: muteItems,
                        func: () => {},
                    },
                    { name: channel ? "Divider" : null },
                    {
                        name: "Copy User ID",
                        func: () => writeToClip(user.id),
                        icon: "id",
                    },
                    {
                        name: channel ? "Copy Channel ID" : null,
                        func: () => writeToClip(props.content.channel.id),
                        icon: "id",
                    },
                ];
            }
        } else {
            return [
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
                        if (channel.recipients.length == 1) {
                            sendRequest({
                                query: "CHANNEL_DELETE",
                                params: { channelId: channel.id },
                            });
                        } else {
                            setLayers({
                                settings: { type: "POPUP" },
                                content: { type: "LEAVE_CONFIRM", channel },
                            });
                        }
                    },
                    danger: true,
                },
                { name: "Divider" },
                {
                    name: "Copy Channel ID",
                    func: () => writeToClip(channel.id),
                    icon: "id",
                },
            ];
        }
    }

    function getUserGroup({ ...props }) {
        const user = props.content.user;
        const channel = props.content.channel;

        if (props.relationships.self) {
            return [
                {
                    name: "Profile",
                    func: () => {
                        setLayers({
                            settings: { type: "USER_PROFILE" },
                            content: { user },
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
                    func: () => writeToClip(user.id),
                    icon: "id",
                },
            ];
        } else {
            return [
                {
                    name: "Profile",
                    func: () => {
                        setLayers({
                            settings: { type: "USER_PROFILE" },
                            content: { user },
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
                            body: { recipients: [user.id] },
                        }),
                },
                {
                    name: !props.relationships.sent ? "Call" : null,
                    func: () => {},
                },
                {
                    name: "Add Note",
                    func: () => {
                        setLayers({
                            settings: { type: "USER_PROFILE" },
                            content: { user: user, focusNote: true },
                        });
                    },
                },
                {
                    name: !(
                        props.relationships.received ||
                        props.relationships.sent ||
                        !props.relationships.friend
                    )
                        ? "Add Friend Nickname"
                        : null,
                    func: () => {},
                },
                {
                    name: channel.ownerId == currentUser.id ? "Divider" : null,
                },
                {
                    name: channel.ownerId == currentUser.id ? "Remove From Group" : null,
                    func: () => {
                        sendRequest({
                            query: "CHANNEL_RECIPIENT_REMOVE",
                            params: {
                                channelId: channel.id,
                                recipientId: user.id,
                            },
                        });
                    },
                    danger: true,
                },
                {
                    name: channel.ownerId === currentUser.id ? "Make Group Owner" : null,
                    func: () => {
                        setLayers({
                            settings: { type: "POPUP" },
                            content: {
                                type: "GROUP_OWNER_CHANGE",
                                channelId: channel.id,
                                recipient: user,
                            },
                        });
                    },
                    danger: true,
                },
                { name: "Divider" },
                {
                    name: !props.relationships.sent ? "Invite to Server" : null,
                    items: serverItems,
                    func: () => {},
                },
                {
                    name: props.relationships.received
                        ? "Accept Friend Request"
                        : props.relationships.sent
                        ? "Cancel Friend Request"
                        : props.relationships.friend
                        ? "Remove Friend"
                        : "Add Friend",
                    func: () => {
                        if (props.relationships.sent || props.relationships.friend) {
                            sendRequest({
                                query: "REMOVE_FRIEND",
                                body: { username: user.username },
                            });
                        } else {
                            sendRequest({
                                query: "ADD_FRIEND",
                                body: { username: user.username },
                            });
                        }
                    },
                },
                {
                    name: props.relationships.blocked ? "Unblock" : "Block",
                    func: () => {
                        if (props.relationships.blocked) {
                            sendRequest({
                                query: "UNBLOCK_USER",
                                params: { userId: props.content.user.id },
                            });
                        } else {
                            sendRequest({
                                query: "BLOCK_USER",
                                params: { userId: props.content.user.id },
                            });
                        }
                    },
                },
                { name: channel ? "Divider" : null },
                {
                    name: "Copy User ID",
                    func: () => writeToClip(user.id),
                    icon: "id",
                },
            ];
        }
    }

    function getStatus() {
        const statuses = [
            ["Online", "online"],
            ["Divider"],
            ["Idle", "idle"],
            ["Do Not Disturb", "dnd", "You will not receive any desktop notifications."],
            [
                "Invisible",
                "invisible",
                "You will not appear online, but will have full access to all of Spark.",
            ],
        ].map((status) => {
            return {
                name: status[0],
                tip: status[2],
                func: () => {
                    if (currentUser.status !== status[1]) {
                        sendRequest({
                            query: "UPDATE_USER",
                            body: { status: status[1] },
                        });
                    }
                },
                hideCard: true,
            };
        });

        return statuses;
    }

    return {
        getFileInput,
        getGuildChannelList,
        getGuildChannel,
        getGuild,
        getInput,
        getImage,
        getMessage,
        getUserSmall,
        getChannel,
        getUserGroup,
        getStatus,
    };
}
