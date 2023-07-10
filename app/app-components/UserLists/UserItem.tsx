'use client';

import { Avatar, Icon } from '@/app/app-components';
import useContextHook from '@/hooks/useContextHook';
import useFetchHelper from '@/hooks/useFetchHelper';
import { ReactElement, useRef } from 'react';
import { translateCap } from '@/lib/strings';
import { useRouter } from 'next/navigation';
import styles from './UserItem.module.css';

type Props = {
    content: string;
    user: any;
};

const UserItem = ({ content, user }: Props): ReactElement => {
    const { fixedLayer, setFixedLayer }: any = useContextHook({ context: 'layer' });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { auth }: any = useContextHook({ context: 'auth' });
    const { sendRequest } = useFetchHelper();

    const router = useRouter();
    const liRef = useRef(null);

    const channelExists = (userId: string) => {
        const channel = auth.user.channels.find((channel: any) => {
            return (
                channel.recipients.length === 2 &&
                ((channel.recipientIds[0] === userId && channel.recipientIds[1] === auth.user.id) ||
                    (channel.recipientIds[0] === auth.user.id && channel.recipientIds[1] === userId))
            );
        });

        if (channel) return channel.id;
        else return false;
    };

    return (
        <li
            ref={liRef}
            className={
                fixedLayer?.refElement === liRef.current ? styles.liContainer + ' ' + styles.active : styles.liContainer
            }
            onClick={async () => {
                if (!['all', 'online'].includes(content)) return;

                sendRequest({
                    query: 'CREATE_CHANNEL',
                    data: { recipients: [user.id] },
                });
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                setFixedLayer({
                    type: 'menu',
                    event: {
                        mouseX: e.clientX,
                        mouseY: e.clientY,
                    },
                    user: user,
                    refElement: liRef.current,
                });
            }}
            onMouseEnter={() => {
                if (fixedLayer?.refElement && fixedLayer?.user !== user) {
                    setFixedLayer(null);
                }
            }}
        >
            <div className={styles.li}>
                <div className={styles.userInfo}>
                    <div className={styles.avatarWrapper}>
                        <Avatar
                            src={user.avatar}
                            alt={user.username}
                            size={32}
                            status={content !== 'pending' && content !== 'blocked' && user.status}
                        />
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
                                    : translateCap(user.status)}
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

                                    const channelId = channelExists(user.id);
                                    if (channelId) {
                                        router.push(`/channels/me/${channelId}`);
                                        return;
                                    }

                                    sendRequest({
                                        query: 'CREATE_CHANNEL',
                                        data: { recipients: [user.id] },
                                    });
                                }}
                                onMouseEnter={(e) =>
                                    setTooltip({
                                        text: 'Message',
                                        position: 'top',
                                        element: e.currentTarget,
                                        gap: 3,
                                    })
                                }
                                onMouseLeave={() => setTooltip(null)}
                            >
                                <Icon
                                    name='message'
                                    size={20}
                                />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFixedLayer({
                                        type: 'menu',
                                        event: {
                                            mouseX: e.clientX,
                                            mouseY: e.clientY,
                                        },
                                        user: user,
                                        userlist: true,
                                        refElement: liRef.current,
                                    });
                                }}
                                onMouseEnter={(e) =>
                                    setTooltip({
                                        text: 'More',
                                        element: e.currentTarget,
                                        gap: 3,
                                    })
                                }
                                onMouseLeave={() => setTooltip(null)}
                            >
                                <Icon
                                    name='more'
                                    size={20}
                                />
                            </button>
                        </>
                    )}

                    {content === 'pending' && (
                        <>
                            {user.req === 'Received' && (
                                <button
                                    className={styles.buttonAccept}
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        sendRequest({
                                            query: 'ADD_FRIEND',
                                            params: {
                                                username: user.username,
                                            },
                                        });
                                    }}
                                    onMouseEnter={(e) =>
                                        setTooltip({
                                            text: 'Accept',
                                            element: e.currentTarget,
                                            gap: 3,
                                        })
                                    }
                                    onMouseLeave={() => setTooltip(null)}
                                >
                                    <Icon
                                        name='accept'
                                        size={20}
                                    />
                                </button>
                            )}

                            <button
                                className={styles.buttonCancel}
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    sendRequest({
                                        query: 'REMOVE_FRIEND',
                                        params: {
                                            username: user.username,
                                        },
                                    });
                                }}
                                onMouseEnter={(e) =>
                                    setTooltip({
                                        text: user.req === 'Sent' ? 'Cancel' : 'Ignore',
                                        element: e.currentTarget,
                                        gap: 3,
                                    })
                                }
                                onMouseLeave={() => setTooltip(null)}
                            >
                                <Icon
                                    name='cancel'
                                    size={20}
                                />
                            </button>
                        </>
                    )}

                    {content === 'blocked' && (
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                sendRequest({
                                    query: 'UNBLOCK_USER',
                                    params: {
                                        username: user.username,
                                    },
                                });
                            }}
                            onMouseEnter={(e) =>
                                setTooltip({
                                    text: 'Unblock',
                                    element: e.currentTarget,
                                    gap: 3,
                                })
                            }
                            onMouseLeave={() => setTooltip(null)}
                        >
                            <Icon
                                name='userDelete'
                                size={20}
                            />
                        </button>
                    )}
                </div>
            </div>
        </li>
    );
};

export default UserItem;
