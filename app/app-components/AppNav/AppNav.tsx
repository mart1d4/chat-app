'use client';

import { ReactElement, useEffect, useRef, useState } from 'react';
import useContextHook from '@/hooks/useContextHook';
import { usePathname } from 'next/navigation';
import styles from './AppNav.module.css';
import NavIcon from './NavIcon';
import Pusher from 'pusher-js';

const AppNav = (): ReactElement => {
    const [trigger, setTrigger] = useState<any>(null);
    const [notifDM, setNotifDM] = useState<
        {
            channel: ChannelType;
            count: number;
        }[]
    >([]);

    const { auth, setAuth }: any = useContextHook({ context: 'auth' });
    const ref = useRef<boolean>(false);
    const pusher = useRef<Pusher | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        if (auth.user.notifications.length) {
            const filtered = auth.user.notifications.filter((notification: any) =>
                auth.user.channelIds.includes(notification?.channel)
            );

            const notifications = filtered.map((notification: any) => {
                const channel = auth.user.channels.find(
                    (channel: any) => channel.id === notification?.channel
                );

                let name = channel?.name;
                if (channel.type === 'DM') {
                    const user = channel.recipients.find((user: any) => user.id !== auth.user.id);
                    name = user?.username;
                } else if (channel.type === 'GROUP_DM' && !channel.name) {
                    const filteredMembers = channel.recipients.filter(
                        (user: any) => user.id !== auth.user.id
                    );
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
        notifDM.forEach((notification: any) => {
            if (pathname.includes(notification.channel.id)) {
                setNotifDM((prev: any) =>
                    prev.filter((notif: any) => notif.channel.id !== notification.channel.id)
                );
            }
        });
    }, [pathname]);

    useEffect(() => {
        if (ref.current) {
            pusher.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
            });
            setPusherListener();
        }

        const windowUnload = () => {
            sendData(false);
        };

        window.addEventListener('beforeunload', windowUnload);

        return () => {
            ref.current = true;
            pusher.current?.unsubscribe('chat-app');
        };
    }, []);

    const setPusherListener = () => {
        const channel = pusher.current?.subscribe('chat-app');

        pusher.current?.connection.bind('connected', () => {
            sendData(true);
        });

        pusher.current?.connection.bind('disconnected', () => {
            sendData(false);
        });

        pusher.current?.connection.bind('error', () => {
            sendData(false);
        });

        pusher.current?.connection.bind('unavailable', () => {
            sendData(false);
        });

        pusher.current?.connection.bind('failed', () => {
            sendData(false);
        });

        channel?.bind('user-updated', (data: any) => {
            setData(data);
        });

        channel?.bind(`message-sent`, (data: any) => {
            setTrigger(data);
        });

        channel?.bind(`user-friend`, (data: any) => {
            setUserData({
                data: data,
                type: 'friend',
            });
        });

        channel?.bind(`user-request`, (data: any) => {
            setUserData({
                data: data,
                type: 'request',
            });
        });

        channel?.bind(`user-blocked`, (data: any) => {
            setUserData({
                data: data,
                type: 'blocked',
            });
        });

        channel?.bind(`user-unblocked`, (data: any) => {
            setUserData({
                data: data,
                type: 'unblocked',
            });
        });

        channel?.bind(`user-removed`, (data: any) => {
            setUserData({
                data: data,
                type: 'removed',
            });
        });
    };

    const setUserData = ({ data, type }: any) => {
        if (![data.sender.id, data.user.id].includes(auth.user.id)) return;

        if (type === 'request' && data.user.id === auth.user.id) {
            setAuth({
                ...auth,
                user: {
                    ...auth.user,
                    requestsReceived: [...(auth.user.requestsReceived || []), data.sender],
                    requestsReceivedIds: [...(auth.user.requestsReceivedIds || []), data.sender.id],
                },
            });
            return;
        } else if (type === 'friend' && data.user.id === auth.user.id) {
            setAuth({
                ...auth,
                user: {
                    ...auth.user,
                    requestsSent: auth.user.requestsSent?.filter(
                        (request: any) => request.id !== data.sender.id
                    ),
                    requestsSentIds: auth.user.requestsSentIds?.filter(
                        (request: any) => request !== data.sender.id
                    ),
                    requestsReceived: auth.user.requestsReceived?.filter(
                        (request: any) => request.id !== data.sender.id
                    ),
                    requestsReceivedIds: auth.user.requestsReceivedIds?.filter(
                        (request: any) => request !== data.sender.id
                    ),
                    friends: [...(auth.user.friends || []), data.sender],
                    friendIds: [...(auth.user.friendIds || []), data.sender.id],
                },
            });
            return;
        } else if ((type === 'blocked' || type === 'removed') && data.user.id === auth.user.id) {
            setAuth({
                ...auth,
                user: {
                    ...auth.user,
                    requestsSent: auth.user.requestsSent?.filter(
                        (request: any) => request.id !== data.sender.id
                    ),
                    requestsSentIds: auth.user.requestsSentIds?.filter(
                        (request: any) => request !== data.sender.id
                    ),
                    requestsReceived: auth.user.requestsReceived?.filter(
                        (request: any) => request.id !== data.sender.id
                    ),
                    requestsReceivedIds: auth.user.requestsReceivedIds?.filter(
                        (request: any) => request !== data.sender.id
                    ),
                    friends: auth.user.friends?.filter(
                        (friend: any) => friend.id !== data.sender.id
                    ),
                    friendIds: auth.user.friendIds?.filter(
                        (friend: any) => friend !== data.sender.id
                    ),
                },
            });
            return;
        }

        if (type === 'friend' && data.sender.id === auth.user.id) {
            setAuth({
                ...auth,
                user: {
                    ...auth.user,
                    requestsSent: auth.user.requestsSent?.filter(
                        (request: any) => request.id !== data.user.id
                    ),
                    requestsSentIds: auth.user.requestsSentIds?.filter(
                        (request: any) => request !== data.user.id
                    ),
                    friends: [...(auth.user.friends || []), data.user],
                    friendIds: [...(auth.user.friendIds || []), data.user.id],
                },
            });
        } else if (type === 'request' && data.sender.id === auth.user.id) {
            setAuth({
                ...auth,
                user: {
                    ...auth.user,
                    requestsSent: [...(auth.user.requestsSent || []), data.user],
                    requestsSentIds: [...(auth.user.requestsSentIds || []), data.user.id],
                },
            });
        } else if (type === 'blocked') {
            setAuth({
                ...auth,
                user: {
                    ...auth.user,
                    blocked: [...(auth.user.blocked || []), data.user],
                    blockedIds: [...(auth.user.blockedIds || []), data.user.id],
                    requestsReceived: auth.user.requestsReceived?.filter(
                        (request: any) => request.id !== data.user.id
                    ),
                    requestsReceivedIds: auth.user.requestsReceivedIds?.filter(
                        (request: any) => request !== data.user.id
                    ),
                    requestsSent: auth.user.requestsSent?.filter(
                        (request: any) => request.id !== data.user.id
                    ),
                    requestsSentIds: auth.user.requestsSentIds?.filter(
                        (request: any) => request !== data.user.id
                    ),
                    friends: auth.user.friends?.filter((friend: any) => friend.id !== data.user.id),
                    friendIds: auth.user.friendIds?.filter(
                        (friend: any) => friend !== data.user.id
                    ),
                },
            });
        } else if (type === 'unblocked') {
            setAuth({
                ...auth,
                user: {
                    ...auth.user,
                    blocked: auth.user.blocked?.filter(
                        (blocked: any) => blocked.id !== data.user.id
                    ),
                    blockedIds: auth.user.blockedIds?.filter(
                        (blocked: any) => blocked !== data.user.id
                    ),
                },
            });
        } else if (type === 'removed') {
            setAuth({
                ...auth,
                user: {
                    ...auth.user,
                    requestsReceived: auth.user.requestsReceived?.filter(
                        (request: any) => request.id !== data.user.id
                    ),
                    requestsReceivedIds: auth.user.requestsReceivedIds?.filter(
                        (request: any) => request !== data.user.id
                    ),
                    requestsSent: auth.user.requestsSent?.filter(
                        (request: any) => request.id !== data.user.id
                    ),
                    requestsSentIds: auth.user.requestsSentIds?.filter(
                        (request: any) => request !== data.user.id
                    ),
                    friends: auth.user.friends?.filter((friend: any) => friend.id !== data.user.id),
                    friendIds: auth.user.friendIds?.filter(
                        (friend: any) => friend !== data.user.id
                    ),
                },
            });
        }
    };

    useEffect(() => {
        if (!trigger) return;

        if (pathname.includes(trigger.channel) || !auth.user.channelIds.includes(trigger.channel)) {
            return;
        }

        const notification = notifDM.find(
            (notification: any) => notification?.channel.id === trigger.channel
        );

        if (notification) {
            setAuth({
                ...auth,
                user: {
                    ...auth.user,
                    notifications: auth.user.notifications.map((notification: any) => {
                        if (notification?.channel === trigger.channel) {
                            return {
                                ...notification,
                                count: notification?.count + 1,
                            };
                        }

                        return notification;
                    }),
                },
            });
        } else {
            setAuth({
                ...auth,
                user: {
                    ...auth.user,
                    notifications: [
                        {
                            channel: trigger.channel,
                            count: 1,
                        },
                        ...auth.user.notifications,
                    ],
                },
            });
        }

        const audio = new Audio('/assets/sounds/ping.mp3');
        audio.volume = 0.5;
        audio.play();
    }, [trigger]);

    const sendData = async (connected: boolean) => {
        await fetch('/api/users/me', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth.accessToken}`,
            },
            body: JSON.stringify({
                status: connected ? 'Online' : 'Offline',
            }),
        });
    };

    const setData = async (data: any) => {
        if (data.userId === auth.user.id) {
            if (data.connected) {
                setAuth({
                    ...auth,
                    user: {
                        ...auth.user,
                        status: data.connected ? 'Online' : 'Offline',
                    },
                });
            }

            if (data.username) {
                setAuth({
                    ...auth,
                    user: {
                        ...auth.user,
                        username: data.username,
                    },
                });
            }

            if (data.avatar) {
                setAuth({
                    ...auth,
                    user: {
                        ...auth.user,
                        avatar: data.avatar,
                    },
                });
            }
        } else if (auth.user.friendIds.includes(data.userId)) {
            if (data.connected) {
                auth.user.friends.map((friend: any) => {
                    if (friend.id === data.userId) {
                        friend.status = data.connected ? 'Online' : 'Offline';
                    }

                    return friend;
                });
            }

            if (data.username) {
                auth.user.friends.map((friend: any) => {
                    if (friend.id === data.userId) {
                        friend.username = data.username;
                    }

                    return friend;
                });
            }

            if (data.avatar) {
                auth.user.friends.map((friend: any) => {
                    if (friend.id === data.userId) {
                        friend.avatar = data.avatar;
                    }

                    return friend;
                });
            }
        }
    };

    const chatappIcon = (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <path d='M8 9h8' />
            <path d='M8 13h6' />
            <path d='M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z' />
        </svg>
    );

    return (
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
                    name='Direct Messages'
                    link='/channels/me'
                    svg={chatappIcon}
                />

                <div className={styles.listItem}>
                    <div className={styles.separator} />
                </div>
            </ul>
        </nav>
    );
};

export default AppNav;
