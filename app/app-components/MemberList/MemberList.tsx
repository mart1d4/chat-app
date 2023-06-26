'use client';

import { useState, useEffect, useRef, useMemo, ReactElement } from 'react';
import { getButtonColor } from '@/lib/colors/getColors';
import useContextHook from '@/hooks/useContextHook';
import styles from './MemberList.module.css';
import { v4 as uuidv4 } from 'uuid';
import UserItem from './UserItem';
import Icon from '../Icon/Icon';
import Avatar from '../Avatar/Avatar';

const MemberList = ({ channel }: { channel: ChannelType | null }): ReactElement => {
    const [user, setUser] = useState<null | CleanOtherUserType>(null);

    const [mutualFriends, setMutualFriends] = useState<CleanOtherUserType[]>([]);
    const [mutualGuilds, setMutualGuilds] = useState<GuildType[]>([]);
    const [showFriends, setShowFriends] = useState<boolean>(false);
    const [showGuilds, setShowGuilds] = useState<boolean>(false);

    const [widthLimitPassed, setWidthLimitPassed] = useState<boolean>(
        typeof window !== 'undefined' ? window.innerWidth >= 1200 : false
    );
    const [note, setNote] = useState<string>('');

    const { userSettings }: any = useContextHook({ context: 'settings' });
    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { auth }: any = useContextHook({ context: 'auth' });

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
            setUser(channel?.recipients.find((recipient) => recipient.id !== auth.user.id));
        } else {
            setUser(null);
        }
    }, [channel]);

    useEffect(() => {
        if (!user) return;

        const friends = auth.user.friends?.filter((friend: UserType) => user.friendIds?.includes(friend.id));
        setMutualFriends(friends);
        const guilds = auth.user.guilds?.filter((guild: GuildType) => user.guildIds?.includes(guild.id));
        setMutualGuilds(guilds);
    }, [user]);

    return useMemo(() => {
        if (!userSettings.showUsers || !widthLimitPassed) return <></>;

        if (!channel) return <aside className={styles.aside} />;

        if (channel?.type === 'DM' && user) {
            return (
                <aside
                    className={styles.aside}
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
                        <svg
                            className={styles.cardBanner}
                            viewBox='0 0 340 120'
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
                                    cx='58'
                                    cy='112'
                                    r='46'
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
                                            height: '120px',
                                        }}
                                    />
                                </div>
                            </foreignObject>
                        </svg>

                        <div className={styles.cardAvatar}>
                            <div
                                className={styles.avatarImage}
                                style={{
                                    backgroundImage: `url(${process.env.NEXT_PUBLIC_CDN_URL}${user.avatar}/`,
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
                                <div style={{ backgroundColor: 'black' }} />

                                <svg>
                                    <rect
                                        height='100%'
                                        width='100%'
                                        rx={8}
                                        ry={8}
                                        fill='var(--success-light)'
                                        mask='url(#svg-mask-status-online)'
                                    />
                                </svg>
                            </div>
                        </div>

                        <div className={styles.cardBadges}></div>

                        <div className={styles.cardBody}>
                            <div className={styles.cardSection}>
                                <h4>{user.displayName}</h4>
                                <div>{user.username}</div>
                            </div>

                            {user.customStatus && (
                                <div className={styles.cardSection}>
                                    <div>{user.customStatus}</div>
                                </div>
                            )}

                            <div className={styles.cardDivider} />

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

                            <div className={styles.cardDivider} />

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

                        <div className={styles.cardMutuals}>
                            {mutualGuilds.length > 0 && (
                                <>
                                    <button
                                        className={'button'}
                                        onClick={() => setShowGuilds((prev) => !prev)}
                                    >
                                        <div>
                                            {mutualGuilds?.length} Mutual Server
                                            {mutualGuilds?.length > 1 && 's'}
                                        </div>

                                        <div>
                                            <Icon
                                                name='chevron'
                                                size={24}
                                                style={{
                                                    transform: `rotate(${!showGuilds ? '-90deg' : '0deg'})`,
                                                }}
                                            />
                                        </div>
                                    </button>

                                    {showGuilds && (
                                        <ul className={styles.mutualItems}>
                                            {mutualGuilds.map((guild: GuildType) => (
                                                <MutualItem
                                                    key={uuidv4()}
                                                    guild={guild}
                                                />
                                            ))}
                                        </ul>
                                    )}
                                </>
                            )}

                            {mutualFriends.length > 0 && (
                                <>
                                    <button
                                        className={'button'}
                                        onClick={() => setShowFriends((prev) => !prev)}
                                    >
                                        <div>
                                            {mutualFriends?.length} Mutual Friend
                                            {mutualFriends?.length > 1 && 's'}
                                        </div>

                                        <div>
                                            <Icon
                                                name='chevron'
                                                size={24}
                                                style={{
                                                    transform: `rotate(${!showFriends ? '-90deg' : '0deg'})`,
                                                }}
                                            />
                                        </div>
                                    </button>

                                    {showFriends && (
                                        <ul className={styles.mutualItems}>
                                            {mutualFriends.map((friend: CleanOtherUserType) => (
                                                <MutualItem
                                                    key={uuidv4()}
                                                    user={friend}
                                                />
                                            ))}
                                        </ul>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </aside>
            );
        } else {
            const onlineMembers: any = channel.recipients.filter((recipient: any) =>
                ['Online', 'Idle', 'Do_Not_Disturb'].includes(recipient.status)
            );

            const offlineMembers: any = channel.recipients.filter((recipient: any) => recipient.status === 'Offline');

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
    }, [
        userSettings.showUsers,
        widthLimitPassed,
        channel,
        user,
        note,
        mutualFriends,
        mutualGuilds,
        showFriends,
        showGuilds,
    ]);
};

const MutualItem = ({ user, guild }: { user?: CleanOtherUserType; guild?: GuildType }) => {
    if (!user && !guild) return <></>;

    const { setFixedLayer, setUserProfile }: any = useContextHook({ context: 'layer' });

    return (
        <div
            className={styles.mutualItem}
            onClick={() => {
                if (!user) return;
                setUserProfile({ user: user });
            }}
            onContextMenu={(e) => {
                if (!user) return;
                setFixedLayer({
                    type: 'menu',
                    event: {
                        mouseX: e.clientX,
                        mouseY: e.clientY,
                    },
                    user: user,
                });
            }}
        >
            <div>
                {user && (
                    <Avatar
                        src={user.avatar}
                        alt={user.username}
                        size={40}
                        status={user.status}
                    />
                )}

                {guild && (
                    <Avatar
                        src={guild.icon}
                        alt={guild.name}
                        size={40}
                    />
                )}
            </div>

            <div>
                {user && user.username}
                {guild && guild.name}
            </div>
        </div>
    );
};

export default MemberList;
