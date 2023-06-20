'use client';

import useContextHook from '@/hooks/useContextHook';
import { Avatar } from '@/app/app-components';
import { ReactElement, useRef } from 'react';
import styles from './UserItem.module.css';

const UserItem = ({ user }: { user: CleanOtherUserType }): ReactElement => {
    const { fixedLayer, setFixedLayer }: any = useContextHook({ context: 'layer' });
    const listItemRef = useRef<HTMLLIElement>(null);

    return (
        <li
            ref={listItemRef}
            className={styles.liContainer}
            onClick={(e) => {
                e.preventDefault();
                if (fixedLayer?.element === listItemRef.current) {
                    setFixedLayer(null);
                } else {
                    setFixedLayer({
                        type: 'usercard',
                        event: e,
                        user: user,
                        element: listItemRef.current,
                        firstSide: 'left',
                        gap: 16,
                    });
                }
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                setFixedLayer({
                    type: 'menu',
                    event: e,
                    user: user,
                });
            }}
            style={user.status === 'Offline' ? { opacity: 0.3 } : {}}
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

                            {user?.customStatus && (
                                <div className={styles.contentStatus}>{user.customStatus}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
};

export default UserItem;
