'use client';

import { ReactElement, useMemo, useEffect, useState } from 'react';
import { leaveChannel } from '@/lib/api-functions/channels';
import { Icon, AvatarStatus } from '@/app/app-components';
import { useRouter, usePathname } from 'next/navigation';
import useContextHook from '@/hooks/useContextHook';
import styles from './UserItem.module.css';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
    special?: boolean;
    channel?: ChannelType;
};

const UserItem = ({ special, channel }: Props): ReactElement => {
    const [user, setUser] = useState<CleanOtherUserType | null>(null);

    const pathname = usePathname();
    const router = useRouter();

    const { auth }: any = useContextHook({
        context: 'auth',
    });
    const { setFixedLayer }: any = useContextHook({
        context: 'layer',
    });

    useEffect(() => {
        if (channel?.type === 'DM') {
            // @ts-ignore
            setUser(channel.recipients.find((user) => user.id !== auth.user.id));
        }
    }, [channel]);

    if (special) {
        return (
            <li
                className={styles.liContainer}
                onClick={() => router.push('/channels/me')}
                style={
                    pathname === '/channels/me'
                        ? {
                              backgroundColor: 'var(--background-5)',
                              color: 'var(--foreground-1)',
                          }
                        : {}
                }
            >
                <div className={styles.liWrapper}>
                    <div className={styles.linkFriends}>
                        <div className={styles.layoutFriends}>
                            <div className={styles.layoutAvatar}>
                                <Icon
                                    name='friends'
                                    fill={
                                        pathname === '/channels/@me'
                                            ? 'var(--foreground-1)'
                                            : 'var(--foreground-3)'
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
                            <div className={styles.friendsPending}>
                                {auth.user.requestReceivedIds.length}
                            </div>
                        )}
                    </div>
                </div>
            </li>
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
                            event: e,
                            user: user,
                            channel: channel || null,
                        });
                    }}
                    style={
                        pathname === `/channels/me/${channel.id}`
                            ? {
                                  backgroundColor: 'var(--background-5)',
                                  color: 'var(--foreground-1)',
                              }
                            : {}
                    }
                >
                    <div className={styles.liWrapper}>
                        <div className={styles.link}>
                            <div className={styles.layout}>
                                <div className={styles.layoutAvatar}>
                                    {channel.type === 'GROUP_DM' ? (
                                        <Image
                                            src={channel.icon || '/assets/channel-avatars/blue.png'}
                                            width={32}
                                            height={32}
                                            alt='Avatar'
                                            draggable={false}
                                        />
                                    ) : (
                                        <>
                                            <Image
                                                src={`/assets/avatars/${
                                                    user?.avatar || 'blue'
                                                }.png`}
                                                width={32}
                                                height={32}
                                                alt='Avatar'
                                            />
                                            {user?.status && user.status !== 'Offline' && (
                                                <AvatarStatus
                                                    status={user.status}
                                                    background={
                                                        pathname === `/channels/me/${channel.id}`
                                                            ? 'var(--background-5)'
                                                            : 'var(--background-3)'
                                                    }
                                                    tooltip={true}
                                                />
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className={styles.layoutContent}>
                                    <div className={styles.contentName}>
                                        <div className={styles.nameWrapper}>
                                            {channel.type === 'GROUP_DM'
                                                ? channel.name
                                                : user?.username}
                                        </div>
                                    </div>

                                    {user?.customStatus !== undefined &&
                                        channel.type !== 'GROUP_DM' && (
                                            <div className={styles.contentStatus}>
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
                                await leaveChannel(channel.id);
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
