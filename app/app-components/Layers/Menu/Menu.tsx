'use client';

import { pinMessage, unpinMessage, deleteMessage } from '@/lib/api-functions/messages';
import { useEffect, useState, ReactElement } from 'react';
import useContextHook from '@/hooks/useContextHook';
import { Icon } from '@/app/app-components';
import styles from './Menu.module.css';
import { v4 as uuidv4 } from 'uuid';

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
    iconInverted?: boolean;
    textTip?: string;
    func?: () => void;
    funcShift?: () => void;
    danger?: boolean;
    disabled?: boolean;
};

const content = ({ content }: { content: any }): ReactElement => {
    const [active, setActive] = useState<string>('');
    const [items, setItems] = useState<ItemType[]>([]);
    const [filteredItems, setFilteredItems] = useState<ItemType[]>([]);
    const [shift, setShift] = useState<boolean>(false);
    const [userProps, setUserProps] = useState<UserProps | null>(null);

    const { userSettings, setUserSettings }: any = useContextHook({ context: 'settings' });
    const { setFixedLayer, setUserProfile }: any = useContextHook({ context: 'layer' });
    const { auth }: any = useContextHook({ context: 'auth' });

    const user: UserType = content.user;
    const message: MessageType = content.message;

    const shouldDisplayInlined = (type: string) => {
        const inlineTypes = [
            'RECIPIENT_ADD',
            'RECIPIENT_REMOVE',
            'CALL',
            'CHANNEL_NAME_CHANGE',
            'CHANNEL_ICON_CHANGE',
            'CHANNEL_PINNED_MESSAGE',
            'GUILD_MEMBER_JOIN',
            'OWNER_CHANGE',
        ];

        return inlineTypes.includes(type);
    };

    const writeText = async (text: string) => {
        await navigator.clipboard.writeText(text);
    };

    const pasteText = async (element: HTMLElement) => {
        const text = await navigator.clipboard.readText();
        element.innerText += text;
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
        setFilteredItems(
            items?.filter((item) => item.name !== 'Divider' && item.name !== null && !item.disabled) || []
        );
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

                const func = filteredItems.find((item) => item.name === active)?.func;
                const funcShift = filteredItems.find((item) => item.name === active)?.funcShift;

                if (active) {
                    setFixedLayer(null);
                    if (shift && funcShift) funcShift();
                    else if (func) func();
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
                isBlocked: auth.user.blockedIds?.includes(content.user.id),
                sentRequest: auth.user.requestSentIds?.includes(content.user.id),
                receivedRequest: auth.user.requestReceivedIds?.includes(content.user.id),
            });
        } else if (content?.message) {
            setUserProps({
                isSelf: content.message.author.id === auth.user.id,
            });
        } else {
            setUserProps(null);
        }
    }, [content]);

    useEffect(() => {
        if (user && typeof userProps?.isFriend !== 'boolean') {
            return;
        } else if (message && typeof userProps?.isSelf !== 'boolean') {
            return;
        } else if (content?.input) {
            setItems([
                {
                    name: content?.sendButton && 'Send Message Button',
                    icon: userSettings?.sendButton ? 'boxFilled' : 'box',
                    iconSize: 18,
                    iconInverted: true,
                    func: () => {
                        setUserSettings({
                            ...userSettings,
                            sendButton: !userSettings?.sendButton,
                        });
                    },
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
                    textTip: 'Ctrl+V',
                    func: () => content?.pasteText(),
                },
            ]);
        } else if (message) {
            if (shouldDisplayInlined(message.type)) {
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
                        func: () => writeText(`/channels/@me/${message.channelId[0]}/${message.id}`),
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
                        icon: 'arrow',
                        iconSize: 10,
                        func: () => {},
                    },
                    {
                        name: userProps.isSelf ? 'Edit Message' : null,
                        icon: 'edit',
                        func: () => content?.editMessageState(),
                    },
                    {
                        name: message.pinned ? 'Unpin Message' : 'Pin Message',
                        icon: 'pin',
                        func: message?.pinned ? () => content?.unpinPopup() : () => content?.pinPopup(),
                        funcShift: message.pinned
                            ? () => unpinMessage(auth.accessToken, message.id)
                            : () => pinMessage(auth.accessToken, message.id),
                    },
                    {
                        name: 'Reply',
                        icon: 'reply',
                        func: () => content?.replyToMessageState(),
                    },
                    {
                        name: 'Copy Text',
                        icon: 'copy',
                        func: () => navigator.clipboard.writeText(message.content),
                    },
                    { name: 'Mark Unread', icon: 'mark', func: () => {} },
                    {
                        name: 'Copy Message Link',
                        icon: 'link',
                        func: () => navigator.clipboard.writeText(`/channels/@me/${message.channel}/${message.id}`),
                    },
                    {
                        name: 'Speak Message',
                        icon: 'speak',
                        func: () => {
                            const msg = new SpeechSynthesisUtterance();
                            msg.lang = 'fr';
                            msg.text = `${message.author.username} said ${message.content}`;
                            window.speechSynthesis.speak(msg);
                        },
                    },
                    {
                        name: userProps.isSelf && 'Delete Message',
                        icon: 'delete',
                        func: () => content?.deletePopup(),
                        funcShift: () => deleteMessage(auth.accessToken, message.id),
                        danger: true,
                    },
                    {
                        name: !userProps.isSelf && 'Report Message',
                        icon: 'report',
                        func: () => {},
                        danger: true,
                    },
                    { name: 'Divider' },
                    {
                        name: 'Copy Message ID',
                        icon: 'id',
                        func: () => navigator.clipboard.writeText(message.id),
                    },
                ]);
            }
        } else if (content?.channel?.type === 'GROUP_DM') {
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
                    func: () => navigator.clipboard.writeText(content.channel.id),
                    icon: 'id',
                },
            ]);
        } else if (user) {
            if (userProps.isSelf) {
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
                        func: () => navigator.clipboard.writeText(user.id),
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
                            !userProps.isBlocked &&
                            (userProps.receivedRequest
                                ? 'Accept Friend Request'
                                : userProps.sentRequest
                                ? 'Cancel Friend Request'
                                : userProps.isFriend
                                ? 'Remove Friend'
                                : 'Add Friend'),
                        func: () => (userProps.sentRequest || userProps.isFriend ? removeFriend() : addFriend()),
                        danger: userProps.sentRequest || userProps.isFriend,
                    },
                    {
                        name: userProps.isBlocked ? 'UnuserProps.isBlocked' : 'Block',
                        func: () => (userProps.isBlocked ? unuserProps.isBlockedUser() : userProps.isBlockedUser()),
                        danger: !userProps.isBlocked,
                    },
                    {
                        name: !userProps.isBlocked && 'Message',
                        func: () => createChannel(),
                    },
                    { name: 'Divider' },
                    {
                        name: 'Copy User ID',
                        func: () => navigator.clipboard.writeText(user.id),
                        icon: 'id',
                    },
                ]);
            } else if (userProps.isBlocked) {
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
                            setTimeout(() => setUserProfile({ user, focusNote: true }), 50);
                        },
                    },
                    { name: 'Divider' },
                    {
                        name: 'UnuserProps.isBlocked',
                        func: () => unuserProps.isBlockedUser(),
                    },
                    { name: 'Divider' },
                    {
                        name: 'Copy User ID',
                        func: () => navigator.clipboard.writeText(user.id),
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
                        name: !userProps.sentRequest && 'Call',
                        func: () => {},
                    },
                    {
                        name: 'Add Note',
                        func: () => {
                            setUserProfile(null);
                            setTimeout(() => setUserProfile({ user, focusNote: true }), 50);
                        },
                    },
                    {
                        name:
                            !(userProps.receivedRequest || userProps.sentRequest || !userProps.isFriend) &&
                            'Add Friend Nickname',
                        func: () => {},
                    },
                    {
                        name: content?.channel && 'Close DM',
                        func: () => removeChannel(),
                    },
                    { name: 'Divider' },
                    {
                        name: !userProps.sentRequest && 'Invite to Server',
                        func: () => {},
                        icon: 'arrow',
                        iconSize: 10,
                    },
                    {
                        name: userProps.receivedRequest
                            ? 'Accept Friend Request'
                            : userProps.sentRequest
                            ? 'Cancel Friend Request'
                            : userProps.isFriend
                            ? 'Remove Friend'
                            : 'Add Friend',
                        func: () => (userProps.sentRequest || userProps.isFriend ? removeFriend() : addFriend()),
                    },
                    {
                        name: userProps.isBlocked ? 'UnuserProps.isBlocked' : 'Block',
                        func: () => (userProps.isBlocked ? unuserProps.isBlockedUser() : userProps.isBlockedUser()),
                        danger: !userProps.isBlocked,
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
                        func: () => navigator.clipboard.writeText(user.id),
                        icon: 'id',
                    },
                    {
                        name: content?.channel && 'Copy Channel ID',
                        func: () => navigator.clipboard.writeText(content.channel.id),
                        icon: 'id',
                    },
                ]);
            }
        }
    }, [userProps, userSettings]);

    return (
        <div
            className={styles.menuContainer}
            onMouseLeave={() => setActive('')}
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
                                    setFixedLayer(null);
                                    if (shift && item.funcShift) item.funcShift();
                                    else if (item.func) item.func();
                                }}
                                onMouseEnter={() => setActive(item.name as string)}
                            >
                                <div className={styles.label}>{item.name}</div>

                                {item.icon && (
                                    <div className={styles.icon}>
                                        <Icon
                                            name={item.icon}
                                            size={item.iconSize ?? 16}
                                        />
                                    </div>
                                )}

                                {item.textTip && <div className={styles.text}>{item.textTip}</div>}
                            </div>
                        );
                })}
            </div>
        </div>
    );
};

export default content;
