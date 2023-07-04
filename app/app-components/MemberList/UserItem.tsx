'use client';

import useContextHook from '@/hooks/useContextHook';
import { Avatar } from '@/app/app-components';
import { ReactElement, useRef } from 'react';
import styles from './UserItem.module.css';

const UserItem = ({ user }: { user: TCleanUser }): ReactElement => {
    const { fixedLayer, setFixedLayer }: any = useContextHook({ context: 'layer' });

    const liRef = useRef(null);

    return (
        <li
            ref={liRef}
            className={styles.liContainer}
            onClick={(e) => {
                if (fixedLayer?.element === e.currentTarget) {
                    setFixedLayer(null);
                } else {
                    setFixedLayer({
                        type: 'usercard',
                        element: e.currentTarget,
                        user: user,
                        firstSide: 'left',
                        gap: 16,
                    });
                }
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
                });
            }}
            style={{
                opacity: user.status === 'Offline' && !fixedLayer?.element === liRef.current ? 0.3 : 1,
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
                                <div className={styles.nameWrapper}>{user.username}</div>
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
