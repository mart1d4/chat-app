'use client';

import { ReactElement, Dispatch, SetStateAction } from 'react';
import useContextHook from '@/hooks/useContextHook';
import styles from './ChannelItem.module.css';
import { Icon } from '@/app/app-components';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

type Props = {
    channel: TChannel;
    category?: TChannel;
    hidden?: boolean;
    setHidden?: Dispatch<SetStateAction<string[]>>;
};

const ChannelItem = ({ channel, category, hidden, setHidden }: Props): ReactElement => {
    const { setPopup, setFixedLayer }: any = useContextHook({ context: 'layer' });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const params = useParams();

    if (channel.type === 'GUILD_CATEGORY') {
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
                    <Icon name='arrowSmall' />
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
                            if (channel.type === 'GUILD_VOICE') e.preventDefault();
                        }}
                    >
                        <div>
                            <div
                                className={styles.icon}
                                onMouseEnter={(e) => {
                                    setTooltip({
                                        text: channel.type === 'GUILD_TEXT' ? 'Text' : 'Voice',
                                        element: e.currentTarget,
                                        delay: 500,
                                    });
                                }}
                                onMouseLeave={() => setTooltip(null)}
                            >
                                <Icon name={channel.type === 'GUILD_TEXT' ? 'hashtag' : 'voice'} />
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
                                {channel.type === 'GUILD_VOICE' && (
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

export default ChannelItem;
