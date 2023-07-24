'use client';

import { ReactElement, useMemo, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Icon, Avatar } from '@/app/app-components';
import useContextHook from '@/hooks/useContextHook';
import useFetchHelper from '@/hooks/useFetchHelper';
import styles from './UserItem.module.css';
import Link from 'next/link';

type Props = {
    special?: boolean;
    channel?: TChannel;
};

const UserItem = ({ special, channel }: Props): ReactElement => {
    const [user, setUser] = useState<TUser | null>(null);

    const { setFixedLayer }: any = useContextHook({ context: 'layer' });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { auth }: any = useContextHook({ context: 'auth' });
    const { sendRequest } = useFetchHelper();

    const token = auth?.accessToken;
    const pathname = usePathname();
    const router = useRouter();

    const badgeCount = useMemo(() => auth.user.requestReceivedIds.length, [auth.user.requestReceivedIds]);

    useEffect(() => {
        if (channel?.type === 0) {
            setUser(channel.recipients.find((user) => user.id !== auth.user.id) as TUser);
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

                            {badgeCount > 0 && (
                                <div className={styles.friendsPending}>{auth.user.requestReceivedIds.length}</div>
                            )}
                        </div>
                    </div>
                </Link>
            ),
            [pathname, badgeCount]
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
                            menu: 'CHANNEL',
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
                                        {channel.type === 1 ? (
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
                                            {channel.type === 1 ? channel.name : user?.username}
                                        </div>
                                    </div>

                                    {user?.customStatus && channel.type !== 1 && (
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

                                    {channel.type === 1 && (
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
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();

                                sendRequest({
                                    query: 'CHANNEL_DELETE',
                                    params: { channelId: channel.id },
                                });

                                if (pathname.includes(channel.id)) {
                                    router.push('/channels/me');
                                }
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
