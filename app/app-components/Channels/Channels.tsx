'use client';

import { ReactElement, useEffect, useMemo } from 'react';
import useContextHook from '@/hooks/useContextHook';
import pusher from '@/lib/pusher/client-connection';
import { getChannelName } from '@/lib/strings';
import { useRouter } from 'next/navigation';
import styles from './Channels.module.css';
import UserSection from './UserSection';
import UserItem from './UserItem';
import Title from './Title';

const Channels = (): ReactElement => {
    const { auth, setAuth }: any = useContextHook({ context: 'auth' });
    const router = useRouter();

    const channels = useMemo(() => {
        return (
            auth.user.channels?.map((channel: TChannel) => ({
                ...channel,
                name: getChannelName(channel, auth.user.id),
            })) || []
        );
    }, [auth.user.channels, auth.user.id]);

    useEffect(() => {
        pusher.bind('channel-created', (data: any) => {
            if (!data.recipients.includes(auth.user.id)) return;

            setAuth((prev: TAuth) => ({
                ...prev,
                user: {
                    ...prev?.user,
                    channelIds: [data.channel.id, ...(prev?.user.channelIds ?? [])],
                    channels: [data.channel, ...(prev?.user.channels ?? [])],
                },
            }));

            if (data.redirect) {
                router.push(`/channels/me/${data.channel.id}`);
            }
        });

        pusher.bind('channel-left', (data: any) => {
            if (data.recipientId !== auth.user.id && !data.recpients?.includes(auth.user.id)) return;

            if (data.recipients && data.recipientId !== auth.user.id) {
                setAuth((prev: TAuth) => ({
                    ...prev,
                    user: {
                        ...prev?.user,
                        channels: prev?.user?.channels?.map((channel: TChannel) => {
                            if (channel.id === data.channelId) {
                                return {
                                    ...channel,
                                    recipientIds: channel.recipientIds.filter(
                                        (recipientId: string) => recipientId !== data.recipientId
                                    ),
                                    recipients: channel.recipients.filter(
                                        (recipient: TUser) => recipient.id !== data.recipientId
                                    ),
                                };
                            }

                            return channel;
                        }),
                    },
                }));
            } else if (data.recipientId === auth.user.id) {
                setAuth((prev: TAuth) => ({
                    ...prev,
                    user: {
                        ...prev?.user,
                        channelIds: prev?.user?.channelIds?.filter((channelId: string) => channelId !== data.channelId),
                        channels: prev?.user?.channels?.filter((channel: TChannel) => channel.id !== data.channelId),
                    },
                }));
            }
        });

        pusher.bind('channel-recipient-add', (data: any) => {
            if (!data.recipients.includes(auth.user.id)) return;

            setAuth((prev: TAuth) => ({
                ...prev,
                user: {
                    ...prev?.user,
                    channels: prev?.user?.channels?.map((channel: TChannel) => {
                        if (channel.id === data.channelId) {
                            return {
                                ...channel,
                                recipientIds: [...channel.recipientIds, ...data.recipient.id],
                                recipients: [...channel.recipients, ...data.recipient],
                                ownerId: data.newOwner ?? channel.ownerId,
                            };
                        }

                        return channel;
                    }),
                },
            }));
        });

        pusher.bind('message-sent', (data: any) => {
            if (!auth.user.channelIds.includes(data.channelId)) return;

            const filteredChannels = auth.user.channels.filter((channel: TChannel) => channel.id !== data.channelId);
            const channel = auth.user.channels.find((channel: TChannel) => channel.id === data.channelId);

            setAuth({
                ...auth,
                user: {
                    ...auth.user,
                    channelIds: [channel.id, ...filteredChannels.map((channel: TChannel) => channel.id)],
                    channels: [channel, ...filteredChannels],
                },
            });
        });

        return () => {
            pusher.unbind('channel-created');
            pusher.unbind('channel-left');
            pusher.unbind('channel-recipient-add');
            pusher.unbind('message-sent');
        };
    }, [auth.user]);

    return (
        <div className={styles.nav}>
            <div className={styles.privateChannels}>
                <div className={styles.searchContainer}>
                    <button className={styles.searchButton}>Find or start a conversation</button>
                </div>

                <div className={styles.scroller + ' scrollbar'}>
                    <ul className={styles.channelList}>
                        <div></div>

                        <UserItem special />

                        <Title />

                        {channels.length > 0 ? (
                            channels.map((channel: TChannel) => (
                                <UserItem
                                    key={channel.id}
                                    channel={channel}
                                />
                            ))
                        ) : (
                            <img
                                src='/assets/app/no-channels.svg'
                                alt='No Channels'
                            />
                        )}
                    </ul>
                </div>
            </div>

            <UserSection />
        </div>
    );
};

export default Channels;
