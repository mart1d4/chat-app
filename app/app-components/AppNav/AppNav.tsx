'use client';

import { ReactElement, useEffect, useState, useMemo, useCallback } from 'react';
import useContextHook from '@/hooks/useContextHook';
import pusher from '@/lib/pusher/client-connection';
import { usePathname } from 'next/navigation';
import styles from './AppNav.module.css';
import { v4 as uuidv4 } from 'uuid';
import NavIcon from './NavIcon';

const AppNav = (): ReactElement => {
    const [url, setUrl] = useState<string>('/channels/me');
    const [dmNotifications, setDmNotifications] = useState<TNotification[]>([]);

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
            const filtered = auth.user.notifications.filter((notif: TNotification) =>
                auth.user.channelIds.includes(notif?.channelId)
            );

            const notifications = filtered.map((notif: TNotification) => {
                const channel = auth.user.channels.find((channel: TChannel) => channel.id === notif?.channelId);

                let name = channel?.name;
                if (channel.type === 'DM') {
                    const user = channel.recipients.find((user: TCleanUser) => user.id !== auth.user.id);
                    name = user?.username;
                } else if (channel.type === 'GROUP_DM' && !channel.name) {
                    const filteredMembers = channel.recipients.filter((user: TCleanUser) => user.id !== auth.user.id);
                    name = filteredMembers.map((user: TCleanUser) => user.username).join(', ');
                }

                let src = `${process.env.NEXT_PUBLIC_CDN_URL}${channel?.icon}/`;
                if (channel.type === 'DM') {
                    const user = channel.recipients.find((user: any) => user.id !== auth.user.id);
                    src = `${process.env.NEXT_PUBLIC_CDN_URL}${user.avatar}/`;
                }

                return {
                    ...notif,
                    channel: {
                        ...channel,
                        name: name,
                        icon: src,
                    },
                };
            });

            setDmNotifications(notifications);
        }
    }, [auth.user.notifications]);

    useEffect(() => {
        pusher.bind('user-updated', (data: any) => updateUserData(data));
        pusher.bind('relationship-updated', (data: any) => {
            console.log('relationship-updated');
            updateRelationship(data);
        });
        pusher.bind('message-sent', (data: any) => updateNotifications(data));

        return () => {
            pusher.unbind('user-updated');
            pusher.unbind('message-sent');
            pusher.unbind('relationship-updated');
        };
    }, [auth.user]);

    const addFriend = (user: TCleanUser) => {
        setAuth((prev: TAuth) => ({
            ...prev,
            user: {
                ...prev?.user,
                friendIds: [...(prev?.user?.friendIds ?? []), user.id],
                friends: [...(prev?.user?.friends ?? []), user],
                requestReceivedIds: prev?.user.requestReceivedIds?.filter((id: string) => id !== user.id),
                requestsReceived: prev?.user.requestsReceived?.filter((user2: TCleanUser) => user2.id !== user.id),
                requestSentIds: prev?.user.requestSentIds?.filter((id: string) => id !== user.id),
                requestsSent: prev?.user.requestsSent?.filter((user2: TCleanUser) => user2.id !== user.id),
            },
        }));
    };

    const removeFriend = (user: TCleanUser) => {
        setAuth((prev: TAuth) => ({
            ...prev,
            user: {
                ...prev?.user,
                friendIds: prev?.user.friendIds?.filter((id: string) => id !== user.id),
                friends: prev?.user.friends?.filter((user2: TCleanUser) => user2.id !== user.id),
                requestReceivedIds: prev?.user.requestReceivedIds?.filter((id: string) => id !== user.id),
                requestsReceived: prev?.user.requestsReceived?.filter((user2: TCleanUser) => user2.id !== user.id),
                requestSentIds: prev?.user.requestSentIds?.filter((id: string) => id !== user.id),
                requestsSent: prev?.user.requestsSent?.filter((user2: TCleanUser) => user2.id !== user.id),
            },
        }));
    };

    const addFriendRequest = (user: TCleanUser, type: 'SENT' | 'RECEIVED') => {
        if (type === 'SENT') {
            setAuth((prev: TAuth) => ({
                ...prev,
                user: {
                    ...prev?.user,
                    requestSentIds: [...(prev?.user?.requestSentIds ?? []), user.id],
                    requestsSent: [...(prev?.user?.requestsSent ?? []), user],
                },
            }));
        } else {
            setAuth((prev: TAuth) => ({
                ...prev,
                user: {
                    ...prev?.user,
                    requestReceivedIds: [...(prev?.user?.requestReceivedIds ?? []), user.id],
                    requestsReceived: [...(prev?.user?.requestsReceived ?? []), user],
                },
            }));
        }
    };

    const blockUser = (user: TCleanUser, type: 'SENT' | 'RECEIVED') => {
        if (type === 'SENT') {
            setAuth((prev: TAuth) => ({
                ...prev,
                user: {
                    ...prev?.user,
                    friendIds: prev?.user.friendIds?.filter((id: string) => id !== user.id),
                    friends: prev?.user.friends?.filter((user2: TCleanUser) => user2.id !== user.id),
                    requestReceivedIds: prev?.user.requestReceivedIds?.filter((id: string) => id !== user.id),
                    requestsReceived: prev?.user.requestsReceived?.filter((user2: TCleanUser) => user2.id !== user.id),
                    requestSentIds: prev?.user.requestSentIds?.filter((id: string) => id !== user.id),
                    requestsSent: prev?.user.requestsSent?.filter((user2: TCleanUser) => user2.id !== user.id),
                    blockedUserIds: [...(prev?.user?.blockedUserIds ?? []), user.id],
                    blockedUsers: [...(prev?.user?.blockedUsers ?? []), user],
                },
            }));
        } else {
            setAuth((prev: TAuth) => ({
                ...prev,
                user: {
                    ...prev?.user,
                    friendIds: prev?.user.friendIds?.filter((id: string) => id !== user.id),
                    friends: prev?.user.friends?.filter((user2: TCleanUser) => user2.id !== user.id),
                    requestReceivedIds: prev?.user.requestReceivedIds?.filter((id: string) => id !== user.id),
                    requestsReceived: prev?.user.requestsReceived?.filter((user2: TCleanUser) => user2.id !== user.id),
                    requestSentIds: prev?.user.requestSentIds?.filter((id: string) => id !== user.id),
                    requestsSent: prev?.user.requestsSent?.filter((user2: TCleanUser) => user2.id !== user.id),
                    blockedByUserIds: [...(prev?.user?.blockedByUserIds ?? []), user.id],
                    blockedByUsers: [...(prev?.user?.blockedByUsers ?? []), user],
                },
            }));
        }
    };

    const unblockUser = (user: TCleanUser) => {
        setAuth((prev: TAuth) => ({
            ...prev,
            user: {
                ...prev?.user,
                blockedUserIds: prev?.user.blockedUserIds?.filter((id: string) => id !== user.id),
                blockedUsers: prev?.user.blockedUsers?.filter((user2: TCleanUser) => user2.id !== user.id),
                blockedByUserIds: prev?.user?.blockedByUserIds?.filter((id: string) => id !== user.id),
                blockedByUsers: prev?.user?.blockedByUsers?.filter((user2: TCleanUser) => user2.id !== user.id),
            },
        }));
    };

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

    const updateNotifications = useCallback(
        (data: any) => {
            if (pathname.includes(data.channelId) || !auth.user.channelIds.includes(data.channelId)) {
                return;
            }

            const notification = dmNotifications.find(
                (notif: TNotification) => notif?.channelId === data.channelId && notif?.type === 'MESSAGE'
            );

            setAuth({
                ...auth,
                user: {
                    ...auth.user,
                    notifications: notification
                        ? auth.user.notifications.map((notif: TNotification) => {
                              notif?.channelId === data.channelId
                                  ? {
                                        ...notif,
                                        count: notif?.count + 1,
                                    }
                                  : notif;
                          })
                        : [
                              {
                                  type: 'MESSAGE',
                                  senderId: data.senderId,
                                  channelId: data.channelId,
                                  count: 1,
                                  createdAt: new Date().toISOString(),
                              },
                              ...auth.user.notifications,
                          ],
                },
            });

            const audio = new Audio('/assets/sounds/ping.mp3');
            audio.volume = 0.5;
            audio.play();
        },
        [auth.user.notifications]
    );

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
                        requestsReceived: auth.user.requestsReceived.map((user: TCleanUser) => {
                            return user.id === data.userId ? { ...user, ...object } : user;
                        }),
                        requestsSent: auth.user.requestsSent.map((user: TCleanUser) => {
                            return user.id === data.userId ? { ...user, ...object } : user;
                        }),
                        blockedUsers: auth.user.blockedUsers.map((user: TCleanUser) => {
                            return user.id === data.userId ? { ...user, ...object } : user;
                        }),
                    },
                });
            }

            setAuth({
                ...auth,
                user: {
                    ...auth.user,
                    channels: auth.user.channels.map((channel: TChannel) => {
                        const recipients = channel.recipients.map((recipient: TCleanUser) => {
                            return recipient.id === data.userId ? { ...recipient, ...object } : recipient;
                        });

                        return { ...channel, recipients };
                    }),
                },
            });
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
                    {dmNotifications.map((notification: any) => (
                        <NavIcon
                            key={uuidv4()}
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
                        count={0}
                    />

                    <NavIcon
                        green={true}
                        name='Discover Servers'
                        link={'/channels/discover'}
                        svg={discoverIcon}
                        count={0}
                    />
                </ul>
            </nav>
        ),
        [dmNotifications, url]
    );
};

export default AppNav;
