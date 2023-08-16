'use client';

import { useEffect, useState, ReactElement, useMemo } from 'react';
import useContextHook from '@/hooks/useContextHook';
import useFetchHelper from '@/hooks/useFetchHelper';
import { shouldDisplayInlined } from '@/lib/message';
import styles from './Menu.module.css';
import { Icon } from '@components';

type UserProps = {
    isSelf: boolean;
    isFriend?: boolean;
    isBlocked?: boolean;
    sentRequest?: boolean;
    receivedRequest?: boolean;
};

type ItemType = {
    name: string | null;
    icon?: string;
    iconSize?: number;
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
    USER = 'USER',
    USER_SMALL = 'USER_SMALL',
    USER_GROUP = 'USER_GROUP',
    CHANNEL = 'CHANNEL',
    MESSAGE = 'MESSAGE',
    INPUT = 'INPUT',
    IMAGE = 'IMAGE',
    GUILD = 'GUILD',
    GUILD_ICON = 'GUILD_ICON',
    GUILD_CHANNEL = 'GUILD_CHANNEL',
    GUILD_CHANNEL_LIST = 'GUILD_CHANNEL_LIST',
}

export const Menu = ({ content }: { content: any }): ReactElement => {
    const [active, setActive] = useState<string>('');
    const [items, setItems] = useState<ItemType[]>([]);
    const [shift, setShift] = useState<boolean>(false);
    const [filteredItems, setFilteredItems] = useState<ItemType[]>([]);
    const [userProps, setUserProps] = useState<UserProps | null>(null);

    const { setFixedLayer, setUserProfile, setPopup }: any = useContextHook({ context: 'layer' });
    const { userSettings, setUserSettings }: any = useContextHook({ context: 'settings' });
    const { auth }: any = useContextHook({ context: 'auth' });
    const { sendRequest } = useFetchHelper();

    const type: EMenuType = content.menu;
    const user: TCleanUser = content.user;
    const message: TMessage = content.message;

    const writeText = async (text: string) => {
        await navigator.clipboard.writeText(text);
    };

    useEffect(() => {
        const handleShift = (e: KeyboardEvent) => {
            if (e.key === 'Shift') setShift(true);
        };

        const handleShiftUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') setShift(false);
        };

        document.addEventListener('keydown', handleShift);
        document.addEventListener('keyup', handleShiftUp);

        return () => {
            document.removeEventListener('keydown', handleShift);
            document.removeEventListener('keyup', handleShiftUp);
        };
    }, []);

    useEffect(() => {
        setFilteredItems(items?.filter((item) => item.name && item.name !== 'Divider' && !item.disabled) || []);
    }, [items]);

    useEffect(() => {
        const handlekeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                setFixedLayer(null);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                e.stopPropagation();

                if (active === null) {
                    setActive(filteredItems[0].name as string);
                } else {
                    const index = filteredItems.findIndex((item) => item.name === active);
                    if (index < filteredItems.length - 1) {
                        setActive(filteredItems[index + 1].name as string);
                    } else {
                        setActive(filteredItems[0].name as string);
                    }
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                e.stopPropagation();

                if (active === null) {
                    setActive(filteredItems[filteredItems.length - 1].name as string);
                } else {
                    const index = filteredItems.findIndex((item) => item.name === active);
                    if (index > 0) {
                        setActive(filteredItems[index - 1].name as string);
                    } else {
                        setActive(filteredItems[filteredItems.length - 1].name as string);
                    }
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();

                const item = filteredItems.find((item) => item.name === active);

                if (item) {
                    if (item?.funcShift) item.funcShift();
                    else if (item?.func) item.func();
                    if ('checked' in item) return;
                    setFixedLayer(null);
                }
            }
        };

        document.addEventListener('keydown', handlekeyDown);

        return () => document.removeEventListener('keydown', handlekeyDown);
    }, [filteredItems, active]);

    useEffect(() => {
        if (content?.user) {
            setUserProps({
                isSelf: content.user.id === auth.user.id,
                isFriend: auth.user.friendIds?.includes(content.user.id),
                isBlocked: auth.user.blockedUserIds?.includes(content.user.id),
                sentRequest: auth.user.requestSentIds?.includes(content.user.id),
                receivedRequest: auth.user.requestReceivedIds?.includes(content.user.id),
            });
        } else if (content?.message) {
            setUserProps({ isSelf: content.message.author.id === auth.user.id });
        } else {
            setUserProps(null);
        }
    }, [content]);

    const muteItems = [
        {
            name: 'For 15 Minutes',
            func: () => {},
        },
        {
            name: 'For 1 Hour',
            func: () => {},
        },
        {
            name: 'For 3 Hours',
            func: () => {},
        },
        {
            name: 'For 8 Hours',
            func: () => {},
        },
        {
            name: 'For 24 Hours',
            func: () => {},
        },
        {
            name: 'Until I turn it back on',
            func: () => {},
        },
    ];

    const notificationItems = [
        {
            name: 'Use Server Default',
            checked: true,
            circle: true,
            func: () => {},
        },
        {
            name: 'All Messages',
            checked: false,
            circle: true,
            func: () => {},
        },
        {
            name: 'Only @mentions',
            checked: false,
            circle: true,
            func: () => {},
        },
        {
            name: 'Nothing',
            checked: false,
            circle: true,
            func: () => {},
        },
    ];

    const serverSettingsItems = [
        {
            name: 'Cool Server Setting',
            func: () => {},
        },
    ];

    const serverItems = [
        {
            name: 'Cool Server',
            func: () => {},
        },
    ];

    const reactionItems = [
        {
            name: 'Cool Reaction',
            func: () => {},
        },
    ];

    useEffect(() => {
        if (!type || (user && !userProps)) return;

        if (type === 'GUILD_CHANNEL_LIST') {
            setItems([
                {
                    name: 'Hide Muted Channels',
                    checked: false,
                    func: () => {},
                },
                {
                    name: 'Divider',
                },
                {
                    name: 'Create Channel',
                    func: () => {
                        setPopup({
                            type: 'GUILD_CHANNEL_CREATE',
                            guild: content.guild.id,
                        });
                    },
                },
                {
                    name: 'Create Category',
                    func: () => {
                        setPopup({
                            type: 'GUILD_CHANNEL_CREATE',
                            guild: content.guild.id,
                            isCategory: true,
                        });
                    },
                },
                {
                    name: 'Invite People',
                    func: () => {},
                },
            ]);
        }

        if (type === 'GUILD_CHANNEL') {
            if (content.channel.type === 4) {
                setItems([
                    {
                        name: 'Mark As Read',
                        disabled: true,
                        func: () => {},
                    },
                    {
                        name: 'Divider',
                    },
                    {
                        name: 'Collapse Category',
                        checked: true,
                        func: () => {},
                    },
                    {
                        name: 'Collapse All Categories',
                        func: () => {},
                    },
                    {
                        name: 'Divider',
                    },
                    {
                        name: 'Mute Category',
                        items: muteItems,
                        func: () => {},
                    },
                    {
                        name: 'Notifications Settings',
                        items: notificationItems,
                        func: () => {},
                    },
                    {
                        name: 'Divider',
                    },
                    {
                        name: 'Edit Category',
                        func: () => {},
                    },
                    {
                        name: 'Delete Category',
                        danger: true,
                        func: () => {
                            setPopup({
                                type: 'GUILD_CHANNEL_DELETE',
                                channel: content.channel,
                            });
                        },
                    },
                    {
                        name: 'Divider',
                    },
                    {
                        name: 'Copy Channel ID',
                        icon: 'id',
                        func: () => writeText(content.channel.id),
                    },
                ]);
            } else {
                setItems([
                    {
                        name: 'Mark As Read',
                        disabled: true,
                        func: () => {},
                    },
                    {
                        name: 'Divider',
                    },
                    {
                        name: 'Invite People',
                        func: () => {},
                    },
                    {
                        name: 'Copy Link',
                        func: () => {},
                    },
                    {
                        name: content.channel.type === 3 ? 'Divider' : null,
                    },
                    {
                        name: content.channel.type === 3 ? 'Open Chat' : null,
                        func: () => {},
                    },
                    {
                        name: content.channel.type === 3 ? 'Hide Names' : null,
                        checked: true,
                        func: () => {},
                    },
                    {
                        name: 'Divider',
                    },
                    {
                        name: 'Mute Channel',
                        items: muteItems,
                        func: () => {},
                    },
                    {
                        name: content.channel.type === 2 ? 'Notifications Settings' : null,
                        items: notificationItems,
                        func: () => {},
                    },
                    {
                        name: 'Divider',
                    },
                    {
                        name: 'Edit Channel',
                        func: () => {},
                    },
                    {
                        name: 'Duplicate Channel',
                        func: () => {},
                    },
                    {
                        name: `Create ${content.channel.type === 2 ? 'Text' : 'Voice'} Channel`,
                        func: () => {
                            const guild = auth.user.guilds.find(
                                (guild: TGuild) => guild.id === content.channel.guildId
                            );
                            const category = guild?.channels.find(
                                (channel: TChannel) => channel.id === content.channel?.parentId
                            );

                            setPopup({
                                type: 'GUILD_CHANNEL_CREATE',
                                guild: content.channel.guildId,
                                category: category ?? null,
                            });
                        },
                    },
                    {
                        name: 'Delete Channel',
                        danger: true,
                        func: () => {
                            setPopup({
                                type: 'GUILD_CHANNEL_DELETE',
                                channel: content.channel,
                            });
                        },
                    },
                    {
                        name: 'Divider',
                    },
                    {
                        name: 'Copy Channel ID',
                        icon: 'id',
                        func: () => writeText(content.channel.id),
                    },
                ]);
            }
        }

        if (type === 'GUILD_ICON') {
            setItems([
                {
                    name: 'Mark As Read',
                    disabled: true,
                    func: () => {},
                },
                {
                    name: 'Divider',
                },
                {
                    name: 'Mute Server',
                    items: muteItems,
                    func: () => {},
                },
                {
                    name: 'Notification Settings',
                    items: notificationItems,
                    func: () => {},
                },
                {
                    name: 'Hide Muted Channels',
                    checked: true,
                    func: () => {},
                },
                {
                    name: 'Divider',
                },
                {
                    name: 'Server Settings',
                    items: serverSettingsItems,
                    func: () => {},
                },
                {
                    name: 'Privacy Settings',
                    func: () => {},
                },
                {
                    name: 'Edit Server Profile',
                    func: () => {},
                },
                {
                    name: 'Divider',
                },
                {
                    name: 'Create Channel',
                    func: () => {},
                },
                {
                    name: 'Create Category',
                    func: () => {},
                },
                {
                    name: 'Create Event',
                    func: () => {},
                },
                {
                    name: 'Divider',
                },
                {
                    name: 'Delete Guild',
                    danger: true,
                    func: () => {
                        sendRequest({
                            query: 'GUILD_DELETE',
                            params: {
                                guildId: content.guild.id,
                            },
                        });
                    },
                },
                {
                    name: 'Divider',
                },
                {
                    name: 'Copy Server ID',
                    icon: 'id',
                    func: () => writeText(content.guild.id),
                },
            ]);
        }

        if (type === 'GUILD') {
            setItems([
                {
                    name: 'Server Boost',
                    icon: 'boost',
                    func: () => {},
                },
                {
                    name: 'Divider',
                },
                {
                    name: 'Invite People',
                    icon: 'addUser',
                    func: () => {},
                },
                {
                    name: 'Invite a Guest',
                    icon: 'addUser',
                    func: () => {},
                },
                {
                    name: 'Server Settings',
                    icon: 'settings',
                    func: () => {},
                },
                {
                    name: 'Create Channel',
                    icon: 'addCircle',
                    func: () => {},
                },
                {
                    name: 'Create Category',
                    icon: 'addFolder',
                    func: () => {},
                },
                {
                    name: 'Create Event',
                    icon: 'calendar',
                    func: () => {},
                },
                {
                    name: 'App Directory',
                    icon: 'bot',
                    func: () => {},
                },
                {
                    name: 'Divider',
                },
                {
                    name: 'Notification Settings',
                    icon: 'bell',
                    func: () => {},
                },
                {
                    name: 'Privacy Settings',
                    icon: 'policeBadge',
                    func: () => {},
                },
                {
                    name: 'Divider',
                },
                {
                    name: 'Edit Server Profile',
                    icon: 'edit',
                    func: () => {},
                },
                {
                    name: 'Hide Muted Channels',
                    checked: false,
                    func: () => {},
                },
                {
                    name: 'Divider',
                },
                {
                    name: 'Report Raid',
                    icon: 'shield',
                    func: () => {},
                    danger: true,
                },
            ]);
        }

        if (type === 'INPUT') {
            setItems([
                {
                    name: content.sendButton && 'Send Message Button',
                    checked: userSettings.sendButton,
                    func: () => {
                        setUserSettings({
                            ...userSettings,
                            sendButton: !userSettings.sendButton,
                        });
                    },
                },
                { name: content.sendButton && 'Divider' },
                {
                    name: 'Spellcheck',
                    checked: false,
                },
                { name: 'Divider' },
                {
                    name: 'Paste',
                    textTip: 'Ctrl+V',
                    func: () => content?.pasteText(),
                },
            ]);
        }

        if (type === 'IMAGE') {
            setItems([
                {
                    name: content.attachment ? 'Copy Image' : null,
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
                    name: content.attachment ? 'Save Image' : null,
                    func: () => {
                        const url = `${process.env.NEXT_PUBLIC_CDN_URL}/${content.attachment.id}/`;

                        fetch(url)
                            .then((res) => res.blob())
                            .then((blob) => {
                                const a = document.createElement('a');
                                a.href = URL.createObjectURL(blob);
                                a.download = content.attachment.name;
                                a.click();
                            });
                    },
                },
                { name: content.attachment ? 'Divider' : null },
                {
                    name: content.attachment ? 'Copy Link' : null,
                    func: () => writeText(`${process.env.NEXT_PUBLIC_CDN_URL}/${content.attachment.id}/`),
                },
                {
                    name: content.attachment ? 'Open Link' : null,
                    func: () => {
                        window.open(`${process.env.NEXT_PUBLIC_CDN_URL}/${content.attachment.id}/`);
                    },
                },
            ]);
        }

        if (type === 'MESSAGE') {
            if (shouldDisplayInlined(message.type)) {
                setItems([
                    {
                        name: 'Add Reaction',
                        items: reactionItems,
                        icon: 'addReaction',
                        func: () => {},
                    },
                    { name: 'Mark Unread', icon: 'mark', func: () => {} },
                    {
                        name: 'Copy Message Link',
                        icon: 'link',
                        func: () => writeText(`/channels/@me/${message.channelId}/${message.id}`),
                    },
                    { name: 'Divider' },
                    {
                        name: 'Copy Message ID',
                        icon: 'id',
                        func: () => writeText(message.id),
                    },
                ]);
            } else {
                setItems([
                    {
                        name: 'Add Reaction',
                        items: reactionItems,
                        icon: 'addReaction',
                        func: () => {},
                    },
                    {
                        name: !!userProps?.isSelf ? 'Edit Message' : null,
                        icon: 'edit',
                        func: () => content?.functions?.editMessageState(),
                    },
                    {
                        name: message.pinned ? 'Unpin Message' : 'Pin Message',
                        icon: 'pin',
                        func: message?.pinned
                            ? () => content?.functions?.unpinPopup()
                            : () => content?.functions?.pinPopup(),
                        funcShift: message.pinned
                            ? () => {
                                  sendRequest({
                                      query: 'UNPIN_MESSAGE',
                                      params: {
                                          channelId: message.channelId,
                                          messageId: message.id,
                                      },
                                  });
                              }
                            : () => {
                                  sendRequest({
                                      query: 'PIN_MESSAGE',
                                      params: {
                                          channelId: message.channelId,
                                          messageId: message.id,
                                      },
                                  });
                              },
                    },
                    {
                        name: 'Reply',
                        icon: 'reply',
                        func: () => content?.functions?.replyToMessageState(),
                    },
                    {
                        name: message.content !== null ? 'Copy Text' : null,
                        icon: 'copy',
                        func: () => writeText(message.content ?? ''),
                    },
                    { name: 'Mark Unread', icon: 'mark', func: () => {} },
                    {
                        name: 'Copy Message Link',
                        icon: 'link',
                        func: () => writeText(`/channels/@me/${message.channelId}/${message.id}`),
                    },
                    {
                        name: message.content !== null ? 'Speak Message' : null,
                        icon: 'speak',
                        func: () => {
                            const msg = new SpeechSynthesisUtterance();
                            msg.text = `${message.author.username} said ${message.content}`;
                            window.speechSynthesis.speak(msg);
                        },
                    },
                    {
                        name: !!userProps?.isSelf ? 'Delete Message' : null,
                        icon: 'delete',
                        func: () => content?.functions?.deletePopup(),
                        funcShift: () =>
                            sendRequest({
                                query: 'DELETE_MESSAGE',
                                params: {
                                    channelId: message.channelId,
                                    messageId: message.id,
                                },
                            }),
                        danger: true,
                    },
                    {
                        name: !userProps?.isSelf ? 'Report Message' : null,
                        icon: 'report',
                        func: () => {},
                        danger: true,
                    },
                    { name: content?.attachment ? 'Divider' : null },
                    {
                        name: content?.attachment ? 'Copy Image' : null,
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
                        name: content?.attachment ? 'Save Image' : null,
                        func: () => {
                            const url = `${process.env.NEXT_PUBLIC_CDN_URL}/${content.attachment.id}/`;

                            fetch(url)
                                .then((res) => res.blob())
                                .then((blob) => {
                                    const a = document.createElement('a');
                                    a.href = URL.createObjectURL(blob);
                                    a.download = content.attachment.name;
                                    a.click();
                                });
                        },
                    },
                    { name: content?.attachment ? 'Divider' : null },
                    {
                        name: content?.attachment ? 'Copy Link' : null,
                        func: () => writeText(`${process.env.NEXT_PUBLIC_CDN_URL}/${content.attachment.id}/`),
                    },
                    {
                        name: content?.attachment ? 'Open Link' : null,
                        func: () => {
                            window.open(`${process.env.NEXT_PUBLIC_CDN_URL}/${content.attachment.id}/`);
                        },
                    },
                    { name: 'Divider' },
                    {
                        name: 'Copy Message ID',
                        icon: 'id',
                        func: () => writeText(message.id),
                    },
                ]);
            }
        }

        if (type === 'USER_SMALL') {
            setItems([
                {
                    name: 'Start Video Call',
                    func: () => {},
                },
                {
                    name: 'Start Voice Call',
                    func: () => {},
                },
                {
                    name: 'Remove Friend',
                    func: () =>
                        sendRequest({
                            query: 'REMOVE_FRIEND',
                            params: {
                                username: user.username,
                            },
                        }),
                    danger: true,
                },
            ]);
        }

        if (type === 'USER' || type === 'CHANNEL') {
            if (user) {
                if (userProps?.isSelf) {
                    setItems([
                        {
                            name: 'Profile',
                            func: () => {
                                setUserProfile(null);
                                setTimeout(() => setUserProfile({ user }), 50);
                            },
                        },
                        {
                            name: 'Mention',
                            func: () => {},
                        },
                        { name: 'Divider' },
                        {
                            name: 'Copy User ID',
                            func: () => writeText(user.id),
                            icon: 'id',
                        },
                    ]);
                } else if (content?.userprofile) {
                    setItems([
                        {
                            name: !userProps?.isBlocked
                                ? userProps?.receivedRequest
                                    ? 'Accept Friend Request'
                                    : userProps?.sentRequest
                                    ? 'Cancel Friend Request'
                                    : userProps?.isFriend
                                    ? 'Remove Friend'
                                    : 'Add Friend'
                                : null,
                            func: () =>
                                userProps?.sentRequest || userProps?.isFriend
                                    ? sendRequest({
                                          query: 'REMOVE_FRIEND',
                                          params: {
                                              username: user.username,
                                          },
                                      })
                                    : sendRequest({
                                          query: 'ADD_FRIEND',
                                          params: {
                                              username: user.username,
                                          },
                                      }),
                            danger: userProps?.sentRequest || userProps?.isFriend,
                        },
                        {
                            name: userProps?.isBlocked ? 'Unblock' : 'Block',
                            func: () =>
                                userProps?.isBlocked
                                    ? sendRequest({
                                          query: 'UNBLOCK_USER',
                                          params: {
                                              username: user.username,
                                          },
                                      })
                                    : sendRequest({
                                          query: 'BLOCK_USER',
                                          params: {
                                              username: user.username,
                                          },
                                      }),
                            danger: !userProps?.isBlocked,
                        },
                        {
                            name: !userProps?.isBlocked ? 'Message' : null,
                            func: () =>
                                sendRequest({
                                    query: 'CHANNEL_CREATE',
                                    data: {
                                        recipients: [user.id],
                                    },
                                }),
                        },
                        { name: 'Divider' },
                        {
                            name: 'Copy User ID',
                            func: () => writeText(user.id),
                            icon: 'id',
                        },
                    ]);
                } else if (userProps?.isBlocked) {
                    setItems([
                        {
                            name: 'Profile',
                            func: () => {
                                setUserProfile(null);
                                setTimeout(() => setUserProfile({ user }), 50);
                            },
                        },
                        {
                            name: 'Message',
                            func: () =>
                                sendRequest({
                                    query: 'CHANNEL_CREATE',
                                    data: {
                                        recipients: [user.id],
                                    },
                                }),
                        },
                        {
                            name: 'Add Note',
                            func: () => setUserProfile({ user, focusNote: true }),
                        },
                        { name: 'Divider' },
                        {
                            name: 'Unblock User',
                            func: () =>
                                sendRequest({
                                    query: 'UNBLOCK_USER',
                                    params: {
                                        username: user.username,
                                    },
                                }),
                        },
                        { name: 'Divider' },
                        {
                            name: 'Copy User ID',
                            func: () => writeText(user.id),
                            icon: 'id',
                        },
                    ]);
                } else {
                    setItems([
                        {
                            name: content?.channel && 'Mark As Read',
                            func: () => {},
                            disabled: true,
                        },
                        { name: content?.channel && 'Divider' },
                        {
                            name: 'Profile',
                            func: () => setUserProfile({ user }),
                        },
                        {
                            name: 'Message',
                            func: () =>
                                sendRequest({
                                    query: 'CHANNEL_CREATE',
                                    data: {
                                        recipients: [user.id],
                                    },
                                }),
                        },
                        {
                            name: !userProps?.sentRequest ? 'Call' : null,
                            func: () => {},
                        },
                        {
                            name: 'Add Note',
                            func: () => setUserProfile({ user, focusNote: true }),
                        },
                        {
                            name: !(userProps?.receivedRequest || userProps?.sentRequest || !userProps?.isFriend)
                                ? 'Add Friend Nickname'
                                : null,
                            func: () => {},
                        },
                        {
                            name: content?.channel && 'Close DM',
                            func: () =>
                                sendRequest({
                                    query: 'CHANNEL_DELETE',
                                    params: { channelId: content.channel.id },
                                }),
                        },
                        { name: 'Divider' },
                        {
                            name: !userProps?.sentRequest ? 'Invite to Server' : null,
                            items: serverItems,
                            func: () => {},
                        },
                        {
                            name: userProps?.receivedRequest
                                ? 'Accept Friend Request'
                                : userProps?.sentRequest
                                ? 'Cancel Friend Request'
                                : userProps?.isFriend
                                ? 'Remove Friend'
                                : 'Add Friend',
                            func: () =>
                                userProps?.sentRequest || userProps?.isFriend
                                    ? sendRequest({
                                          query: 'REMOVE_FRIEND',
                                          params: { username: user.username },
                                      })
                                    : sendRequest({
                                          query: 'ADD_FRIEND',
                                          params: { username: user.username },
                                      }),
                        },
                        {
                            name: userProps?.isBlocked ? 'UnuserProps.isBlocked' : 'Block',
                            func: () =>
                                userProps?.isBlocked
                                    ? sendRequest({
                                          query: 'UNBLOCK_USER',
                                          params: { username: user.username },
                                      })
                                    : sendRequest({
                                          query: 'BLOCK_USER',
                                          params: { username: user.username },
                                      }),
                            danger: !userProps?.isBlocked,
                        },
                        { name: 'Divider' },
                        {
                            name: content?.channel && `Mute @${user.username}`,
                            items: muteItems,
                            func: () => {},
                        },
                        { name: content?.channel && 'Divider' },
                        {
                            name: 'Copy User ID',
                            func: () => writeText(user.id),
                            icon: 'id',
                        },
                        {
                            name: content?.channel && 'Copy Channel ID',
                            func: () => writeText(content.channel.id),
                            icon: 'id',
                        },
                    ]);
                }
            } else {
                setItems([
                    {
                        name: 'Mark As Read',
                        disabled: true,
                        func: () => {},
                    },
                    { name: 'Divider' },
                    {
                        func: () => {},
                        name: 'Invites',
                    },
                    {
                        name: 'Change Icon',
                        func: () => {},
                    },
                    { name: 'Divider' },
                    {
                        name: 'Mute Conversation',
                        items: muteItems,
                        func: () => {},
                    },
                    { name: 'Divider' },
                    {
                        name: 'Leave Group',
                        func: () => {
                            if (content.channel.recipients.length === 1) {
                                sendRequest({
                                    query: 'CHANNEL_DELETE',
                                    params: {
                                        channelId: content.channel.id,
                                    },
                                });
                            } else {
                                sendRequest({
                                    query: 'CHANNEL_RECIPIENT_REMOVE',
                                    params: {
                                        channelId: content.channel.id,
                                        recipientId: auth.user.id,
                                    },
                                });
                            }
                        },
                        danger: true,
                    },
                    { name: 'Divider' },
                    {
                        name: 'Copy Channel ID',
                        func: () => writeText(content.channel.id),
                        icon: 'id',
                    },
                ]);
            }
        }

        if (type === 'USER_GROUP') {
            if (userProps?.isSelf) {
                setItems([
                    {
                        name: 'Profile',
                        func: () => {
                            setUserProfile(null);
                            setTimeout(() => setUserProfile({ user }), 50);
                        },
                    },
                    {
                        name: 'Mention',
                        func: () => {},
                    },
                    { name: 'Divider' },
                    {
                        name: 'Copy User ID',
                        func: () => writeText(user.id),
                        icon: 'id',
                    },
                ]);
            } else {
                setItems([
                    {
                        name: 'Profile',
                        func: () => setUserProfile({ user }),
                    },
                    {
                        name: 'Mention',
                        func: () => {},
                    },
                    {
                        name: 'Message',
                        func: () =>
                            sendRequest({
                                query: 'CHANNEL_CREATE',
                                data: {
                                    recipients: [user.id],
                                },
                            }),
                    },
                    {
                        name: !userProps?.sentRequest ? 'Call' : null,
                        func: () => {},
                    },
                    {
                        name: 'Add Note',
                        func: () => setUserProfile({ user, focusNote: true }),
                    },
                    {
                        name: !(userProps?.receivedRequest || userProps?.sentRequest || !userProps?.isFriend)
                            ? 'Add Friend Nickname'
                            : null,
                        func: () => {},
                    },
                    { name: 'Divider' },
                    {
                        name: 'Remove From Group',
                        func: () => {
                            sendRequest({
                                query: 'CHANNEL_RECIPIENT_REMOVE',
                                params: {
                                    channelId: content.channel.id,
                                    recipientId: user.id,
                                },
                            });
                        },
                        danger: true,
                    },
                    {
                        name: 'Make Group Owner',
                        func: () => {},
                        danger: true,
                    },
                    { name: 'Divider' },
                    {
                        name: !userProps?.sentRequest ? 'Invite to Server' : null,
                        items: serverItems,
                        func: () => {},
                    },
                    {
                        name: userProps?.receivedRequest
                            ? 'Accept Friend Request'
                            : userProps?.sentRequest
                            ? 'Cancel Friend Request'
                            : userProps?.isFriend
                            ? 'Remove Friend'
                            : 'Add Friend',
                        func: () =>
                            userProps?.sentRequest || userProps?.isFriend
                                ? sendRequest({
                                      query: 'REMOVE_FRIEND',
                                      params: { username: user.username },
                                  })
                                : sendRequest({
                                      query: 'ADD_FRIEND',
                                      params: { username: user.username },
                                  }),
                    },
                    {
                        name: userProps?.isBlocked ? 'Unblock' : 'Block',
                        func: () =>
                            userProps?.isBlocked
                                ? sendRequest({
                                      query: 'UNBLOCK_USER',
                                      params: { username: user.username },
                                  })
                                : sendRequest({
                                      query: 'BLOCK_USER',
                                      params: { username: user.username },
                                  }),
                    },
                    { name: content?.channel && 'Divider' },
                    {
                        name: 'Copy User ID',
                        func: () => writeText(user.id),
                        icon: 'id',
                    },
                ]);
            }
        }
    }, [
        userProps,
        userSettings,
        auth.user.friendIds,
        auth.user.requestReceivedIds,
        auth.user.requestSentIds,
        auth.user.blockedUserIds,
        auth.user.blockedByUserIds,
    ]);

    return useMemo(
        () => (
            <div
                className={`${styles.menuContainer} ${type === 'GUILD' ? 'big' : ''}`}
                onMouseLeave={() => setActive('')}
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                style={{
                    width: type === 'GUILD' ? 220 : '',
                    transform: type === 'GUILD' ? 'translateX(+10px)' : '',
                }}
            >
                <div>
                    {items?.map((item, index) => {
                        if (!item.name) return;
                        else if (item.name === 'Divider')
                            return (
                                <div
                                    key={index}
                                    className={styles.divider}
                                />
                            );
                        else
                            return (
                                <div
                                    key={index}
                                    className={
                                        item.disabled
                                            ? styles.menuItemDisabled
                                            : item.danger
                                            ? active === item.name
                                                ? styles.menuItemDangerActive
                                                : styles.menuItemDanger
                                            : active === item.name
                                            ? styles.menuItemActive
                                            : styles.menuItem
                                    }
                                    onClick={() => {
                                        if (item.disabled) return;
                                        if (shift && item.funcShift) item.funcShift();
                                        else if (item.func) item.func();
                                        if ('checked' in item) return;
                                        setFixedLayer(null);
                                    }}
                                    onMouseEnter={() => setActive(item.name as string)}
                                >
                                    <div className={styles.label}>{item.name}</div>

                                    {(item.icon || 'checked' in item || 'items' in item) && (
                                        <div
                                            className={`${styles.icon} ${
                                                'checked' in item && item.checked ? styles.revert : ''
                                            }`}
                                            style={{
                                                transform: 'items' in item ? 'rotate(-90deg)' : '',
                                            }}
                                        >
                                            <Icon
                                                name={
                                                    'checked' in item
                                                        ? item.checked
                                                            ? 'checkboxFilled'
                                                            : 'checkbox'
                                                        : 'items' in item
                                                        ? 'arrowSmall'
                                                        : item.icon ?? ''
                                                }
                                                size={item.iconSize ?? type === 'GUILD' ? 18 : 16}
                                                viewbox={item.icon === 'boost' ? '0 0 8 12' : ''}
                                            />
                                        </div>
                                    )}

                                    {item.textTip && <div className={styles.text}>{item.textTip}</div>}
                                </div>
                            );
                    })}
                </div>
            </div>
        ),
        [items, shift, active]
    );
};
