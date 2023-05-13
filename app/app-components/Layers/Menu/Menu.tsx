// @ts-nocheck

'use client';

import { useEffect, useState, ReactElement } from 'react';
import useAxiosPrivate from '@/hooks/useAxiosPrivate';
import useContextHook from '@/hooks/useContextHook';
import { useRouter } from 'next/navigation';
import { Icon } from '@/app/app-components';
import styles from './Menu.module.css';
import { v4 as uuidv4 } from 'uuid';

const content = ({ content }: any): ReactElement => {
    const [active, setActive] = useState(null);
    const [items, setItems] = useState([]);
    const [shift, setShift] = useState(false);
    const [self, setSelf] = useState(false);
    const [friend, setFriend] = useState(false);
    const [block, setBlock] = useState(false);
    const [outgoing, setOutgoing] = useState(false);
    const [incoming, setIncoming] = useState(false);

    const { auth }: any = useContextHook({ context: 'auth' });
    const axiosPrivate = useAxiosPrivate();
    const { userSettings, setUserSettings }: any = useContextHook({
        context: 'settings',
    });
    const { setFixedLayer, setUserProfile, setPopup }: any = useContextHook({
        context: 'layer',
    });

    const router = useRouter();
    const user = content?.user || null;
    const message = content?.message || null;
    let menuItems: any;

    useEffect(() => {
        const handleShift = (e) => {
            if (e.key === 'Shift') setShift(true);
        };

        const handleShiftUp = (e) => {
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
        menuItems = items?.filter(
            (item) =>
                item.name !== 'Divider' &&
                item.name !== null &&
                item.name !== false &&
                !item?.disabled
        );

        const handlekeyDown = (e) => {
            if (e.key === 'Escape') {
                setFixedLayer(null);
            } else if (e.key === 'ArrowDown') {
                if (active === null) {
                    setActive(menuItems[0].name);
                } else {
                    const index = menuItems.findIndex(
                        (item) => item.name === active
                    );
                    if (index < menuItems.length - 1) {
                        setActive(menuItems[index + 1].name);
                    } else {
                        setActive(menuItems[0].name);
                    }
                }
            } else if (e.key === 'ArrowUp') {
                if (active === null) {
                    setActive(menuItems[menuItems.length - 1].name);
                } else {
                    const index = menuItems.findIndex(
                        (item) => item.name === active
                    );
                    if (index > 0) {
                        setActive(menuItems[index - 1].name);
                    } else {
                        setActive(menuItems[menuItems.length - 1].name);
                    }
                }
            } else if (e.key === 'Enter') {
                const func = menuItems
                    .find((item) => item.name === active)
                    ?.func();
                const funcShift = menuItems
                    .find((item) => item.name === active)
                    ?.funcShift();

                if (active) {
                    setFixedLayer(null);
                    if (shift && funcShift) {
                        funcShift();
                        return;
                    }
                    func();
                }
            }
        };

        document.addEventListener('keydown', handlekeyDown);

        return () => document.removeEventListener('keydown', handlekeyDown);
    }, [active, items]);

    useEffect(() => {
        if (user) {
            setSelf(content?.user?._id === auth?.user?._id);
        } else if (content?.message) {
            setSelf(
                content?.message?.author?._id.toString() === auth?.user?._id
            );
        }
    }, [content, user, message, auth]);

    useEffect(() => {
        if (content?.input) {
            setItems([
                {
                    name: content?.sendButton && 'Send Message Button',
                    icon: userSettings?.sendButton ? 'boxFilled' : 'box',
                    iconSize: 18,
                    iconFill: userSettings?.sendButton && 'var(--accent-1)',
                    iconFill2:
                        userSettings?.sendButton && 'var(--foreground-1)',
                    iconFill2Hover: 'var(--accent-1)',
                    func: () =>
                        setUserSettings({
                            ...userSettings,
                            sendButton: !userSettings?.sendButton,
                        }),
                    menuOpen: true,
                },
                { name: content?.sendButton && 'Divider' },
                {
                    name: 'Spellcheck',
                    icon: 'box',
                    iconSize: 18,
                },
                { name: 'Divider' },
                {
                    name: 'Paste',
                    text: 'Ctrl+V',
                    func: () => content?.pasteText(),
                },
            ]);
        } else if (message) {
            if (message?.type === 2) {
                setItems([
                    {
                        name: 'Add Reaction',
                        icon: 'arrow',
                        iconSize: 10,
                        func: () => {},
                    },
                    { name: 'Mark Unread', icon: 'mark', func: () => {} },
                    {
                        name: 'Copy Message Link',
                        icon: 'link',
                        func: () =>
                            navigator.clipboard.writeText(
                                `/channels/@me/${message?.channel}/${message?._id}`
                            ),
                    },
                    { name: 'Divider' },
                    {
                        name: 'Copy Message ID',
                        icon: 'id',
                        func: () => navigator.clipboard.writeText(message?._id),
                    },
                ]);
            } else {
                setItems([
                    {
                        name: 'Add Reaction',
                        icon: 'arrow',
                        iconSize: 10,
                        func: () => {},
                    },
                    {
                        name: self && 'Edit Message',
                        icon: 'edit',
                        func: () => content?.editMessage(),
                    },
                    {
                        name: message?.pinned ? 'Unpin Message' : 'Pin Message',
                        icon: 'pin',
                        func: message?.pinned
                            ? () => content?.unpinPopup()
                            : () => content?.pinPopup(),
                        funcShift: message?.pinned
                            ? () => content?.unpinMessage()
                            : () => content?.pinMessage(),
                    },
                    {
                        name: 'Reply',
                        icon: 'reply',
                        func: () => content?.replyToMessage(),
                    },
                    { name: 'Mark Unread', icon: 'mark', func: () => {} },
                    {
                        name: 'Copy Message Link',
                        icon: 'link',
                        func: () =>
                            navigator.clipboard.writeText(
                                `/channels/@me/${message?.channel}/${message?._id}`
                            ),
                    },
                    { name: 'Speak Message', icon: 'speak', func: () => {} },
                    {
                        name: self && 'Delete Message',
                        icon: 'delete',
                        func: () => content?.deletePopup(),
                        funcShift: () => content?.deleteMessage(),
                        danger: true,
                    },
                    {
                        name: !self && 'Report Message',
                        icon: 'report',
                        func: () => {},
                        danger: true,
                    },
                    { name: 'Divider' },
                    {
                        name: 'Copy Message ID',
                        icon: 'id',
                        func: () => navigator.clipboard.writeText(message?._id),
                    },
                ]);
            }
        } else if (content?.channel?.type === 1) {
            setItems([
                {
                    name: 'Mark As Read',
                    func: () => {},
                    disabled: true,
                },
                { name: 'Divider' },
                {
                    name: 'Invites',
                    func: () => {},
                },
                {
                    name: 'Change Icon',
                    func: () => {},
                },
                { name: 'Divider' },
                {
                    name: 'Mute Conversation',
                    func: () => {},
                    icon: 'arrow',
                    iconSize: 10,
                },
                { name: 'Divider' },
                {
                    name: 'Leave Group',
                    func: () => leaveChannel(),
                    danger: true,
                },
                { name: 'Divider' },
                {
                    name: 'Copy Channel ID',
                    func: () =>
                        navigator.clipboard.writeText(content?.channel?._id),
                    icon: 'id',
                },
            ]);
        } else if (content?.user) {
            if (self) {
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
                        func: () => navigator.clipboard.writeText(user._id),
                        icon: 'id',
                    },
                ]);
            } else if (content?.userlist) {
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
                        func: () => removeFriend(),
                        danger: true,
                    },
                ]);
            } else if (content?.userprofile) {
                setItems([
                    {
                        name:
                            !block &&
                            (incoming
                                ? 'Accept Friend Request'
                                : outgoing
                                ? 'Cancel Friend Request'
                                : friend
                                ? 'Remove Friend'
                                : 'Add Friend'),
                        func: () =>
                            outgoing || friend ? removeFriend() : addFriend(),
                        danger: outgoing || friend,
                    },
                    {
                        name: block ? 'Unblock' : 'Block',
                        func: () => (block ? unblockUser() : blockUser()),
                        danger: !block,
                    },
                    {
                        name: !block && 'Message',
                        func: () => createChannel(),
                    },
                    { name: 'Divider' },
                    {
                        name: 'Copy User ID',
                        func: () => navigator.clipboard.writeText(user._id),
                        icon: 'id',
                    },
                ]);
            } else if (block) {
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
                        func: () => createChannel(),
                    },
                    {
                        name: 'Add Note',
                        func: () => {
                            setUserProfile(null);
                            setTimeout(
                                () => setUserProfile({ user, focusNote: true }),
                                50
                            );
                        },
                    },
                    { name: 'Divider' },
                    {
                        name: 'Unblock',
                        func: () => unblockUser(),
                    },
                    { name: 'Divider' },
                    {
                        name: 'Copy User ID',
                        func: () => navigator.clipboard.writeText(user._id),
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
                        func: () => {
                            setUserProfile(null);
                            setTimeout(() => setUserProfile({ user }), 50);
                        },
                    },
                    {
                        name: 'Message',
                        func: () => createChannel(),
                    },
                    {
                        name: !outgoing && 'Call',
                        func: () => {},
                    },
                    {
                        name: 'Add Note',
                        func: () => {
                            setUserProfile(null);
                            setTimeout(
                                () => setUserProfile({ user, focusNote: true }),
                                50
                            );
                        },
                    },
                    {
                        name:
                            !(incoming || outgoing || !friend) &&
                            'Add Friend Nickname',
                        func: () => {},
                    },
                    {
                        name: content?.channel && 'Close DM',
                        func: () => removeChannel(),
                    },
                    { name: 'Divider' },
                    {
                        name: !outgoing && 'Invite to Server',
                        func: () => {},
                        icon: 'arrow',
                        iconSize: 10,
                    },
                    {
                        name: incoming
                            ? 'Accept Friend Request'
                            : outgoing
                            ? 'Cancel Friend Request'
                            : friend
                            ? 'Remove Friend'
                            : 'Add Friend',
                        func: () =>
                            outgoing || friend ? removeFriend() : addFriend(),
                    },
                    {
                        name: block ? 'Unblock' : 'Block',
                        func: () => (block ? unblockUser() : blockUser()),
                        danger: !block,
                    },
                    { name: 'Divider' },
                    {
                        name: content?.channel && `Mute @${user.username}`,
                        func: () => {},
                        icon: 'arrow',
                        iconSize: 10,
                    },
                    { name: content?.channel && 'Divider' },
                    {
                        name: 'Copy User ID',
                        func: () => navigator.clipboard.writeText(user._id),
                        icon: 'id',
                    },
                    {
                        name: content?.channel && 'Copy Channel ID',
                        func: () =>
                            navigator.clipboard.writeText(
                                content?.channel?._id
                            ),
                        icon: 'id',
                    },
                ]);
            }
        }
    }, [self, friend, block, incoming, outgoing, userSettings, content]);

    return (
        <div
            className={styles.menuContainer}
            onMouseLeave={() => setActive(null)}
        >
            <div>
                {items?.map((item) => {
                    if (!item.name) return;
                    else if (item.name === 'Divider')
                        return (
                            <div
                                key={uuidv4()}
                                className={styles.divider}
                            />
                        );
                    else
                        return (
                            <div
                                key={uuidv4()}
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
                                    if (!item.menuOpen) {
                                        setFixedLayer(null);
                                    }
                                    if (shift && item.funcShift) {
                                        item.funcShift();
                                        return;
                                    }
                                    item.func();
                                }}
                                onMouseEnter={() => setActive(item.name)}
                            >
                                <div className={styles.label}>{item.name}</div>

                                {item.icon && (
                                    <div className={styles.icon}>
                                        <Icon
                                            name={item.icon}
                                            size={item.iconSize ?? 16}
                                            fill={
                                                item.iconFill
                                                    ? item.iconFill
                                                    : active === item.name
                                                    ? 'var(--foreground-1)'
                                                    : ''
                                            }
                                            fill2={
                                                item.iconFill2 &&
                                                (active === item.name
                                                    ? item.iconFill2Hover
                                                    : item.iconFill2)
                                            }
                                        />
                                    </div>
                                )}

                                {item.text && (
                                    <div className={styles.text}>
                                        {item.text}
                                    </div>
                                )}
                            </div>
                        );
                })}
            </div>
        </div>
    );
};

export default content;
