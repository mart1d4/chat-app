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
    hide?: boolean;
    setToShow?: Dispatch<SetStateAction<string[]>>;
};

const ChannelItem = ({ channel, category, hide, setToShow }: Props): ReactElement => {
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { setPopup }: any = useContextHook({ context: 'layer' });
    const params = useParams();

    if (channel.type === 'GUILD_CATEGORY') {
        return (
            <motion.li
                drag='y'
                dragSnapToOrigin={true}
                draggable={true}
                className={`${styles.category} ${hide ? styles.hide : ''}`}
                onClick={() => {
                    if (!setToShow) return;
                    if (!hide) {
                        setToShow((prev: string[]) => prev.filter((id) => id !== channel.id));
                    } else {
                        setToShow((prev: string[]) => [...prev, channel.id]);
                    }
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
                            category: category ?? channel,
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
        >
            <div>
                <div>
                    <Link
                        href={`/channels/${channel.guildId}/${channel.id}`}
                        style={{
                            backgroundColor: params.channelId === channel.id ? 'var(--background-hover-2)' : '',
                        }}
                    >
                        <div>
                            <div className={styles.icon}>
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
