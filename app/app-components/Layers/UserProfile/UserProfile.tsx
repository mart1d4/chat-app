'use client';

import { addFriend, removeFriend } from '@/lib/api-functions/users';
import { useEffect, useRef, useState, ReactElement } from 'react';
import { createChannel } from '@/lib/api-functions/channels';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar, Icon } from '@/app/app-components';
import useContextHook from '@/hooks/useContextHook';
import styles from './UserProfile.module.css';
import { v4 as uuidv4 } from 'uuid';

const UserProfile = (): ReactElement => {
    const [activeNavItem, setActiveNavItem] = useState<number>(0);
    const [mutualFriends, setMutualFriends] = useState<CleanOtherUserType[]>([]);
    const [note, setNote] = useState<string>('');

    const { userProfile, setUserProfile, fixedLayer, setFixedLayer, setShowSettings }: any = useContextHook({
        context: 'layer',
    });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { auth }: any = useContextHook({ context: 'auth' });
    const token = auth.accessToken;

    const cardRef = useRef<HTMLDivElement>(null);
    const noteRef = useRef<HTMLTextAreaElement>(null);

    const user: null | CleanOtherUserType = userProfile?.user;

    const isSameUser = () => user?.id === auth.user.id;

    const shouldShowContent = () => {
        return (
            auth.user.friendIds?.includes(user?.id) || auth.user.requestsReceivedIds?.includes(user?.id) || isSameUser()
        );
    };

    useEffect(() => {
        if (!user) return;

        if (!isSameUser()) {
            const friends = auth.user.friends || [];
            const mutuals = friends.filter((friend: any) => user.friendIds.includes(friend.id));
            setMutualFriends(mutuals);
        }

        if (userProfile.focusNote) noteRef.current?.focus();

        setActiveNavItem(0);
        setNote('');
    }, [user]);

    useEffect(() => {
        const handleClick = (e: KeyboardEvent) => {
            if (fixedLayer) return;
            if (e.key === 'Escape') setUserProfile(null);
        };

        window.addEventListener('keydown', handleClick);

        return () => window.removeEventListener('keydown', handleClick);
    }, [userProfile, fixedLayer]);

    const sectionNavItems = isSameUser() ? ['User Info'] : ['User Info', 'Mutual Servers', 'Mutual Friends'];

    return (
        <AnimatePresence>
            {user && (
                <div
                    className={styles.wrapper}
                    onMouseDown={(e) => {
                        if (e.button === 2) return;
                        if (!cardRef.current?.contains(e.target as Node)) {
                            setUserProfile(null);
                            setFixedLayer(null);
                        }
                    }}
                >
                    <motion.div
                        ref={cardRef}
                        className={styles.cardContainer}
                        initial={{
                            scale: 0.75,
                        }}
                        animate={{
                            scale: 1,
                            transition: {
                                duration: 0.2,
                            },
                        }}
                        exit={{
                            scale: 0,
                            opacity: 0,
                            transition: {
                                duration: 0.1,
                            },
                        }}
                    >
                        <div className={styles.topSection} style={{ backgroundColor: user.primaryColor }}>
                            {isSameUser() && (
                                <div
                                    className={styles.editProfileButton}
                                    aria-label='Edit Profile'
                                    role='button'
                                    onMouseEnter={(e) => {
                                        setTooltip({
                                            text: 'Edit Profile',
                                            element: e.currentTarget,
                                        });
                                    }}
                                    onMouseLeave={() => setTooltip(null)}
                                    onClick={() => {
                                        setUserProfile(null);
                                        setShowSettings({
                                            type: 'Profiles',
                                        });
                                    }}
                                >
                                    <Icon name='edit' />
                                </div>
                            )}

                            <div className={styles.avatar}>
                                <Avatar
                                    src={user.avatar}
                                    alt={user.username}
                                    size={120}
                                    status={shouldShowContent() ? user.status : 'Offline'}
                                    tooltip={true}
                                    tooltipGap={8}
                                />
                            </div>

                            <div className={styles.topSectionToolbar}>
                                <div></div>

                                {!isSameUser() && (
                                    <div>
                                        {!auth.user.blockedUserIds.includes(user.id) && (
                                            <>
                                                {auth.user.requestReceivedIds.includes(user.id) ? (
                                                    <>
                                                        <button
                                                            className='green'
                                                            onClick={async () => await addFriend(token, user.username)}
                                                        >
                                                            Accept
                                                        </button>

                                                        <button
                                                            className='grey'
                                                            onClick={async () =>
                                                                await removeFriend(token, user.username)
                                                            }
                                                        >
                                                            Ignore
                                                        </button>
                                                    </>
                                                ) : auth.user.friendIds.includes(user.id) ? (
                                                    <button
                                                        className='green'
                                                        onClick={async () => await createChannel(token, [user.id])}
                                                    >
                                                        Send Message
                                                    </button>
                                                ) : (
                                                    <div>
                                                        <button
                                                            className={
                                                                auth.user.requestSentIds.includes(user.id)
                                                                    ? 'green disabled'
                                                                    : 'green'
                                                            }
                                                            onClick={async () => {
                                                                if (auth.user.requestSentIds?.includes(user.id)) {
                                                                    return;
                                                                }
                                                                await addFriend(token, user.username);
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!auth.user.requestSentIds?.includes(user.id))
                                                                    return;
                                                                setTooltip({
                                                                    text: 'You sent a friend request to this user.',
                                                                    element: e.currentTarget,
                                                                    gap: 5,
                                                                });
                                                            }}
                                                            onMouseLeave={() => setTooltip(null)}
                                                        >
                                                            Send Friend Request
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        <div
                                            className={styles.moreButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFixedLayer({
                                                    type: 'menu',
                                                    event: e,
                                                    user: user,
                                                    userprofile: true,
                                                });
                                            }}
                                        >
                                            <Icon name='more' />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.contentSection}>
                            <div className={styles.contentHeader}>
                                <div className={styles.username}>{user.username}</div>
                                {user.customStatus && shouldShowContent() && (
                                    <div className={styles.customStatus}>{user.customStatus}</div>
                                )}
                            </div>

                            <div className={styles.contentNav}>
                                <div>
                                    {!isSameUser() &&
                                        sectionNavItems.map((item, index) => (
                                            <div
                                                className={styles.contentNavItem}
                                                key={index}
                                                style={{
                                                    color:
                                                        activeNavItem === index
                                                            ? 'var(--foreground-1)'
                                                            : 'var(--foreground-3)',
                                                    borderColor:
                                                        activeNavItem === index ? 'var(--foreground-1)' : 'transparent',
                                                    cursor: activeNavItem === index ? 'default' : 'pointer',
                                                }}
                                                onClick={() => setActiveNavItem(index)}
                                            >
                                                {item}
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <div
                                className={styles.contentUser + ' scrollbar'}
                                style={{
                                    padding: activeNavItem === 0 ? '0 12px' : '',
                                }}
                            >
                                {activeNavItem === 0 && (
                                    <div>
                                        {user.description && shouldShowContent() && (
                                            <>
                                                <h1>About Me</h1>
                                                <div className={styles.contentUserDescription}>{user.description}</div>
                                            </>
                                        )}

                                        <h1>Chat App Member Since</h1>
                                        <div className={styles.contentUserDate}>
                                            <div>
                                                {new Intl.DateTimeFormat('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: '2-digit',
                                                }).format(new Date(user.createdAt))}
                                            </div>
                                        </div>

                                        <h1>Note</h1>
                                        <div className={styles.contentNote}>
                                            <textarea
                                                ref={noteRef}
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                                placeholder='Click to add a note'
                                                maxLength={256}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeNavItem === 1 && (
                                    <div className={styles.empty}>
                                        <div />
                                        <div>No servers in common</div>
                                    </div>
                                )}

                                {activeNavItem === 2 && (
                                    <>
                                        {mutualFriends.length > 0 ? (
                                            mutualFriends.map((friend) => <FriendItem key={uuidv4()} friend={friend} />)
                                        ) : (
                                            <div className={styles.empty + ' ' + styles.noFriends}>
                                                <div />
                                                <div>No friends in common</div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const FriendItem = ({ friend }: { friend: CleanOtherUserType }): ReactElement => {
    const { setUserProfile, setFixedLayer }: any = useContextHook({ context: 'layer' });

    return (
        <div
            className={styles.contentUserFriend}
            onClick={() => setUserProfile({ user: friend })}
            onContextMenu={(e) => {
                e.preventDefault();
                setFixedLayer({
                    type: 'menu',
                    event: e,
                    user: friend,
                });
            }}
        >
            <div>
                <Avatar src={friend.avatar} alt={friend.username} size={40} status={friend.status} />
            </div>

            <div>{friend?.username}</div>
        </div>
    );
};

export default UserProfile;
