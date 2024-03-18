import { useData } from "@/lib/store";

export function MenuItems() {
    const currentUser = useData((state) => state.user);

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
                    props.setLayers({
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
                    props.setLayers({
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
                    props.setLayers({
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
        const channel = props.channel;

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
                    func: () => {},
                },
                {
                    name: "Delete Category",
                    danger: true,
                    func: () => {
                        props.setLayers({
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
                        props.setLayers({
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
                    func: () =>
                        writeToClip(
                            `${process.env.NEXT_PUBLIC_BASE_URL}/channels/${channel.guildId}/${channel.id}`
                        ),
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
                    func: () => props.setShowSettings({ type: "CHANNEL", channel: channel }),
                },
                {
                    name: "Duplicate Channel",
                    func: () => {},
                },
                {
                    name: `Create ${channel.type === 2 ? "Text" : "Voice"} Channel`,
                    func: () => {
                        props.setLayers({
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
                        props.setLayers({
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
                    props.setLayers({
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
                func: () => props.setShowSettings({ type: "GUILD", guild: props.content.guild }),
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
                    props.setLayers({
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
                    props.setLayers({
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
                checked: props.settings.sendButton,
                func: () => props.setSettings("sendButton", !props.settings.sendButton),
            },
            { name: props.content.sendButton && "Divider" },
            {
                name: "Spellcheck",
                checked: props.settings.spellcheck,
                func: () => props.setSettings("spellcheck", !props.settings.spellcheck),
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
                    const url = `${process.env.NEXT_PUBLIC_CDN_URL}/${props.content.attachment.id}/`;

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
                    const url = `${process.env.NEXT_PUBLIC_CDN_URL}/${props.content.attachment.id}/`;

                    fetch(url)
                        .then((res) => res.blob())
                        .then((blob) => {
                            const a = document.createElement("a");
                            a.href = URL.createObjectURL(blob);
                            a.download = props.content.attachment.name;
                            a.click();
                        });
                },
            },
            { name: props.content.attachment ? "Divider" : null },
            {
                name: props.content.attachment ? "Copy Link" : null,
                func: () =>
                    writeToClip(
                        `${process.env.NEXT_PUBLIC_CDN_URL}/${props.content.attachment.id}/`
                    ),
            },
            {
                name: props.content.attachment ? "Open Link" : null,
                func: () => {
                    window.open(
                        `${process.env.NEXT_PUBLIC_CDN_URL}/${props.content.attachment.id}/`
                    );
                },
            },
        ];
    }

    function getMessage({ ...props }) {
        console.log(props);

        props.message = props.content.message;
        if (props.shouldDisplayInlined(props.message.type)) {
            return [
                {
                    name: "Add Reaction",
                    items: reactionItems,
                    icon: "addReaction",
                    func: () => {},
                },
                {
                    name: props.message.content ? "Copy Text" : null,
                    icon: "copy",
                    func: () => writeToClip(props.message.content as string),
                },
                { name: "Mark Unread", icon: "mark", func: () => {} },
                {
                    name: "Copy Message Link",
                    icon: "link",
                    func: () =>
                        writeToClip(`/channels/@me/${props.message.channelId}/${props.message.id}`),
                },
                { name: "Divider" },
                {
                    name: "Copy Message ID",
                    icon: "id",

                    func: () => writeToClip(props.message.id),
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
                    func: () => props.content?.functions?.editMessageState(),
                },
                {
                    name: props.message.pinned ? "Unpin Message" : "Pin Message",
                    icon: "pin",
                    func: props.message?.pinned
                        ? () => props.content?.functions?.unpinPopup()
                        : () => props.content?.functions?.pinPopup(),
                    funcShift: props.message.pinned
                        ? () => {
                              props.sendRequest({
                                  query: "UNPIN_MESSAGE",
                                  params: {
                                      channelId: props.message.channelId,
                                      messageId: props.message.id,
                                  },
                              });
                          }
                        : () => {
                              props.sendRequest({
                                  query: "PIN_MESSAGE",
                                  params: {
                                      channelId: props.message.channelId,
                                      messageId: props.message.id,
                                  },
                              });
                          },
                },
                {
                    name: "Reply",
                    icon: "reply",
                    func: () => props.content?.functions?.replyToMessageState(),
                },
                {
                    name: props.message.content ? "Copy Text" : null,
                    icon: "copy",
                    func: () => writeToClip(props.message.content as string),
                },
                {
                    name: props.message.content ? "Translate" : null,
                    icon: "translate",
                    func: () => props.content?.functions?.translateMessage(),
                },
                { name: "Mark Unread", icon: "mark", func: () => {} },
                {
                    name: "Copy Message Link",
                    icon: "link",
                    func: () =>
                        writeToClip(`/channels/@me/${props.message.channelId}/${props.message.id}`),
                },
                {
                    name: props.message.content ? "Speak Message" : null,
                    icon: "speak",
                    func: () => {
                        const msg = new SpeechSynthesisUtterance();
                        msg.text = `${props.message.author.username} said ${props.message.content}`;
                        window.speechSynthesis.speak(msg);
                    },
                },
                {
                    name: props.canDeleteMessage() ? "Delete Message" : null,
                    icon: "delete",
                    func: () => props.content?.functions?.deletePopup(),
                    funcShift: () =>
                        props.sendRequest({
                            query: "DELETE_MESSAGE",
                            params: {
                                channelId: props.message.channelId,
                                messageId: props.message.id,
                            },
                        }),
                    danger: true,
                },
                {
                    name: !props.relationships.self ? "Report Message" : null,
                    icon: "report",
                    func: () => {},
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
                    func: () => writeToClip(props.content?.attachment?.url),
                },
                {
                    name: props.content?.attachment ? "Open Link" : null,
                    func: () => window.open(props.content?.attachment?.url),
                },
                { name: "Divider" },
                {
                    name: "Copy Message ID",
                    icon: "id",

                    func: () => writeToClip(props.message.id),
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
                func: () =>
                    props.sendRequest({
                        query: "REMOVE_FRIEND",
                        data: {
                            username: user.username,
                        },
                    }),
                danger: true,
            },
        ];
    }

    function getChannel({ ...props }) {
        const user = props.content.user;

        if (user) {
            if (props.relationships.self) {
                return [
                    {
                        name: "Profile",
                        func: () => {
                            props.setLayers({
                                settings: {
                                    type: "USER_PROFILE",
                                },
                                content: {
                                    user: currentUser,
                                },
                            });
                        },
                    },
                    {
                        name: "Mention",
                        func: () => props.setMention(currentUser),
                    },
                    { name: "Divider" },
                    {
                        name: "Copy User ID",
                        func: () => writeToClip(currentUser.id),
                        icon: "id",
                    },
                ];
            } else if (props.content?.userprofile) {
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
                        func: () =>
                            props.relationships.sent || props.relationships.friend
                                ? props.sendRequest({
                                      query: "REMOVE_FRIEND",
                                      data: {
                                          username: user.username,
                                      },
                                  })
                                : props.sendRequest({
                                      query: "ADD_FRIEND",
                                      data: { username: user.username },
                                  }),
                        danger: props.relationships.sent || props.relationships.friend,
                    },
                    {
                        name: props.relationships.blocked ? "Unblock" : "Block",
                        func: () =>
                            props.relationships.blocked
                                ? props.sendRequest({
                                      query: "UNBLOCK_USER",
                                      params: { userId: user.id },
                                  })
                                : props.sendRequest({
                                      query: "BLOCK_USER",
                                      params: { userId: user.id },
                                  }),
                        danger: !props.relationships.blocked,
                    },
                    {
                        name: !props.relationships.blocked ? "Message" : null,
                        func: () => {
                            props.sendRequest({
                                query: "CHANNEL_CREATE",
                                data: {
                                    recipients: [user.id],
                                },
                            });
                            props.setLayers({
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
                        func: () => writeToClip(user.id),
                        icon: "id",
                    },
                ];
            } else if (props.relationships.blocked) {
                return [
                    {
                        name: props.content?.channel && "Mark As Read",
                        func: () => {},
                        disabled: true,
                    },
                    { name: props.content?.channel && "Divider" },
                    {
                        name: "Profile",
                        func: () => {
                            props.setLayers({
                                settings: {
                                    type: "USER_PROFILE",
                                },
                                content: {
                                    user: user,
                                },
                            });
                        },
                    },
                    {
                        name: "Message",
                        func: () =>
                            props.sendRequest({
                                query: "CHANNEL_CREATE",
                                data: {
                                    recipients: [user.id],
                                },
                            }),
                    },
                    {
                        name: "Add Note",
                        func: () => {
                            props.setLayers({
                                settings: {
                                    type: "USER_PROFILE",
                                },
                                content: {
                                    user: user,
                                    focusNote: true,
                                },
                            });
                        },
                    },
                    {
                        name: props.content?.channel && "Close DM",
                        func: () =>
                            props.sendRequest({
                                query: "CHANNEL_DELETE",
                                params: { channelId: props.content.channel.id },
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
                            props.sendRequest({
                                query: "UNBLOCK_USER",
                                params: { userId: user.id },
                            }),
                    },
                    { name: "Divider" },
                    {
                        name: props.content?.channel && `Mute @${user.username}`,
                        items: muteItems,
                        func: () => {},
                    },
                    { name: props.content?.channel && "Divider" },
                    {
                        name: "Copy User ID",
                        func: () => writeToClip(user.id),
                        icon: "id",
                    },
                    {
                        name: props.content?.channel && "Copy Channel ID",
                        func: () => writeToClip(props.content.channel.id),
                        icon: "id",
                    },
                ];
            } else {
                return [
                    {
                        name: props.content?.channel && "Mark As Read",
                        func: () => {},
                        disabled: true,
                    },
                    { name: props.content?.channel && "Divider" },
                    {
                        name: "Profile",
                        func: () => {
                            props.setLayers({
                                settings: {
                                    type: "USER_PROFILE",
                                },
                                content: {
                                    user: user,
                                },
                            });
                        },
                    },
                    {
                        name: "Message",
                        func: () =>
                            props.sendRequest({
                                query: "CHANNEL_CREATE",
                                data: {
                                    recipients: [user.id],
                                },
                            }),
                    },
                    {
                        name: !props.relationships.sent ? "Call" : null,
                        func: () => {},
                    },
                    {
                        name: "Add Note",
                        func: () => {
                            props.setLayers({
                                settings: {
                                    type: "USER_PROFILE",
                                },
                                content: {
                                    user: user,
                                    focusNote: true,
                                },
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
                        name: props.content?.channel && "Close DM",
                        func: () =>
                            props.sendRequest({
                                query: "CHANNEL_DELETE",
                                params: { channelId: props.content.channel.id },
                            }),
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
                        func: () =>
                            props.relationships.sent || props.relationships.friend
                                ? props.sendRequest({
                                      query: "REMOVE_FRIEND",
                                      data: { username: user.username },
                                  })
                                : props.sendRequest({
                                      query: "ADD_FRIEND",
                                      data: { username: user.username },
                                  }),
                    },
                    {
                        name: props.relationships.blocked ? "Unblock" : "Block",
                        func: () =>
                            props.relationships.blocked
                                ? props.sendRequest({
                                      query: "UNBLOCK_USER",
                                      params: { userId: user.id },
                                  })
                                : props.sendRequest({
                                      query: "BLOCK_USER",
                                      params: { userId: user.id },
                                  }),
                        danger: !props.relationships.blocked,
                    },
                    { name: "Divider" },
                    {
                        name: props.content?.channel && `Mute @${user.username}`,
                        items: muteItems,
                        func: () => {},
                    },
                    { name: props.content?.channel && "Divider" },
                    {
                        name: "Copy User ID",
                        func: () => writeToClip(user.id),
                        icon: "id",
                    },
                    {
                        name: props.content?.channel && "Copy Channel ID",
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
                        if (props.content.channel.recipients.length == 1) {
                            props.sendRequest({
                                query: "CHANNEL_DELETE",
                                params: {
                                    channelId: props.content.channel.id,
                                },
                            });
                        } else {
                            props.setLayers({
                                settings: {
                                    type: "POPUP",
                                },
                                content: {
                                    type: "LEAVE_CONFIRM",
                                    channel: props.content.channel,
                                },
                            });
                        }
                    },
                    danger: true,
                },
                { name: "Divider" },
                {
                    name: "Copy Channel ID",
                    func: () => writeToClip(props.content.channel.id),
                    icon: "id",
                },
            ];
        }
    }

    function getUserGroup({ ...props }) {
        if (props.relationships.self) {
            return [
                {
                    name: "Profile",
                    func: () => {
                        props.setLayers({
                            settings: {
                                type: "USER_PROFILE",
                                setNull: true,
                            },
                        });
                        setTimeout(() => {
                            props.setLayers({
                                settings: {
                                    type: "USER_PROFILE",
                                },
                                content: {
                                    user: props.user,
                                },
                            });
                        }, 50);
                    },
                },
                {
                    name: "Mention",
                    func: () => props.setMention(props.user),
                },
                { name: "Divider" },
                {
                    name: "Copy User ID",
                    func: () => writeToClip(props.user.id),
                    icon: "id",
                },
            ];
        } else {
            return [
                {
                    name: "Profile",
                    func: () => {
                        props.setLayers({
                            settings: {
                                type: "USER_PROFILE",
                            },
                            content: {
                                user: props.user,
                            },
                        });
                    },
                },
                {
                    name: "Mention",
                    func: () => props.setMention(props.user),
                },
                {
                    name: "Message",
                    func: () =>
                        props.sendRequest({
                            query: "CHANNEL_CREATE",
                            data: {
                                recipients: [props.user.id],
                            },
                        }),
                },
                {
                    name: !props.relationships.sent ? "Call" : null,
                    func: () => {},
                },
                {
                    name: "Add Note",
                    func: () => {
                        props.setLayers({
                            settings: {
                                type: "USER_PROFILE",
                            },
                            content: {
                                user: props.user,
                                focusNote: true,
                            },
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
                    name: props.content.channel.ownerId == currentUser.id ? "Divider" : null,
                },
                {
                    name:
                        props.content.channel.ownerId == currentUser.id
                            ? "Remove From Group"
                            : null,
                    func: () => {
                        props.sendRequest({
                            query: "CHANNEL_RECIPIENT_REMOVE",
                            params: {
                                channelId: props.content.channel.id,
                                recipientId: props.user.id,
                            },
                        });
                    },
                    danger: true,
                },
                {
                    name:
                        props.content.channel.ownerId == currentUser.id ? "Make Group Owner" : null,
                    func: () => {
                        props.setLayers({
                            settings: {
                                type: "POPUP",
                            },
                            content: {
                                type: "GROUP_OWNER_CHANGE",
                                channelId: props.content.channel.id,
                                recipient: props.user,
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
                    func: () =>
                        props.relationships.sent || props.relationships.friend
                            ? props.sendRequest({
                                  query: "REMOVE_FRIEND",
                                  data: { username: props.user.username },
                              })
                            : props.sendRequest({
                                  query: "ADD_FRIEND",
                                  data: { username: props.user.username },
                              }),
                },
                {
                    name: props.relationships.blocked ? "Unblock" : "Block",
                    func: () =>
                        props.relationships.blocked
                            ? props.sendRequest({
                                  query: "UNBLOCK_USER",
                                  params: { userId: props.user.id },
                              })
                            : props.sendRequest({
                                  query: "BLOCK_USER",
                                  params: { userId: props.user.id },
                              }),
                },
                { name: props.content?.channel && "Divider" },
                {
                    name: "Copy User ID",
                    func: () => writeToClip(props.user.id),
                    icon: "id",
                },
            ];
        }
    }

    function getStatus({ ...props }) {
        return [
            {
                name: "Online",
                func: async () => {
                    props.setLayers({
                        settings: {
                            type: "USER_CARD",
                            setNull: true,
                        },
                    });
                    if (currentUser.status !== "ONLINE") {
                        await props.sendRequest({
                            query: "UPDATE_USER",
                            data: {
                                status: "ONLINE",
                            },
                        });
                    }
                },
            },
            {
                name: "Divider",
            },
            {
                name: "Idle",
                func: async () => {
                    props.setLayers({
                        settings: {
                            type: "USER_CARD",
                            setNull: true,
                        },
                    });
                    if (currentUser.status !== "IDLE") {
                        await props.sendRequest({
                            query: "UPDATE_USER",
                            data: {
                                status: "IDLE",
                            },
                        });
                    }
                },
            },
            {
                name: "Do Not Disturb",
                tip: "You will not receive any desktop notifications.",
                func: async () => {
                    props.setLayers({
                        settings: {
                            type: "USER_CARD",
                            setNull: true,
                        },
                    });
                    if (currentUser.status !== "DO_NOT_DISTURB") {
                        await props.sendRequest({
                            query: "UPDATE_USER",
                            data: {
                                status: "DO_NOT_DISTURB",
                            },
                        });
                    }
                },
            },
            {
                name: "Invisible",
                tip: "You will not appear online, but will have full access to all of Chat App.",
                func: async () => {
                    props.setLayers({
                        settings: {
                            type: "USER_CARD",
                            setNull: true,
                        },
                    });
                    if (currentUser.status !== "INVISIBLE") {
                        await props.sendRequest({
                            query: "UPDATE_USER",
                            data: {
                                status: "INVISIBLE",
                            },
                        });
                    }
                },
            },
        ];
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
