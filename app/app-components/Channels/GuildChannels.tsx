'use client';

import { ReactElement, useEffect, useState, SetStateAction, Dispatch } from 'react';
import useContextHook from '@/hooks/useContextHook';
import pusher from '@/lib/pusher/client-connection';
import styles from './GuildChannels.module.css';
import { Icon } from '@/app/app-components';
import { useParams } from 'next/navigation';
import UserSection from './UserSection';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Props {
    user: TCleanUser;
    channels: TChannel[];
    guild: TGuild;
}

const Channels = ({ user, channels, guild }: Props): ReactElement => {
    const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);

    const { fixedLayer, setFixedLayer }: any = useContextHook({
        context: 'layer',
    });
    const params = useParams();

    useEffect(() => {
        pusher.bind('channel-create', (data: any) => {});

        return () => {
            pusher.unbind('channel-create');
        };
    }, []);

    return (
        <div className={styles.nav}>
            <div className={styles.privateChannels}>
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
                        <div
                            style={{
                                transform: !fixedLayer?.guild ? 'rotate(-90deg)' : '',
                            }}
                        >
                            {fixedLayer?.guild ? (
                                <Icon
                                    name='close'
                                    size={16}
                                />
                            ) : (
                                <Icon name='arrow' />
                            )}
                        </div>
                    </div>
                </div>

                <div
                    className={styles.scroller + ' scrollbar'}
                    onContextMenu={(e) => {
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
                        {channels[0]?.type !== 4 && <div></div>}

                        {channels.length > 0 ? (
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

                                if (hiddenCategories.includes(channel?.parentId) && params?.channelId !== channel.id)
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
                            })
                        ) : (
                            <img
                                src='https://ucarecdn.com/c65d6610-8a49-4133-a0c0-eb69f977c6b5/'
                                alt='No Channels'
                            />
                        )}
                    </ul>
                </div>
            </div>

            <UserSection user={user} />
        </div>
    );
};

type ChannelItemProps = {
    channel: TChannel;
    category?: TChannel;
    hidden?: boolean;
    setHidden?: Dispatch<SetStateAction<string[]>>;
};

const ChannelItem = ({ channel, category, hidden, setHidden }: ChannelItemProps) => {
    const { setPopup, setFixedLayer, setTooltip }: any = useContextHook({ context: 'layer' });
    const params = useParams();

    if (channel.type === 4) {
        return (
            <motion.li
                drag='y'
                dragSnapToOrigin={true}
                draggable={true}
                className={`${styles.category} ${hidden ? styles.hide : ''}`}
                onClick={() => {
                    if (!setHidden) return;
                    if (!hidden) {
                        setHidden((prev: string[]) => [...prev, channel.id]);
                    } else {
                        setHidden((prev: string[]) => prev.filter((id) => id !== channel.id));
                    }
                }}
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFixedLayer({
                        type: 'menu',
                        menu: 'GUILD_CHANNEL',
                        channel: channel,
                        event: {
                            mouseX: e.clientX,
                            mouseY: e.clientY,
                        },
                    });
                }}
            >
                <div>
                    <Icon name='arrow' />
                    <h3>{channel.name}</h3>
                </div>

                <div
                    onMouseEnter={(e) =>
                        setTooltip({
                            text: 'Create Channel',
                            element: e.currentTarget,
                        })
                    }
                    onMouseLeave={() => setTooltip(null)}
                    onClick={(e) => {
                        e.stopPropagation();
                        setPopup({
                            type: 'GUILD_CHANNEL_CREATE',
                            guild: channel.guildId,
                            category: channel,
                        });
                    }}
                >
                    <Icon
                        name='add'
                        size={18}
                        viewbox='0 0 18 18'
                    />
                </div>
            </motion.li>
        );
    }

    return (
        <motion.li
            drag='y'
            dragSnapToOrigin={true}
            draggable={true}
            className={styles.channel}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setFixedLayer({
                    type: 'menu',
                    menu: 'GUILD_CHANNEL',
                    channel: channel,
                    event: {
                        mouseX: e.clientX,
                        mouseY: e.clientY,
                    },
                });
            }}
        >
            <div>
                <div>
                    <Link
                        href={`/channels/${channel.guildId}/${channel.id}`}
                        style={{
                            backgroundColor: params.channelId === channel.id ? 'var(--background-hover-2)' : '',
                        }}
                        onClick={(e) => {
                            if (channel.type === 3) e.preventDefault();
                        }}
                    >
                        <div>
                            <div
                                className={styles.icon}
                                onMouseEnter={(e) => {
                                    setTooltip({
                                        text: channel.type === 2 ? 'Text' : 'Voice',
                                        element: e.currentTarget,
                                        delay: 500,
                                    });
                                }}
                                onMouseLeave={() => setTooltip(null)}
                            >
                                <Icon name={channel.type === 2 ? 'hashtag' : 'voice'} />
                            </div>

                            <div
                                className={styles.name}
                                style={{
                                    color: params.channelId === channel.id ? 'var(--foreground-1)' : '',
                                }}
                            >
                                {channel.name}
                            </div>

                            <div className={styles.tools}>
                                {channel.type === 3 && (
                                    <div
                                        onMouseEnter={(e) =>
                                            setTooltip({
                                                text: 'Open Chat',
                                                element: e.currentTarget,
                                            })
                                        }
                                        onMouseLeave={() => setTooltip(null)}
                                        style={{
                                            display: params.channelId === channel.id ? 'flex' : '',
                                            flex: params.channelId === channel.id ? '0 0 auto' : '',
                                        }}
                                    >
                                        <Icon
                                            name='message'
                                            size={16}
                                            viewbox='0 0 24 24'
                                        />
                                    </div>
                                )}

                                <div
                                    onMouseEnter={(e) =>
                                        setTooltip({
                                            text: 'Create Invite',
                                            element: e.currentTarget,
                                        })
                                    }
                                    onMouseLeave={() => setTooltip(null)}
                                    style={{
                                        display: params.channelId === channel.id ? 'flex' : '',
                                        flex: params.channelId === channel.id ? '0 0 auto' : '',
                                    }}
                                >
                                    <Icon
                                        name='addUserSmall'
                                        size={16}
                                        viewbox='0 0 16 16'
                                    />
                                </div>

                                <div
                                    onMouseEnter={(e) =>
                                        setTooltip({
                                            text: 'Edit Channel',
                                            element: e.currentTarget,
                                        })
                                    }
                                    onMouseLeave={() => setTooltip(null)}
                                    style={{
                                        display: params.channelId === channel.id ? 'flex' : '',
                                        flex: params.channelId === channel.id ? '0 0 auto' : '',
                                    }}
                                >
                                    <Icon
                                        name='corkSmall'
                                        size={16}
                                        viewbox='0 0 16 16'
                                    />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </motion.li>
    );
};

export default Channels;
