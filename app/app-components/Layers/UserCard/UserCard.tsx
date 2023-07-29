'use client';

import { useState, ReactElement, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getButtonColor } from '@/lib/colors/getColors';
import useContextHook from '@/hooks/useContextHook';
import { translateCap } from '@/lib/strings';
import { Icon } from '@/app/app-components';
import styles from './UserCard.module.css';

const colors = {
    ONLINE: '#22A559',
    IDLE: '#F0B232',
    DO_NOT_DISTURB: '#F23F43',
    INVISIBLE: '#80848E',
    OFFLINE: '#80848E',
};

const masks = {
    ONLINE: '',
    IDLE: 'status-mask-idle',
    DO_NOT_DISTURB: 'status-mask-dnd',
    INVISIBLE: 'status-mask-offline',
    OFFLINE: 'status-mask-offline',
};

const UserCard = ({ content, resetPosition }: any): ReactElement => {
    const [note, setNote] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const { setUserProfile, setFixedLayer, setShowSettings, setTooltip }: any = useContextHook({ context: 'layer' });
    const { auth }: any = useContextHook({ context: 'auth' });

    const noteRef = useRef<HTMLTextAreaElement>(null);
    const animation = content?.animation;
    const user = content?.user;

    useEffect(() => {
        if (!noteRef.current) return;

        if (noteRef.current.scrollHeight > noteRef.current.clientHeight) {
            noteRef.current.style.height = `${noteRef.current.scrollHeight}px`;
            resetPosition((prev: any) => !prev);
        }

        // If the note is less big than the textarea, reset the height
        if (noteRef.current.scrollHeight < noteRef.current.clientHeight) {
            noteRef.current.style.height = 'auto';
        }
    }, [noteRef, note]);

    return (
        <AnimatePresence>
            {content?.user && (
                <motion.div
                    className={styles.cardContainer}
                    style={
                        {
                            '--card-primary-color': user.primaryColor,
                            '--card-accent-color': user.accentColor,
                            '--card-overlay-color': 'hsla(0, 0%, 0%, 0.6)',
                            '--card-background-color': 'hsla(0, 0%, 0%, 0.45)',
                            '--card-background-hover': 'hsla(0, 0%, 100%, 0.16)',
                            '--card-note-background': 'hsla(0, 0%, 0%, 0.3)',
                            '--card-divider-color': 'hsla(0, 0%, 100%, 0.24)',
                            '--card-button-color': getButtonColor(user.primaryColor, user.accentColor),
                            '--card-border-color': user.primaryColor,
                        } as React.CSSProperties
                    }
                    initial={{
                        transform: animation !== 'off' ? `translateX(${animation === 'LEFT' ? '-' : '+'}20px)` : '',
                    }}
                    animate={{ transform: 'translateX(0px)' }}
                    transition={{ ease: 'easeOut' }}
                >
                    <div>
                        {auth.user.id === user.id && (
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
                                    setShowSettings({
                                        type: 'Profiles',
                                    });
                                }}
                            >
                                <Icon
                                    name='edit'
                                    size={18}
                                />
                            </div>
                        )}

                        <svg
                            className={styles.cardBanner}
                            viewBox={`0 0 340 ${user.banner ? '120' : '90'}`}
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
                                    cy={user.banner ? 112 : 82}
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
                                            height: user.banner ? '120px' : '90px',
                                        }}
                                    />
                                </div>
                            </foreignObject>
                        </svg>

                        <div
                            className={styles.cardAvatar}
                            style={{ top: user.banner ? '76px' : '46px' }}
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

                            <div className={styles.avatarOverlay}>{`View Profile`}</div>

                            <div
                                className={styles.cardAvatarStatus}
                                onMouseEnter={(e) => {
                                    setTooltip({
                                        text: translateCap(user.status),
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
                                        fill={colors[user.status as EUserStatus]}
                                        mask={`url(#${masks[user.status as EUserStatus]})`}
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

                            {auth.user.id !== user.id && (
                                <div className={styles.cardSection}>
                                    <input
                                        className={styles.cardMessage}
                                        value={message}
                                        placeholder={`Message @${user.username}`}
                                        aria-label={`Message @${user.username}`}
                                        maxLength={4000}
                                        autoCorrect='off'
                                        style={{
                                            borderColor: user.primaryColor,
                                        }}
                                        onChange={(e) => {
                                            setMessage(e.currentTarget.value);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UserCard;
