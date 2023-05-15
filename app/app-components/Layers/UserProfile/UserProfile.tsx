'use client';

import { addFriend, getFriends, removeFriend } from '@/lib/api-functions/users';
import { AvatarStatus, Icon, Tooltip } from '@/app/app-components';
import { useEffect, useRef, useState, ReactElement } from 'react';
import { createChannel } from '@/lib/api-functions/channels';
import { AnimatePresence, motion } from 'framer-motion';
import useContextHook from '@/hooks/useContextHook';
import styles from './UserProfile.module.css';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

const UserProfile = (): ReactElement => {
    const [activeNavItem, setActiveNavItem] = useState<number>(0);
    const [mutualFriends, setMutualFriends] = useState<CleanOtherUserType[]>([]);
    const [note, setNote] = useState<string>('');
    const [showTooltip, setShowTooltip] = useState<boolean>(false);

    const { auth }: any = useContextHook({
        context: 'auth',
    });
    const { userProfile, setUserProfile, setFixedLayer }: any = useContextHook({
        context: 'layer',
    });

    const cardRef = useRef<HTMLDivElement>(null);
    const noteRef = useRef<HTMLTextAreaElement>(null);

    const user: null | CleanOtherUserType = userProfile?.user;

    const isSameUser = () => {
        return user?.id === auth.user.id;
    };

    useEffect(() => {
        if (!user) return;

        if (!isSameUser()) {
            const getMutuals = async () => {
                const friends = await getFriends();
                const mutuals = friends.filter((friend: any) => user.friendIds.includes(friend.id));
                setMutualFriends(mutuals);
            };

            getMutuals();
        }

        if (userProfile?.focusNote) noteRef.current?.focus();

        setActiveNavItem(0);
        setNote('');
    }, [user]);

    const sectionNavItems = isSameUser()
        ? ['User Info']
        : ['User Info', 'Mutual Servers', 'Mutual Friends'];

    return (
        <AnimatePresence>
            {user && (
                <motion.div
                    className={styles.wrapper}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
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
                        }}
                        exit={{
                            scale: 0.75,
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.5,
                            type: 'spring',
                            stiffness: 750,
                            damping: 25,
                        }}
                    >
                        <div
                            className={styles.topSection}
                            style={{ backgroundColor: user.primaryColor }}
                        >
                            <div>
                                <Image
                                    src={`/assets/avatars/${user.avatar || 'blue'}.png`}
                                    alt='User Avatar'
                                    width={120}
                                    height={120}
                                />
                                <AvatarStatus
                                    status={
                                        user.friendIds.includes(auth.user.id) || isSameUser()
                                            ? user.status
                                            : 'Offline'
                                    }
                                    background='var(--background-2)'
                                    size
                                    tooltip={true}
                                    tooltipDist={5}
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
                                                            onClick={() => addFriend(user.id)}
                                                        >
                                                            Accept
                                                        </button>

                                                        <button
                                                            className='grey'
                                                            onClick={() => removeFriend(user.id)}
                                                        >
                                                            Ignore
                                                        </button>
                                                    </>
                                                ) : auth.user.friendIds.includes(user.id) ? (
                                                    <button
                                                        className='green'
                                                        onClick={() => createChannel([user.id])}
                                                    >
                                                        Send Message
                                                    </button>
                                                ) : (
                                                    <div>
                                                        <button
                                                            className={
                                                                auth.user.requestSentIds.includes(
                                                                    user.id
                                                                )
                                                                    ? 'green disabled'
                                                                    : 'green'
                                                            }
                                                            onClick={() => {
                                                                if (
                                                                    auth.user.requestSentIds.includes(
                                                                        user.id
                                                                    )
                                                                ) {
                                                                    return;
                                                                }
                                                                addFriend(user.id);
                                                            }}
                                                            onMouseEnter={() =>
                                                                setShowTooltip(true)
                                                            }
                                                            onMouseLeave={() =>
                                                                setShowTooltip(false)
                                                            }
                                                        >
                                                            Send Friend Request
                                                        </button>

                                                        {auth.user.requestSentIds.includes(
                                                            user.id
                                                        ) && (
                                                            <Tooltip
                                                                show={showTooltip}
                                                                // @ts-expect-error
                                                                position='top'
                                                                dist={5}
                                                                big
                                                            >
                                                                You sent a friend request to this
                                                                user.
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFixedLayer({
                                                    type: 'menu',
                                                    event: e,
                                                    user: user,
                                                    userprofile: true,
                                                });
                                            }}
                                            className={styles.moreButton}
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
                                {((user.customStatus && auth.user.friendIds.includes(user.id)) ||
                                    (user.customStatus && isSameUser())) && (
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
                                                        activeNavItem === index
                                                            ? 'var(--foreground-1)'
                                                            : 'transparent',
                                                    cursor:
                                                        activeNavItem === index
                                                            ? 'default'
                                                            : 'pointer',
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
                                        {((user.description &&
                                            auth.user.friendIds.includes(user.id)) ||
                                            (user.description && isSameUser())) && (
                                            <>
                                                <h1>About Me</h1>
                                                <div className={styles.contentUserDescription}>
                                                    {user.description}
                                                </div>
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
                                            mutualFriends.map((friend) => (
                                                <FriendItem
                                                    key={uuidv4()}
                                                    friend={friend}
                                                />
                                            ))
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
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const FriendItem = ({ friend }: any): ReactElement => {
    const [hover, setHover] = useState<boolean>(false);

    const { setUserProfile, setFixedLayer }: any = useContextHook({
        context: 'layer',
    });

    return (
        <div
            className={styles.contentUserFriend}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => {
                setUserProfile(null);

                setTimeout(() => {
                    setUserProfile({ user: friend });
                }, 200);
            }}
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
                <Image
                    src={`/assets/avatars/${friend.avatar || 'blue'}.png`}
                    alt='User Avatar'
                    width={40}
                    height={40}
                />

                <AvatarStatus
                    status={friend?.status}
                    background={hover ? 'var(--background-3)' : 'var(--background-dark)'}
                />
            </div>

            <div>{friend?.username}</div>
        </div>
    );
};

export default UserProfile;
