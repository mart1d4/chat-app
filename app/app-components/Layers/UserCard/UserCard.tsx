'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState, ReactElement, useRef } from 'react';
import { AvatarStatus } from '@/app/app-components';
import useContextHook from '@/hooks/useContextHook';
import styles from './UserCard.module.css';
import Image from 'next/image';

const UserCard = ({ content, side, resetPosition }: any): ReactElement => {
    const [note, setNote] = useState('');
    const [message, setMessage] = useState('');

    const { auth }: any = useContextHook({
        context: 'auth',
    });
    const { setUserProfile, setFixedLayer }: any = useContextHook({
        context: 'layer',
    });

    const noteRef = useRef<HTMLTextAreaElement>(null);
    const user = content?.user;

    return (
        <AnimatePresence>
            {content?.user && (
                <motion.div
                    className={styles.cardContainer}
                    initial={{
                        transform: `translateX(${side === 'left' && '-'}20px)`,
                    }}
                    animate={{ transform: 'translateX(0px)' }}
                    transition={{ ease: 'easeOut' }}
                >
                    <div
                        className={styles.topSection}
                        style={{ backgroundColor: user.primaryColor }}
                    >
                        <div>
                            <Image
                                src={`/assets/avatars/${user.avatar}.png`}
                                alt='User Avatar'
                                width={80}
                                height={80}
                                onClick={() => {
                                    setFixedLayer(false);
                                    setUserProfile(null);

                                    setTimeout(() => {
                                        setUserProfile({ user });
                                    }, 10);
                                }}
                            />

                            <div className={styles.layer}>View Profile</div>

                            <AvatarStatus
                                status={user.status}
                                background='var(--background-2)'
                                mid
                                tooltip
                                tooltipDist={5}
                            />
                        </div>
                    </div>

                    <div className={styles.badges}></div>

                    <div className={styles.contentSection}>
                        <div className={styles.username}>{user?.username}</div>

                        {user?.customStatus && (
                            <div className={styles.customStatus}>{user.customStatus}</div>
                        )}

                        <div className={styles.contentSeparator} />

                        <div className={styles.contentUser + ' scrollbar'}>
                            {user?.description && (
                                <div>
                                    <h1>About Me</h1>
                                    <div className={styles.contentUserDescription}>
                                        {user.description}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h1>Chat App Member Since</h1>
                                <div>
                                    {new Intl.DateTimeFormat('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: '2-digit',
                                    }).format(new Date(user.createdAt))}
                                </div>
                            </div>

                            <div>
                                <h1>Note</h1>
                                <div className={styles.note}>
                                    <textarea
                                        className='scrollbar'
                                        ref={noteRef}
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder='Click to add a note'
                                        maxLength={256}
                                    />
                                </div>
                            </div>

                            {auth.user.id !== user.id && (
                                <div>
                                    <div className={styles.message}>
                                        <input
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder={`Message @${user.username}`}
                                            maxLength={4000}
                                        />
                                    </div>
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
