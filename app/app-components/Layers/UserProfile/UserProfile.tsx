'use client';

import { addFriend, removeFriend } from '@/lib/api-functions/users';
import { useEffect, useRef, useState, ReactElement } from 'react';
import { createChannel } from '@/lib/api-functions/channels';
import { AnimatePresence, motion } from 'framer-motion';
import { getButtonColor } from '@/lib/colors/getColors';
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
                            setTooltip(null);
                        }
                    }}
                >
                    <motion.div
                        ref={cardRef}
                        className={styles.cardContainer}
                        initial={{ scale: 0.75 }}
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
                        style={
                            {
                                '--card-primary-color': user.primaryColor,
                                '--card-accent-color': user.accentColor,
                                '--card-overlay-color': 'hsla(0, 0%, 0%, 0.6)',
                                '--card-background-color': 'hsla(0, 0%, 0%, 0.45)',
                                '--card-background-hover': 'hsla(0, 0%, 100%, 0.16)',
                                '--card-note-background': 'hsla(0, 0%, 0%, 0.3)',
                                '--card-divider-color': 'hsla(0, 0%, 100%, 0.24)',
                                '--card-button-color': getButtonColor(user.primaryColor, user.accentColor as string),
                                '--card-border-color': user.primaryColor,
                            } as React.CSSProperties
                        }
                    >
                        <div>
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
                                        setFixedLayer(null);
                                        setUserProfile(null);
                                        setTooltip(null);
                                        setShowSettings({
                                            type: 'Profiles',
                                        });
                                    }}
                                >
                                    <Icon
                                        name='edit'
                                        size={24}
                                    />
                                </div>
                            )}

                            <svg
                                className={styles.cardBanner}
                                viewBox={`0 0 600 ${user.banner ? '212' : '106'}`}
                                style={{
                                    minHeight: user.banner ? '212px' : '106px',
                                    minWidth: '600px',
                                }}
                            >
                                <mask id='card-banner-mask'>
                                    <rect
                                        fill='white'
                                        x='0'
                                        y='0'
                                        width='100%'
                                        height='100%'
                                    />
                                    <circle
                                        fill='black'
                                        cx='82'
                                        cy={user.banner ? 207 : 101}
                                        r='68'
                                    />
                                </mask>

                                <foreignObject
                                    x='0'
                                    y='0'
                                    width='100%'
                                    height='100%'
                                    overflow='visible'
                                    mask='url(#card-banner-mask)'
                                >
                                    <div>
                                        <div
                                            className={styles.cardBannerBackground}
                                            style={{
                                                backgroundColor: !user.banner ? user.primaryColor : '',
                                                backgroundImage: user.banner
                                                    ? `url(${process.env.NEXT_PUBLIC_CDN_URL}${user.banner}/`
                                                    : '',
                                                height: user.banner ? '212px' : '106px',
                                            }}
                                        />
                                    </div>
                                </foreignObject>
                            </svg>

                            <div
                                className={styles.cardAvatar}
                                style={{ top: user.banner ? '151px' : '46px' }}
                            >
                                <div
                                    className={styles.avatarImage}
                                    style={{
                                        backgroundImage: `url(${process.env.NEXT_PUBLIC_CDN_URL}${user.avatar}/`,
                                    }}
                                    onClick={() => {
                                        setFixedLayer(null);
                                        setUserProfile({ user: user });
                                    }}
                                />

                                <div
                                    className={styles.cardAvatarStatus}
                                    onMouseEnter={(e) => {
                                        setTooltip({
                                            text: user.status,
                                            element: e.currentTarget,
                                            gap: 5,
                                        });
                                    }}
                                    onMouseLeave={() => setTooltip(null)}
                                >
                                    <div />

                                    <svg>
                                        <rect
                                            height='100%'
                                            width='100%'
                                            rx={12}
                                            ry={12}
                                            fill='var(--success-light)'
                                            mask='url(#svg-mask-status-online)'
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className={styles.cardBadges}></div>

                            <div className={styles.cardBody}>
                                <div className={styles.cardSection + ' ' + styles.name}>
                                    <h4>{user.displayName}</h4>
                                    <div>{user.username}</div>
                                </div>

                                {user.customStatus && (
                                    <div className={styles.cardSection}>
                                        <div>{user.customStatus}</div>
                                    </div>
                                )}

                                {!isSameUser() && (
                                    <div className={styles.contentNav}>
                                        <div>
                                            {sectionNavItems.map((item, index) => (
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
                                                        cursor: activeNavItem === index ? 'default' : 'pointer',
                                                    }}
                                                    onClick={() => setActiveNavItem(index)}
                                                >
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeNavItem === 0 && (
                                    <div className={styles.scrollContainer + ' scrollbar'}>
                                        {user.description && (
                                            <div className={styles.cardSection}>
                                                <h4>About me</h4>
                                                <div>{user.description}</div>
                                            </div>
                                        )}

                                        <div className={styles.cardSection}>
                                            <h4>Chat App Member Since</h4>
                                            <div>
                                                {new Intl.DateTimeFormat('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                }).format(new Date(user.createdAt))}
                                            </div>
                                        </div>

                                        <div className={styles.cardSection}>
                                            <h4>Note</h4>
                                            <div>
                                                <textarea
                                                    className={styles.cardInput + ' scrollbar'}
                                                    ref={noteRef}
                                                    value={note}
                                                    placeholder='Click to add a note'
                                                    aria-label='Note'
                                                    maxLength={256}
                                                    autoCorrect='off'
                                                    onInput={(e) => {
                                                        setNote(e.currentTarget.value);
                                                    }}
                                                />
                                            </div>
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
                                            <div className={styles.scrollContainer + ' scrollbar ' + styles.margin}>
                                                {mutualFriends.map((friend) => (
                                                    <FriendItem
                                                        key={uuidv4()}
                                                        friend={friend}
                                                    />
                                                ))}
                                            </div>
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

{
    /* <div className={styles.topSectionToolbar}>
                                <div></div>

                                {!isSameUser() && (
                                    <div>
                                        {!auth.user.blockedUserIds.includes(user.id) && (
                                            <>
                                                {auth.user.requestReceivedIds.includes(user.id) ? (
                                                    <>
                                                        <button
                                                            className='green'
                                                            onClick={async () =>
                                                                await addFriend(
                                                                    token,
                                                                    user.username
                                                                )
                                                            }
                                                        >
                                                            Accept
                                                        </button>

                                                        <button
                                                            className='grey'
                                                            onClick={async () =>
                                                                await removeFriend(
                                                                    token,
                                                                    user.username
                                                                )
                                                            }
                                                        >
                                                            Ignore
                                                        </button>
                                                    </>
                                                ) : auth.user.friendIds.includes(user.id) ? (
                                                    <button
                                                        className='green'
                                                        onClick={async () =>
                                                            await createChannel(token, [user.id])
                                                        }
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
                                                            onClick={async () => {
                                                                if (
                                                                    auth.user.requestSentIds?.includes(
                                                                        user.id
                                                                    )
                                                                ) {
                                                                    return;
                                                                }
                                                                await addFriend(
                                                                    token,
                                                                    user.username
                                                                );
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (
                                                                    !auth.user.requestSentIds?.includes(
                                                                        user.id
                                                                    )
                                                                )
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
                                                    event: {
                                                        mouseX: e.clientX,
                                                        mouseY: e.clientY,
                                                    },
                                                    user: user,
                                                    userprofile: true,
                                                });
                                            }}
                                        >
                                            <Icon name='more' />
                                        </div>
                                    </div>
                                )}
                            </div> */
}

const FriendItem = ({ friend }: { friend: UserType }): ReactElement => {
    const { setUserProfile, setFixedLayer }: any = useContextHook({ context: 'layer' });

    return (
        <div
            className={styles.userItem}
            onClick={() => setUserProfile({ user: friend })}
            onContextMenu={(e) => {
                setFixedLayer({
                    type: 'menu',
                    event: {
                        mouseX: e.clientX,
                        mouseY: e.clientY,
                    },
                    user: friend,
                });
            }}
        >
            <div>
                <Avatar
                    src={friend.avatar}
                    alt={friend.username}
                    size={40}
                    status={friend.status}
                />
            </div>

            <div>{friend?.username}</div>
        </div>
    );
};

export default UserProfile;
