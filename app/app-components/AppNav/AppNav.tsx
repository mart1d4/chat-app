'use client';

import { ReactElement, useEffect, useState, useMemo, useCallback } from 'react';
import useContextHook from '@/hooks/useContextHook';
import pusher from '@/lib/pusher/client-connection';
import { usePathname } from 'next/navigation';
import styles from './AppNav.module.css';
import NavIcon from './NavIcon';

const AppNav = (): ReactElement => {
    const [url, setUrl] = useState<string>('/channels/me');
    const [trigger, setTrigger] = useState<any>(null);
    const [notifDM, setNotifDM] = useState<TNotification[]>([]);

    const { auth, setAuth }: any = useContextHook({ context: 'auth' });
    const pathname = usePathname();

    useEffect(() => {
        if (pathname.startsWith('/channels/me')) {
            localStorage.setItem('channel-url', pathname);
            setUrl(pathname);
        }
    }, [pathname]);

    useEffect(() => {
        if (auth.user.notifications.length) {
            const filtered = auth.user.notifications.filter((notification: any) =>
                auth.user.channelIds.includes(notification?.channel)
            );

            const notifications = filtered.map((notification: any) => {
                const channel = auth.user.channels.find((channel: any) => channel.id === notification?.channel);

                let name = channel?.name;
                if (channel.type === 'DM') {
                    const user = channel.recipients.find((user: any) => user.id !== auth.user.id);
                    name = user?.username;
                } else if (channel.type === 'GROUP_DM' && !channel.name) {
                    const filteredMembers = channel.recipients.filter((user: any) => user.id !== auth.user.id);
                    name = filteredMembers.map((user: any) => user.username).join(', ');
                }

                let src = `${process.env.NEXT_PUBLIC_CDN_URL}${channel?.icon}/`;
                if (channel.type === 'DM') {
                    const user = channel.recipients.find((user: any) => user.id !== auth.user.id);
                    src = `${process.env.NEXT_PUBLIC_CDN_URL}${user.avatar}/`;
                }

                return {
                    channel: {
                        ...channel,
                        name: name,
                        icon: src,
                    },
                    count: notification?.count,
                };
            });

            setNotifDM(notifications);
        }
    }, [auth.user.notifications]);

    useEffect(() => {
        pusher.bind('user-updated', (data: any) => updateUserData(data));
        pusher.bind('relationship-updated', (data: any) => updateRelationship(data));
        pusher.bind('message-sent', (data: any) => setTrigger(data));

        return () => {
            pusher.unbind('user-updated');
            pusher.unbind('message-sent');
            pusher.unbind('relationship-updated');
        };
    }, []);

    const addFriend = useCallback(
        (user: TCleanUser) => {
            setAuth({
                ...auth,
                user: {
                    ...auth.user,
                    friendIds: [...auth.user.friendIds, user.id],
                    friends: [...auth.user.friends, user],
                    requestReceivedIds: auth.user.requestReceivedIds.filter((id: string) => id !== user.id),
                    requestReceived: auth.user.requestReceived.filter((user2: TCleanUser) => user2.id !== user.id),
                    requestSentIds: auth.user.requestSentIds.filter((id: string) => id !== user.id),
                    requestSent: auth.user.requestSent.filter((user2: TCleanUser) => user2.id !== user.id),
                },
            });
        },
        [auth.user]
    );

    const removeFriend = useCallback(
        (user: TCleanUser) => {
            setAuth({
                ...auth,
                user: {
                    ...auth.user,
                    friendIds: auth.user.friendIds.filter((id: string) => id !== user.id),
                    friends: auth.user.friends.filter((user2: TCleanUser) => user2.id !== user.id),
                    requestReceivedIds: auth.user.requestReceivedIds.filter((id: string) => id !== user.id),
                    requestReceived: auth.user.requestReceived.filter((user2: TCleanUser) => user2.id !== user.id),
                    requestSentIds: auth.user.requestSentIds.filter((id: string) => id !== user.id),
                    requestSent: auth.user.requestSent.filter((user2: TCleanUser) => user2.id !== user.id),
                },
            });
        },
        [auth.user]
    );

    const addFriendRequest = useCallback(
        (user: TCleanUser, type: 'SENT' | 'RECEIVED') => {
            if (type === 'SENT') {
                setAuth({
                    ...auth,
                    user: {
                        ...auth.user,
                        requestSentIds: [...auth.user.requestSentIds, user.id],
                        requestSent: [...auth.user.requestSent, user],
                    },
                });
            } else {
                setAuth({
                    ...auth,
                    user: {
                        ...auth.user,
                        requestReceivedIds: [...auth.user.requestReceivedIds, user.id],
                        requestReceived: [...auth.user.requestReceived, user],
                    },
                });
            }
        },
        [auth.user]
    );

    const blockUser = useCallback(
        (user: TCleanUser, type: 'SENT' | 'RECEIVED') => {
            if (type === 'SENT') {
                setAuth({
                    ...auth,
                    user: {
                        ...auth.user,
                        friendIds: auth.user.friendIds.filter((id: string) => id !== user.id),
                        friends: auth.user.friends.filter((user2: TCleanUser) => user2.id !== user.id),
                        requestReceivedIds: auth.user.requestReceivedIds.filter((id: string) => id !== user.id),
                        requestReceived: auth.user.requestReceived.filter((user2: TCleanUser) => user2.id !== user.id),
                        requestSentIds: auth.user.requestSentIds.filter((id: string) => id !== user.id),
                        requestSent: auth.user.requestSent.filter((user2: TCleanUser) => user2.id !== user.id),
                        blockedIds: [...auth.user.blockedIds, user.id],
                        blocked: [...auth.user.blocked, user],
                    },
                });
            } else {
                setAuth({
                    ...auth,
                    user: {
                        ...auth.user,
                        friendIds: auth.user.friendIds.filter((id: string) => id !== user.id),
                        friends: auth.user.friends.filter((user2: TCleanUser) => user2.id !== user.id),
                        requestReceivedIds: auth.user.requestReceivedIds.filter((id: string) => id !== user.id),
                        requestReceived: auth.user.requestReceived.filter((user2: TCleanUser) => user2.id !== user.id),
                        requestSentIds: auth.user.requestSentIds.filter((id: string) => id !== user.id),
                        requestSent: auth.user.requestSent.filter((user2: TCleanUser) => user2.id !== user.id),
                        blockedByIds: [...auth.user.blockedByIds, user.id],
                        blockedBy: [...auth.user.blockedBy, user],
                    },
                });
            }
        },
        [auth.user]
    );

    const unblockUser = useCallback(
        (user: TCleanUser) => {
            setAuth({
                ...auth,
                user: {
                    ...auth.user,
                    blockedIds: auth.user.blockedIds.filter((id: string) => id !== user.id),
                    blocked: auth.user.blocked.filter((user2: TCleanUser) => user2.id !== user.id),
                    blockedByIds: auth.user.blockedByIds.filter((id: string) => id !== user.id),
                    blockedBy: auth.user.blockedBy.filter((user2: TCleanUser) => user2.id !== user.id),
                },
            });
        },
        [auth.user]
    );

    const updateRelationship = (data: any) => {
        if (data.sender.id === auth.user.id || data.receiver.id === auth.user.id) {
            const isSender = data.sender.id === auth.user.id;

            switch (data.type) {
                case 'FRIEND_ADDED':
                    addFriend(isSender ? data.receiver : data.sender);
                    break;
                case 'FRIEND_REMOVED':
                    removeFriend(isSender ? data.receiver : data.sender);
                    break;
                case 'FRIEND_REQUEST':
                    addFriendRequest(isSender ? data.receiver : data.sender, isSender ? 'SENT' : 'RECEIVED');
                    break;
                case 'USER_BLOCKED':
                    blockUser(isSender ? data.receiver : data.sender, isSender ? 'SENT' : 'RECEIVED');
                    break;
                case 'USER_UNBLOCKED':
                    unblockUser(isSender ? data.receiver : data.sender);
                    break;
            }
        }
    };

    useEffect(() => {
        if (!trigger) return;

        if (pathname.includes(trigger.channel) || !auth.user.channelIds.includes(trigger.channel)) {
            return;
        }

        const notification = notifDM.find((notif: any) => notif?.channel.id === trigger.channel);

        setAuth({
            ...auth,
            user: {
                ...auth.user,
                notifications: notification
                    ? auth.user.notifications.map((notification: any) => {
                          notification?.channel === trigger.channel
                              ? {
                                    ...notification,
                                    count: notification?.count + 1,
                                }
                              : notification;
                      })
                    : [
                          {
                              channel: trigger.channel,
                              count: 1,
                          },
                          ...auth.user.notifications,
                      ],
            },
        });

        const audio = new Audio('/assets/sounds/ping.mp3');
        audio.volume = 0.5;
        audio.play();
    }, [trigger, auth.user]);

    const updateUserData = useCallback(
        (data: any) => {
            const object = {
                username: data.username,
                displayName: data.displayName,
                description: data.description,
                avatar: data.avatar,
                banner: data.banner,
                primaryColor: data.primaryColor,
                accentColor: data.accentColor,
                status: data.status,
            };

            if (data.userId === auth.user.id) {
                setAuth({
                    ...auth,
                    user: {
                        ...auth.user,
                        ...object,
                    },
                });
            } else if (auth.user.friendIds?.includes(data.userId)) {
                setAuth({
                    ...auth,
                    user: {
                        ...auth.user,
                        friends: auth.user.friends.map((friend: TCleanUser) => {
                            return friend.id === data.userId ? { ...friend, ...object } : friend;
                        }),
                        channels: auth.user.channels.map((channel: TChannel) => {
                            const recipients = channel.recipients.map((recipient: TCleanUser) => {
                                return recipient.id === data.userId ? { ...recipient, ...object } : recipient;
                            });

                            return { ...channel, recipients };
                        }),
                    },
                });
            }
        },
        [auth.user]
    );

    const chatAppIcon = (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <path d='M8 9h8' />
            <path d='M8 13h6' />
            <path d='M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z' />
        </svg>
    );

    const addServerIcon = (
        <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
        >
            <path
                fill='currentColor'
                d='M20 11.1111H12.8889V4H11.1111V11.1111H4V12.8889H11.1111V20H12.8889V12.8889H20V11.1111Z'
            />
        </svg>
    );

    const discoverIcon = (
        <svg
            viewBox='0 0 24 24'
            width='24'
            height='24'
        >
            <path
                fill='currentColor'
                d='M12 10.9C11.39 10.9 10.9 11.39 10.9 12C10.9 12.61 11.39 13.1 12 13.1C12.61 13.1 13.1 12.61 13.1 12C13.1 11.39 12.61 10.9 12 10.9ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM14.19 14.19L6 18L9.81 9.81L18 6L14.19 14.19Z'
            />
        </svg>
    );

    return useMemo(
        () => (
            <nav className={styles.nav}>
                <ul className={styles.list}>
                    {notifDM.map((notification: any) => (
                        <NavIcon
                            key={notification.channel.id}
                            name={notification.channel.name}
                            link={`/channels/me/${notification.channel.id}`}
                            src={notification.channel.icon}
                            count={notification.count}
                        />
                    ))}

                    <NavIcon
                        special={true}
                        name='Direct Messages'
                        link={url}
                        svg={chatAppIcon}
                    />

                    <div className={styles.listItem}>
                        <div className={styles.separator} />
                    </div>

                    <NavIcon
                        green={true}
                        name='Add a Server'
                        link={'/channels/add'}
                        svg={addServerIcon}
                    />

                    <NavIcon
                        green={true}
                        name='Discover Servers'
                        link={'/channels/discover'}
                        svg={discoverIcon}
                    />
                </ul>
            </nav>
        ),
        [notifDM, url]
    );
};

export default AppNav;
