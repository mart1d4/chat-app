'use client';

import { useState, useEffect, useRef, useMemo, ReactElement } from 'react';
import useContextHook from '@/hooks/useContextHook';
import { Avatar } from '@/app/app-components';
import styles from './MemberList.module.css';
import { v4 as uuidv4 } from 'uuid';
import UserItem from './UserItem';

const MemberList = ({ channel }: { channel: ChannelType }): ReactElement => {
    const [friend, setFriend] = useState<null | CleanOtherUserType>(null);
    const [widthLimitPassed, setWidthLimitPassed] = useState<boolean>(false);
    const [note, setNote] = useState<string>('');

    const { auth }: any = useContextHook({ context: 'auth' });
    const { userSettings }: any = useContextHook({ context: 'settings' });

    const noteRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const width: number = window.innerWidth;

        if (width >= 1200) setWidthLimitPassed(true);
        else setWidthLimitPassed(false);

        const handleResize = () => {
            const width: number = window.innerWidth;

            if (width >= 1200) setWidthLimitPassed(true);
            else setWidthLimitPassed(false);
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (channel?.type === 'DM') {
            // @ts-ignore
            setFriend(channel?.recipients.find((recipient) => recipient.id !== auth.user.id));
        }
    }, []);

    return useMemo(() => {
        if (!userSettings?.showUsers || !widthLimitPassed) return <></>;

        if (channel?.type === 'DM' && friend) {
            return (
                <aside className={styles.aside}>
                    <div
                        className={styles.asideHeader}
                        style={{ backgroundColor: friend.primaryColor }}
                    >
                        <div>
                            <Avatar
                                src={friend.avatar}
                                alt={friend.username}
                                size={80}
                                status={
                                    auth.user.friendIds?.includes(friend.id)
                                        ? friend.status
                                        : 'Offline'
                                }
                                tooltip={true}
                                tooltipGap={8}
                            />
                        </div>
                    </div>

                    <div className={styles.asideContent}>
                        <div className={styles.username}>{friend.username}</div>

                        {friend?.customStatus && auth?.user.friendIds.includes(friend.id) && (
                            <div className={styles.customStatus}>{friend.customStatus}</div>
                        )}

                        <div className={styles.asideDivider} />

                        {friend?.description && auth?.user.friendIds.includes(friend.id) && (
                            <div>
                                <h2>About Me</h2>
                                <div className={styles.contentUserDate}>
                                    <div>{friend.description}</div>
                                </div>
                            </div>
                        )}

                        <div>
                            <h2>Chat App Member Since</h2>
                            <div className={styles.contentUserDate}>
                                <div>
                                    {new Intl.DateTimeFormat('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: '2-digit',
                                    }).format(new Date(friend.createdAt))}
                                </div>
                            </div>
                        </div>

                        <div className={styles.asideDivider} />

                        <div>
                            <h2>Note</h2>
                            <div
                                className={styles.note}
                                style={{
                                    height: noteRef.current?.scrollHeight || 36,
                                }}
                            >
                                <textarea
                                    ref={noteRef}
                                    className='scrollbar'
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder='Click to add a note'
                                    maxLength={256}
                                />
                            </div>
                        </div>
                    </div>

                    <div></div>
                </aside>
            );
        } else {
            const onlineMembers: any = channel.recipients.filter((recipient: any) =>
                ['Online', 'Idle', 'Do_Not_Disturb'].includes(recipient.status)
            );

            const offlineMembers: any = channel.recipients.filter(
                (recipient: any) => recipient.status === 'Offline'
            );

            return (
                <aside className={styles.memberList}>
                    <div>
                        <h2>Members—{channel.recipients.length}</h2>

                        {onlineMembers?.length > 0 &&
                            onlineMembers.map((user: CleanOtherUserType) => (
                                <UserItem
                                    key={uuidv4()}
                                    user={user}
                                />
                            ))}

                        {offlineMembers?.length > 0 &&
                            offlineMembers.map((user: CleanOtherUserType) => (
                                <UserItem
                                    key={uuidv4()}
                                    user={user}
                                />
                            ))}
                    </div>
                </aside>
            );
        }
    }, [userSettings?.showUsers, widthLimitPassed]);
};

export default MemberList;
