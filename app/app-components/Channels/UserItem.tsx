'use client';

import { ReactElement, useMemo, useEffect, useState } from 'react';
import { leaveChannel } from '@/lib/api-functions/channels';
import { useRouter, usePathname } from 'next/navigation';
import { Icon, Avatar } from '@/app/app-components';
import useContextHook from '@/hooks/useContextHook';
import styles from './UserItem.module.css';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
    special?: boolean;
    channel?: ChannelType;
};

const UserItem = ({ special, channel }: Props): ReactElement => {
    const [user, setUser] = useState<UserType | null>(null);

    const { setFixedLayer }: any = useContextHook({ context: 'layer' });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { auth }: any = useContextHook({ context: 'auth' });

    const token = auth?.accessToken;
    const pathname = usePathname();

    useEffect(() => {
        if (channel?.type === 'DM') {
            // @ts-ignore
            setUser(channel.recipients.find((user) => user.id !== auth.user.id));
        }
    }, [channel]);

    if (special) {
        return useMemo(
            () => (
                <Link
                    href={`/channels/me`}
                    className={styles.liContainer}
                    style={{
                        backgroundColor: pathname === '/channels/me' ? 'var(--background-4)' : '',
                        color: pathname === '/channels/me' ? 'var(--foreground-1)' : '',
                    }}
                >
                    <div className={styles.liWrapper}>
                        <div className={styles.linkFriends}>
                            <div className={styles.layoutFriends}>
                                <div className={styles.layoutAvatar}>
                                    <Icon
                                        name='friends'
                                        fill={
                                            pathname === '/channels/@me' ? 'var(--foreground-1)' : 'var(--foreground-3)'
                                        }
                                    />
                                </div>

                                <div className={styles.layoutContent}>
                                    <div className={styles.contentName}>
                                        <div className={styles.nameWrapper}>Friends</div>
                                    </div>
                                </div>
                            </div>

                            {auth.user.requestReceivedIds.length > 0 && (
                                <div className={styles.friendsPending}>{auth.user.requestReceivedIds.length}</div>
                            )}
                        </div>
                    </div>
                </Link>
            ),
            [auth.user.requestReceivedIds, pathname]
        );
    } else if (channel) {
        return useMemo(
            () => (
                <Link
                    className={styles.liContainer}
                    href={`/channels/me/${channel.id}`}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        setFixedLayer({
                            type: 'menu',
                            event: {
                                mouseX: e.clientX,
                                mouseY: e.clientY,
                            },
                            user: user,
                            channel: channel || null,
                        });
                    }}
                    style={{
                        backgroundColor: pathname.includes(channel.id) ? 'var(--background-4)' : '',
                        color: pathname.includes(channel.id) ? 'var(--foreground-1)' : '',
                    }}
                >
                    <div className={styles.liWrapper}>
                        <div className={styles.link}>
                            <div className={styles.layout}>
                                <div className={styles.layoutAvatar}>
                                    <div>
                                        {channel.type === 'GROUP_DM' ? (
                                            <Avatar
                                                src={channel.icon || ''}
                                                alt={channel.name || ''}
                                                size={32}
                                            />
                                        ) : (
                                            <Avatar
                                                src={user?.avatar || ''}
                                                alt={user?.username || ''}
                                                size={32}
                                                status={user?.status}
                                                tooltip={true}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className={styles.layoutContent}>
                                    <div className={styles.contentName}>
                                        <div className={styles.nameWrapper}>
                                            {channel.type === 'GROUP_DM' ? channel.name : user?.username}
                                        </div>
                                    </div>

                                    {user?.customStatus && channel.type !== 'GROUP_DM' && (
                                        <div
                                            className={styles.contentStatus}
                                            onMouseEnter={(e) => {
                                                e.stopPropagation();
                                                setTooltip({
                                                    text: user.customStatus,
                                                    element: e.currentTarget,
                                                    delay: 500,
                                                });
                                            }}
                                            onMouseLeave={(e) => setTooltip(null)}
                                        >
                                            {user.customStatus}
                                        </div>
                                    )}

                                    {channel.type === 'GROUP_DM' && (
                                        <div className={styles.contentStatus}>
                                            {channel.recipients.length} Member
                                            {channel.recipients.length > 1 && 's'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div
                            className={styles.closeButton}
                            onClick={async (e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                await leaveChannel(token, channel.id);
                            }}
                        >
                            <Icon
                                name='close'
                                size={16}
                            />
                        </div>
                    </div>
                </Link>
            ),
            [channel, user, pathname]
        );
    }

    return <></>;
};

export default UserItem;
