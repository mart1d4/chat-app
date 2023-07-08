'use client';

import { ReactElement, useEffect, useMemo } from 'react';
import useContextHook from '@/hooks/useContextHook';
import pusher from '@/lib/pusher/client-connection';
import { getChannelName } from '@/lib/strings';
import { useRouter } from 'next/navigation';
import styles from './Channels.module.css';
import UserSection from './UserSection';
import { v4 as uuidv4 } from 'uuid';
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
            if (!data.channel.recipientIds.includes(auth.user.id)) return;

            setAuth((prev: any) => ({
                ...prev,
                user: {
                    ...prev.user,
                    channelIds: [data.channel.id, ...prev.user.channelIds],
                    channels: [data.channel, ...prev.user.channels],
                },
            }));

            if (data.senderId === auth.user.id) {
                router.push(`/channels/me/${data.channel.id}`);
            }
        });

        pusher.bind('channel-users-added', (data: any) => {
            const recipientIds = data.recipients.map((recipient: TUser) => recipient.id);
            if (!recipientIds.includes(auth.user.id)) return;

            setAuth((prev: any) => ({
                ...prev,
                user: {
                    ...prev.user,
                    channels: prev.user.channels.map((channel: TChannel) => {
                        if (channel.id === data.channelId) {
                            return {
                                ...channel,
                                recipients: [data.recipients],
                            };
                        }

                        return channel;
                    }),
                },
            }));
        });

        pusher.bind('channel-left', (data: any) => {
            if (data.senderId !== auth.user.id) return;
            setAuth((prev: any) => ({
                ...prev,
                user: {
                    ...prev.user,
                    channels: prev.user.channels.filter((channel: TChannel) => channel.id !== data.channelId),
                },
            }));
        });

        pusher.bind('message-sent', (data: any) => {
            console.log(data);
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
            pusher.unbind('channel-users-added');
            pusher.unbind('channel-left');
        };
    }, []);

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
                            <ChannelList channels={channels} />
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

const ChannelList = ({ channels }: any): ReactElement => {
    return useMemo(() => {
        return channels.map((channel: any) => (
            <UserItem
                key={uuidv4()}
                channel={channel}
            />
        ));
    }, [channels]);
};

export default Channels;
