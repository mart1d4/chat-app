'use client';

import { ReactElement, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useContextHook from '@/hooks/useContextHook';
import pusher from '@/lib/pusher/client-connection';
import { getChannelName } from '@/lib/strings';
import { Icon } from '@/app/app-components';
import styles from './Channels.module.css';
import UserSection from './UserSection';
import ChannelItem from './ChannelItem';
import UserItem from './UserItem';
import Title from './Title';

const Channels = (): ReactElement => {
    const [guild, setGuild] = useState<null | TGuild>(null);
    const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);

    const { fixedLayer, setFixedLayer }: any = useContextHook({ context: 'layer' });
    const { auth, setAuth }: any = useContextHook({ context: 'auth' });
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        if (params.guildId) {
            const guild = auth.user.guilds.find((guild: TGuild) => guild.id === params.guildId);
            setGuild(guild);
        } else {
            setGuild(null);
        }
    }, [params, auth.user.guilds]);

    const channels = useMemo(() => {
        if (guild) {
            return guild.channels.sort((a: TChannel, b: TChannel) => (a.position as number) - (b.position as number));
        }

        return (
            auth.user.channels?.map((channel: TChannel) => ({
                ...channel,
                name: getChannelName(channel, auth.user.id),
            })) || []
        );
    }, [guild, auth.user.channels]);

    useEffect(() => {
        if (!guild) return;

        pusher.bind('channel-create', (data: any) => {
            if (auth.user.guildIds.includes(data.guildId)) {
                setAuth((prev: TAuth) => ({
                    ...prev,
                    user: {
                        ...prev?.user,
                        guilds: prev?.user.guilds?.map((guild: TGuild) => {
                            if (guild.id === data.guildId) {
                                const updatedChannels = guild.channels.map((channel: TChannel) => {
                                    if ((channel.position as number) >= data.channel.position) {
                                        return {
                                            ...channel,
                                            position: (channel.position as number) + 1,
                                        };
                                    }

                                    return channel;
                                });

                                return {
                                    ...guild,
                                    // channelIds: guild.channelIds.splice(data.channel.position, 0, data.channel.id),
                                    channels: [...updatedChannels, data.channel],
                                };
                            }

                            return guild;
                        }),
                    },
                }));

                if (data.redirect) {
                    router.push(`/channels/${data.guildId}/${data.channel.id}`);
                }
            }
        });

        return () => {
            pusher.unbind('channel-create');
        };
    }, [auth.user, guild]);

    useEffect(() => {
        if (guild) return;

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
            if (!auth.user.channelIds.includes(data.channelId) && auth.user.id !== data.recipientId) return;

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
                                    ownerId: data.newOwner ?? channel.ownerId,
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
            if (!auth.user.channelIds.includes(data.channel.id) && auth.user.id !== data.recipient.id) return;

            if (auth.user.id === data.recipient.id) {
                setAuth((prev: TAuth) => ({
                    ...prev,
                    user: {
                        ...prev?.user,
                        channelIds: [data.channel.id, ...(prev?.user.channelIds ?? [])],
                        channels: [data.channel, ...(prev?.user.channels ?? [])],
                    },
                }));
            } else {
                setAuth((prev: TAuth) => ({
                    ...prev,
                    user: {
                        ...prev?.user,
                        channels: prev?.user?.channels?.map((channel: TChannel) => {
                            if (channel.id === data.channel.id) {
                                return {
                                    ...channel,
                                    recipientIds: [...channel.recipientIds, data.recipient.id],
                                    recipients: [...channel.recipients, data.recipient],
                                };
                            }

                            return channel;
                        }),
                    },
                }));
            }
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

    return useMemo(
        () => (
            <div className={styles.nav}>
                <div className={styles.privateChannels}>
                    {!guild && (
                        <div className={styles.searchContainer}>
                            <button>Find or start a conversation</button>
                        </div>
                    )}

                    {guild && (
                        <div
                            className={styles.guildSettings}
                            onClick={(e) => {
                                if (fixedLayer?.guild) return;
                                setFixedLayer({
                                    type: 'menu',
                                    menu: 'GUILD',
                                    guild: guild,
                                    element: e.currentTarget,
                                    firstSide: 'BOTTOM',
                                    secondSide: 'CENTER',
                                });
                            }}
                            style={{
                                backgroundColor: fixedLayer?.guild ? 'var(--background-hover-1)' : '',
                            }}
                        >
                            <div>
                                <div>{guild.name}</div>
                                <div>
                                    {fixedLayer?.guild ? (
                                        <Icon
                                            name='close'
                                            size={16}
                                        />
                                    ) : (
                                        <Icon
                                            name='arrow'
                                            size={14}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div
                        className={styles.scroller + ' scrollbar'}
                        onContextMenu={(e) => {
                            if (!guild) return;
                            setFixedLayer({
                                type: 'menu',
                                menu: 'GUILD_CHANNEL_LIST',
                                guild: guild,
                                event: {
                                    mouseX: e.clientX,
                                    mouseY: e.clientY,
                                },
                            });
                        }}
                    >
                        <ul className={styles.channelList}>
                            {(!guild || channels[0]?.type !== 4) && <div></div>}

                            {!guild && (
                                <>
                                    <UserItem special />
                                    <Title />
                                </>
                            )}

                            {channels.length === 0 && (
                                <img
                                    src='https://ucarecdn.com/c65d6610-8a49-4133-a0c0-eb69f977c6b5/'
                                    alt='No Channels'
                                />
                            )}

                            {!guild &&
                                channels.length > 0 &&
                                channels.map((channel: TChannel) => (
                                    <UserItem
                                        key={channel.id}
                                        channel={channel}
                                    />
                                ))}

                            {guild &&
                                channels.length > 0 &&
                                channels.map((channel: TChannel) => {
                                    if (channel.type === 4) {
                                        return (
                                            <ChannelItem
                                                key={channel.id}
                                                channel={channel}
                                                hidden={hiddenCategories.includes(channel.id)}
                                                setHidden={setHiddenCategories}
                                            />
                                        );
                                    }

                                    if (
                                        hiddenCategories.includes(channel?.parentId) &&
                                        params?.channelId !== channel.id
                                    )
                                        return;

                                    if (channel.parentId) {
                                        const category = channels.find(
                                            (channel: TChannel) => channel.id === channel.parentId
                                        );

                                        return (
                                            <ChannelItem
                                                key={channel.id}
                                                channel={channel}
                                                category={category}
                                            />
                                        );
                                    } else {
                                        return (
                                            <ChannelItem
                                                key={channel.id}
                                                channel={channel}
                                            />
                                        );
                                    }
                                })}
                        </ul>
                    </div>
                </div>

                <UserSection />
            </div>
        ),
        [guild, channels, hiddenCategories, fixedLayer]
    );
};

export default Channels;
