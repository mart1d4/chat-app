'use client';

import { Icon, AvatarStatus } from '@/app/app-components';
import { useRouter, usePathname } from 'next/navigation';
import useContextHook from '@/hooks/useContextHook';
import styles from './UserListItemSmall.module.css';
import { useRef, ReactElement } from 'react';
import Image from 'next/image';

type Props = {
    special?: boolean;
    channel?: ChannelType;
};

const UserListItemSmall = ({ special, channel }: Props): ReactElement => {
    const router = useRouter();
    const pathname = usePathname();
    const listItemRef = useRef<HTMLLIElement>(null);

    const { auth }: any = useContextHook({
        context: 'auth',
    });

    const { fixedLayer, setFixedLayer }: any = useContextHook({
        context: 'layer',
    });

    let user: any;
    if (channel?.type === 0) {
        user = channel?.recipients?.find(
            (recipient) => recipient._id !== auth.user._id
        );
    }

    const requests = [1];

    if (special) {
        return (
            <li
                className={
                    pathname === '/channels/me'
                        ? styles.liContainerActive
                        : styles.liContainer
                }
                onClick={() => router.push('/channels/me')}
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
                                    <div className={styles.nameWrapper}>
                                        Friends
                                    </div>
                                </div>
                            </div>
                        </div>

                        {requests.length > 0 && (
                            <div className={styles.friendsPending}>
                                {requests.length}
                            </div>
                        )}
                    </div>
                </div>
            </li>
        );
    }

    return (
        <li
            ref={listItemRef}
            className={
                pathname === `/channels/me/${channel?._id}`
                    ? styles.liContainerActive
                    : styles.liContainer
            }
            onClick={(e) => {
                e.preventDefault();
                if (pathname === `/channels/me/${channel?._id}` || !channel) {
                    if (!channel) {
                        if (fixedLayer?.element === listItemRef.current) {
                            setFixedLayer(null);
                        } else {
                            setFixedLayer(null);
                            setTimeout(() => {
                                setFixedLayer({
                                    type: 'usercard',
                                    event: e,
                                    user: user,
                                    channel: channel || null,
                                    element: listItemRef.current,
                                    firstSide: 'left',
                                    gap: 16,
                                });
                            }, 10);
                        }
                    }
                    return;
                }
                router.push(`/channels/@me/${channel?._id}`);
            }}
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
                !channel && user?.status === 'Offline'
                    ? {
                          opacity: 0.3,
                      }
                    : {}
            }
        >
            <div className={styles.liWrapper}>
                <div className={styles.link}>
                    <div className={styles.layout}>
                        <div className={styles.layoutAvatar}>
                            {channel?.type === 1 ? (
                                <Image
                                    src={
                                        channel.icon ||
                                        '/assets/default-channel-avatars/blue.png'
                                    }
                                    width={32}
                                    height={32}
                                    alt='Avatar'
                                />
                            ) : (
                                <>
                                    <Image
                                        src={
                                            user?.avatar ||
                                            '/assets/default-avatars/blue.png'
                                        }
                                        width={32}
                                        height={32}
                                        alt='Avatar'
                                    />
                                    {((!channel &&
                                        user?.status !== 'Offline') ||
                                        channel) && (
                                        <AvatarStatus
                                            status={user?.status}
                                            background={
                                                pathname ===
                                                `/channels/me/${channel?._id}`
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
                                    {channel?.type === 1
                                        ? channel.name
                                        : user?.username}
                                </div>
                            </div>

                            {user?.customStatus !== null &&
                                channel?.type !== 1 && (
                                    <div className={styles.contentStatus}>
                                        {user?.customStatus}
                                    </div>
                                )}

                            {channel?.type === 1 && (
                                <div className={styles.contentStatus}>
                                    {channel?.recipients?.length} Member
                                    {channel?.recipients?.length > 1 && 's'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {channel && (
                    <div
                        className={styles.closeButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            // removeChannel();
                        }}
                    >
                        <Icon
                            name='close'
                            size={16}
                        />
                    </div>
                )}
            </div>
        </li>
    );
};

export default UserListItemSmall;
