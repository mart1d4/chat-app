'use client';

import useContextHook from '@/hooks/useContextHook';
import { Avatar, Icon } from '@/app/app-components';
import { ReactElement, useRef } from 'react';
import styles from './UserItem.module.css';

const UserItem = ({
    user,
    channel,
    isOwner,
}: {
    user: TCleanUser;
    channel: TChannel;
    isOwner: boolean;
}): ReactElement => {
    const { fixedLayer, setFixedLayer }: any = useContextHook({ context: 'layer' });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });

    const liRef = useRef(null);

    return (
        <li
            ref={liRef}
            className={styles.liContainer}
            onClick={(e) => {
                if (fixedLayer?.element === e.currentTarget) {
                    return;
                } else {
                    setFixedLayer({
                        type: 'usercard',
                        element: e.currentTarget,
                        user: user,
                        firstSide: 'LEFT',
                        animation: 'LEFT',
                        gap: 16,
                    });
                }
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                setFixedLayer({
                    type: 'menu',
                    menu: 'USER_GROUP',
                    event: {
                        mouseX: e.clientX,
                        mouseY: e.clientY,
                    },
                    user: user,
                    channel: channel,
                });
            }}
            style={{
                opacity: user.status === 'OFFLINE' && !fixedLayer?.element === liRef.current ? 0.3 : 1,
                backgroundColor: fixedLayer?.element === liRef.current ? 'var(--background-5)' : '',
                color: fixedLayer?.element === liRef.current ? 'var(--foreground-2)' : '',
            }}
        >
            <div className={styles.liWrapper}>
                <div className={styles.link}>
                    <div className={styles.layout}>
                        <div className={styles.layoutAvatar}>
                            <div>
                                <Avatar
                                    src={user.avatar}
                                    alt={user.username}
                                    size={32}
                                    status={user.status}
                                />
                            </div>
                        </div>

                        <div className={styles.layoutContent}>
                            <div className={styles.contentName}>
                                <div>{user.username}</div>
                                <span
                                    onMouseEnter={(e) => {
                                        e.stopPropagation();
                                        setTooltip({
                                            text: 'Group Owner',
                                            element: e.currentTarget,
                                        });
                                    }}
                                    onMouseLeave={() => setTooltip(null)}
                                >
                                    {isOwner && (
                                        <Icon
                                            name='crown'
                                            size={18}
                                            viewbox='0 0 20 20'
                                        />
                                    )}
                                </span>
                            </div>

                            {user?.customStatus && <div className={styles.contentStatus}>{user.customStatus}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
};

export default UserItem;
