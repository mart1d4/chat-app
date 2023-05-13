'use client';

import { leaveChannel } from '@/lib/api-functions/channels';
import { Icon, AvatarStatus } from '@/app/app-components';
import { useRouter, usePathname } from 'next/navigation';
import useContextHook from '@/hooks/useContextHook';
import styles from './UserListItemSmall.module.css';
import { useRef, ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
    special?: boolean;
    channel?: ChannelType;
};

const UserListItemSmall = ({ special, channel }: Props): ReactElement => {
    const router = useRouter();
    const pathname = usePathname();
    const listItemRef = useRef<HTMLAnchorElement>(null);

    const { auth }: any = useContextHook({
        context: 'auth',
    });

    const { fixedLayer, setFixedLayer }: any = useContextHook({
        context: 'layer',
    });

    let user: CleanOtherUserType;
    if (channel?.type === 'DM') {
        user = channel.recipients[0];
    }

    const requests = [1];

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

    if (!channel) {
        return (
            <li
                ref={listItemRef}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setFixedLayer({
                        type: 'menu',
                        event: e,
                        user: user,
                        channel: channel,
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
    }

    return (
        <Link
            ref={listItemRef}
            className={styles.liContainer}
            href={`/channels/me/${channel.id}`}
            onContextMenu={(e) => {
                e.preventDefault();
                setFixedLayer({
                    type: 'menu',
                    event: e,
                    user: user,
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
                                    src={
                                        channel.icon ||
                                        '/assets/channel-avatars/blue.png'
                                    }
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
                                    {user?.status !== 'Offline' && (
                                        <AvatarStatus
                                            status={user.status}
                                            background={
                                                pathname ===
                                                `/channels/me/${channel.id}`
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
                                        : user.username}
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
    );
};

export default UserListItemSmall;
