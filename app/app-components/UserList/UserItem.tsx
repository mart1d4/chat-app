'use client';

import { addFriend, removeFriend, unblockUser } from '@/lib/api-functions/users';
import { AvatarStatus, Icon, Tooltip } from '@/app/app-components';
import { createChannel } from '@/lib/api-functions/channels';
import { useState, useMemo, ReactNode } from 'react';
import useContextHook from '@/hooks/useContextHook';
import styles from './UserItem.module.css';
import Image from 'next/image';

type Props = {
    content: string;
    user: any;
};

const UserItem = ({ content, user }: Props): ReactNode => {
    const [showTooltip, setShowTooltip] = useState<number>(0);
    const [liHover, setLiHover] = useState<boolean>(false);

    const { auth }: any = useContextHook({ context: 'auth' });
    const { fixedLayer, setFixedLayer }: any = useContextHook({ context: 'layer' });
    const token = auth.accessToken;

    return useMemo(
        () => (
            <li
                className={
                    fixedLayer?.user === user || liHover
                        ? styles.liContainerActive
                        : styles.liContainer
                }
                onClick={async () => {
                    if (content !== 'online' && content !== 'all') return;
                    await createChannel(token, [user.id]);
                }}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setFixedLayer({
                        type: 'menu',
                        event: e,
                        user: user,
                    });
                }}
                onMouseEnter={() => {
                    setLiHover(true);
                    if (!fixedLayer?.user || fixedLayer?.user === user) return;
                    setFixedLayer(null);
                }}
                onMouseLeave={() => setLiHover(false)}
            >
                <div className={styles.li}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatarWrapper}>
                            <Image
                                src={`${process.env.NEXT_PUBLIC_CDN_URL}${user.avatar}/`}
                                width={32}
                                height={32}
                                alt='Avatar'
                            />
                            {content !== 'pending' && content !== 'blocked' && (
                                <AvatarStatus
                                    status={user.status}
                                    background={'var(--background-4)'}
                                />
                            )}
                        </div>
                        <div className={styles.text}>
                            <p className={styles.textUsername}>{user.username}</p>

                            <p className={styles.textStatus}>
                                <span>
                                    {user?.req === 'Sent'
                                        ? 'Outgoing Friend Request'
                                        : user?.req === 'Received'
                                        ? 'Incoming Friend Request'
                                        : content === 'blocked'
                                        ? 'Blocked'
                                        : user.customStatus
                                        ? user.customStatus
                                        : user.status}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        {(content === 'all' || content === 'online') && (
                            <>
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        await createChannel(token, [user.id]);
                                    }}
                                    onMouseEnter={() => setShowTooltip(1)}
                                    onMouseLeave={() => setShowTooltip(0)}
                                >
                                    <Icon
                                        name='message'
                                        size={20}
                                        fill={showTooltip === 1 ? 'var(--foreground-2)' : ''}
                                    />

                                    <Tooltip
                                        show={showTooltip === 1}
                                        dist={4}
                                    >
                                        Message
                                    </Tooltip>
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFixedLayer({
                                            type: 'menu',
                                            event: e,
                                            user: user,
                                            userlist: true,
                                        });
                                    }}
                                    onMouseEnter={() => setShowTooltip(2)}
                                    onMouseLeave={() => setShowTooltip(0)}
                                >
                                    <Icon
                                        name='more'
                                        size={20}
                                        fill={showTooltip === 2 ? 'var(--foreground-2)' : ''}
                                    />

                                    <Tooltip
                                        show={showTooltip === 2}
                                        dist={4}
                                    >
                                        More
                                    </Tooltip>
                                </button>
                            </>
                        )}

                        {content === 'pending' && (
                            <>
                                {user.req === 'Received' && (
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            await addFriend(token, user.username);
                                        }}
                                        onMouseEnter={() => setShowTooltip(1)}
                                        onMouseLeave={() => setShowTooltip(0)}
                                    >
                                        <Icon
                                            name='accept'
                                            size={20}
                                            fill={showTooltip === 1 ? 'var(--success-light)' : ''}
                                        />

                                        <Tooltip
                                            show={showTooltip === 1}
                                            dist={4}
                                        >
                                            Accept
                                        </Tooltip>
                                    </button>
                                )}

                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        await removeFriend(token, user.username);
                                    }}
                                    onMouseEnter={() => setShowTooltip(2)}
                                    onMouseLeave={() => setShowTooltip(0)}
                                >
                                    <Icon
                                        name='cancel'
                                        size={20}
                                        fill={showTooltip === 2 ? 'var(--error-1)' : ''}
                                    />

                                    <Tooltip
                                        show={showTooltip === 2}
                                        dist={4}
                                    >
                                        {user.req === 'Sent' ? 'Cancel' : 'Ignore'}
                                    </Tooltip>
                                </button>
                            </>
                        )}

                        {content === 'blocked' && (
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    await unblockUser(token, user.id);
                                }}
                                onMouseEnter={() => setShowTooltip(1)}
                                onMouseLeave={() => setShowTooltip(0)}
                            >
                                <Icon
                                    name='userDelete'
                                    size={20}
                                    fill={showTooltip === 1 ? 'var(--error-1)' : ''}
                                />

                                <Tooltip
                                    show={showTooltip === 1}
                                    dist={4}
                                >
                                    Unblock
                                </Tooltip>
                            </button>
                        )}
                    </div>
                </div>
            </li>
        ),
        [showTooltip, fixedLayer, liHover]
    );
};

export default UserItem;
