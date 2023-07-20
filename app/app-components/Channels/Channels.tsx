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

type TGuildChannels = {
    category: TChannel;
    channels: TChannel[];
};

const Channels = (): ReactElement => {
    const [guild, setGuild] = useState<null | TGuild>(null);
    const [categoriesToShow, setCategoriesToShow] = useState<string[]>([]);

    const { fixedLayer, setFixedLayer }: any = useContextHook({ context: 'layer' });
    const { auth, setAuth }: any = useContextHook({ context: 'auth' });
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        if (params.guildId) {
            const guild = auth.user.guilds.find((guild: TGuild) => guild.id === params.guildId);
            setGuild(guild);
        }
    }, [params, auth.user.guilds]);

    const channels = useMemo(() => {
        if (guild) {
            const categories = guild.channels.filter((channel: TChannel) => channel.type === 'GUILD_CATEGORY');
            const channels: any = [];

            categories.map((category: TChannel, index) => {
                channels[index] = {
                    category: category,
                    channels: guild.channels
                        .filter((channel) => channel.parentId === category.id)
                        .sort((a, b) => (a.position as number) - (b.position as number)),
                };

                setCategoriesToShow((prev: string[]) => [...prev, category.id]);
            });

            return channels;
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
                        guilds: prev?.user?.guilds?.map((guild: TGuild) => {
                            if (guild.id === data.guildId) {
                                return {
                                    ...guild,
                                    channelIds: [data.channel.id, ...(guild.channelIds ?? [])],
                                    channels: [data.channel, ...(guild.channels ?? [])],
                                };
                            }

                            return guild;
                        }),
                    },
                }));
                router.push(`/channels/${data.guildId}/${data.channel.id}`);
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

    return (
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

                <div className={styles.scroller + ' scrollbar'}>
                    <ul className={styles.channelList}>
                        {!guild && (
                            <>
                                <div></div>
                                <UserItem special />
                                <Title />
                            </>
                        )}

                        {channels.length === 0 && (
                            <img
                                src='/assets/app/no-channels.svg'
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
                            channels.map((object: TGuildChannels) => {
                                const active = object.channels
                                    .map((channel) => channel.id)
                                    .includes(params.channelId as string);

                                return (
                                    <>
                                        <ChannelItem
                                            key={object.category.id}
                                            channel={object.category}
                                            hide={!categoriesToShow.includes(object.category.id)}
                                            setToShow={setCategoriesToShow}
                                        />

                                        {(categoriesToShow.includes(object.category.id) || active) &&
                                            object.channels.map((channel: TChannel) => {
                                                if (
                                                    !categoriesToShow.includes(object.category.id) &&
                                                    params.channelId !== channel.id
                                                )
                                                    return;

                                                return (
                                                    <ChannelItem
                                                        key={channel.id}
                                                        channel={channel}
                                                        category={object.category}
                                                    />
                                                );
                                            })}
                                    </>
                                );
                            })}
                    </ul>
                </div>
            </div>

            <UserSection />
        </div>
    );
};

export default Channels;
