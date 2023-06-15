'use client';

import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import useContextHook from '@/hooks/useContextHook';
import { usePathname } from 'next/navigation';
import styles from './AppNav.module.css';
import NavIcon from './NavIcon';
import Pusher from 'pusher-js';

const AppNav = (): ReactElement => {
    const [notifDM, setNotifDM] = useState<
        {
            channel: ChannelType;
            count: number;
        }[]
    >([]);

    const { auth, setAuth }: any = useContextHook({ context: 'auth' });
    // App nav is always here, so why not creating the connected - disconnected state here?
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

                let src = channel?.image;
                if (channel.type === 'DM') {
                    const user = channel.recipients.find((user: any) => user.id !== auth.user.id);
                    src = user?.avatar;
                } else if (channel.type === 'GROUP_DM' && !channel.image) {
                    src = 'blue';
                }

                return {
                    channel: {
                        ...channel,
                        name: name,
                        avatar: src,
                    },
                    count: notification?.count,
                };
            });

            setNotifDM(notifications);
        }
    }, [auth.user.notifications]);

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

        channel?.bind('user-status', (data: any) => {
            if (data.userId !== auth.user.id) return;
            setData(data.connected);
        });

        channel?.bind(`message-sent`, (data: any) => {
            setNotifications(data);
        });
    };

    const setNotifications = useCallback(
        (data: any) => {
            if (pathname.includes(data.channel) || !auth.user.channelIds.includes(data.channel)) {
                return;
            }
            console.log('Channel: ', data.channel, 'Notification: ', notifDM);

            const notification = notifDM.find(
                (notification: any) => notification?.channel.id === data.channel
            );

            if (notification) {
                console.log("Notification already exists, don't add new one");
                setAuth({
                    ...auth,
                    user: {
                        ...auth.user,
                        notifications: auth.user.notifications.map((notification: any) => {
                            if (notification?.channel === data.channel) {
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
                console.log('Notification does not exist, add new one');

                setAuth({
                    ...auth,
                    user: {
                        ...auth.user,
                        notifications: [
                            ...auth.user.notifications,
                            {
                                channel: data.channel,
                                count: 1,
                            },
                        ],
                    },
                });
            }
        },
        [auth.user.notifications, notifDM]
    );

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

    const setData = async (connected: boolean) => {
        setAuth({
            ...auth,
            user: {
                ...auth.user,
                status: connected ? 'Online' : 'Offline',
            },
        });
    };

    const chatappIcon = (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='32'
            height='32'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='currentColor'
            fill='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <path d='M5 11h14v-3h-14z' />
            <path d='M17.5 11l-1.5 10h-8l-1.5 -10' />
            <path d='M6 8v-1a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v1' />
            <path d='M15 5v-2' />
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
                        src={`/assets/channel-avatars/${notification.channel.avatar}.png`}
                        count={notification.count}
                    />
                ))}

                <NavIcon
                    name='Friends'
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
