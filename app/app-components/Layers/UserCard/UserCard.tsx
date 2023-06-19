'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState, ReactElement, useRef } from 'react';
import useContextHook from '@/hooks/useContextHook';
import { Avatar } from '@/app/app-components';
import styles from './UserCard.module.css';

const UserCard = ({ content, side }: any): ReactElement => {
    const [note, setNote] = useState('');
    const [message, setMessage] = useState('');

    const { setUserProfile, setFixedLayer }: any = useContextHook({ context: 'layer' });
    const { auth }: any = useContextHook({ context: 'auth' });

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
                        <div
                            onClick={() => {
                                setFixedLayer(false);
                                setUserProfile(null);

                                setTimeout(() => {
                                    setUserProfile({ user });
                                }, 10);
                            }}
                        >
                            <Avatar
                                src={user.avatar}
                                alt={user.username}
                                size={80}
                                status={user.status}
                                tooltip={true}
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
