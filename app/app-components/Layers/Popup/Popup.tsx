'use client';

import { deleteMessage, pinMessage, unpinMessage } from '@/lib/api-functions/messages';
import { useRef, useEffect, useState, ReactElement } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useContextHook from '@/hooks/useContextHook';
import { FixedMessage } from '@/app/app-components';
import styles from './Popup.module.css';

const Popup = (): ReactElement => {
    const [isLoading, setIsLoading] = useState(false);
    const [uid, setUID] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [password, setPassword] = useState('');

    const [password1, setPassword1] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [password1Error, setPassword1Error] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');

    const { popup, setPopup }: any = useContextHook({ context: 'layer' });
    const { auth }: any = useContextHook({ context: 'auth' });

    const popupRef = useRef<HTMLDivElement>(null);
    const uidInputRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        uidInputRef?.current?.focus();
        setUID((prev) => prev || auth?.user?.username);
    }, [popup]);

    useEffect(() => {
        setUsernameError('');
    }, [uid]);

    useEffect(() => {
        setPasswordError('');
    }, [password]);

    useEffect(() => {
        setPassword1Error('');
    }, [password1]);

    useEffect(() => {
        setNewPasswordError('');
    }, [newPassword, confirmPassword]);

    const handleUsernameSubmit = async () => {
        if (isLoading) return;
        setIsLoading(true);

        const response = await fetch('/api/users/me', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth.accessToken}`,
            },
            body: JSON.stringify({
                username: uid,
            }),
        });

        if (!response.ok) {
            setUsernameError("Couldn't update username.");
            setPasswordError("Couldn't update username.");
        }

        setIsLoading(false);
    };

    const handlePasswordSubmit = async () => {
        if (isLoading) return;
        setIsLoading(true);

        const response = await fetch('/api/users/me', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth.accessToken}`,
            },
            body: JSON.stringify({
                password: password1,
                newPassword: password,
            }),
        });

        if (!response.ok) {
            setNewPasswordError("Couldn't update password.");
        }

        setIsLoading(false);
    };

    return (
        <AnimatePresence>
            {popup && (
                <motion.div
                    className={styles.wrapper}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onMouseDown={(e) => {
                        if (e.button === 2) return;
                        if (!popupRef?.current?.contains(e.target as Node)) {
                            setPopup(null);
                        }
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                    }}
                >
                    <motion.div
                        ref={popupRef}
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
                        {!popup?.username && !popup?.password ? (
                            <div className={styles.titleBlock}>
                                <h1>
                                    {popup?.delete && 'Delete Message'}
                                    {popup?.pin && 'Pin It. Pin It Good.'}
                                    {popup?.unpin && 'Unpin Message'}
                                </h1>
                            </div>
                        ) : (
                            <div className={styles.titleBlockCentered}>
                                <div>{popup?.username ? 'Change your username' : 'Update your password'}</div>

                                <div>
                                    {popup?.username
                                        ? 'Enter a new username and your existing password.'
                                        : 'Enter your current password and a new password.'}
                                </div>

                                <button
                                    onClick={() => {
                                        setPopup(null);
                                    }}
                                >
                                    <svg
                                        viewBox='0 0 24 24'
                                        width='24'
                                        height='24'
                                        role='image'
                                    >
                                        <path
                                            fill='currentColor'
                                            d='M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z'
                                        />
                                    </svg>
                                </button>
                            </div>
                        )}

                        <div className={styles.popupContent + ' scrollbar'}>
                            {!popup?.username && !popup?.password && (
                                <div>
                                    {popup?.delete && 'Are you sure you want to delete this message?'}
                                    {popup?.pin &&
                                        'Hey, just double checking that you want to pin this message to the current channel for posterity and greatness?'}
                                    {popup?.unpin && 'You sure you want to remove this pinned message?'}
                                </div>
                            )}

                            {!popup?.username && !popup?.password && (
                                <div className={styles.messagesContainer}>
                                    <FixedMessage
                                        message={popup.message}
                                        pinned={false}
                                    />
                                </div>
                            )}

                            {(popup?.delete || popup?.unpin) && (
                                <div className={styles.protip}>
                                    <div>Protip:</div>

                                    <div>
                                        You can hold down shift when clicking
                                        <strong> {popup?.delete ? 'delete message' : 'unpin message'} </strong>
                                        to bypass this confirmation entirely.
                                    </div>
                                </div>
                            )}

                            {popup?.username && (
                                <>
                                    <div className={styles.input}>
                                        <label
                                            htmlFor='uid'
                                            style={{
                                                color: usernameError.length
                                                    ? 'var(--error-light)'
                                                    : 'var(--foreground-3)',
                                            }}
                                        >
                                            Username
                                            {usernameError.length > 0 && (
                                                <span className={styles.errorLabel}>- {usernameError}</span>
                                            )}
                                        </label>
                                        <div className={styles.inputContainer}>
                                            <input
                                                ref={uidInputRef}
                                                id='uid'
                                                type='text'
                                                name='username'
                                                aria-label='Username'
                                                autoCapitalize='off'
                                                autoComplete='off'
                                                autoCorrect='off'
                                                spellCheck='false'
                                                aria-labelledby='uid'
                                                aria-describedby='uid'
                                                value={uid}
                                                onChange={(e) => setUID(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.input}>
                                        <label
                                            htmlFor='password'
                                            style={{
                                                color: passwordError.length
                                                    ? 'var(--error-light)'
                                                    : 'var(--foreground-3)',
                                            }}
                                        >
                                            Current Password
                                            {passwordError.length > 0 && (
                                                <span className={styles.errorLabel}>- {passwordError}</span>
                                            )}
                                        </label>
                                        <div className={styles.inputContainer}>
                                            <input
                                                id='password'
                                                type='password'
                                                name='password'
                                                aria-label='Password'
                                                autoCapitalize='off'
                                                autoComplete='off'
                                                autoCorrect='off'
                                                spellCheck='false'
                                                aria-labelledby='password'
                                                aria-describedby='password'
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {popup?.password && (
                                <>
                                    <div className={styles.input}>
                                        <label
                                            htmlFor='password1'
                                            style={{
                                                color: password1Error.length
                                                    ? 'var(--error-light)'
                                                    : 'var(--foreground-3)',
                                            }}
                                        >
                                            Current Password
                                            {password1Error.length > 0 && (
                                                <span className={styles.errorLabel}>- {password1Error}</span>
                                            )}
                                        </label>
                                        <div className={styles.inputContainer}>
                                            <input
                                                ref={passwordRef}
                                                id='password1'
                                                type='password'
                                                name='password'
                                                aria-label='Password'
                                                autoCapitalize='off'
                                                autoComplete='off'
                                                autoCorrect='off'
                                                spellCheck='false'
                                                aria-labelledby='password'
                                                aria-describedby='password'
                                                value={password1}
                                                onChange={(e) => setPassword1(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div
                                        className={styles.input}
                                        style={{ marginBottom: '20px' }}
                                    >
                                        <label
                                            htmlFor='newPassword'
                                            style={{
                                                color: newPasswordError.length
                                                    ? 'var(--error-light)'
                                                    : 'var(--foreground-3)',
                                            }}
                                        >
                                            New Password
                                            {newPasswordError.length > 0 && (
                                                <span className={styles.errorLabel}>- {newPasswordError}</span>
                                            )}
                                        </label>
                                        <div className={styles.inputContainer}>
                                            <input
                                                id='newPassword'
                                                type='password'
                                                name='password'
                                                aria-label='New Password'
                                                autoCapitalize='off'
                                                autoComplete='off'
                                                autoCorrect='off'
                                                spellCheck='false'
                                                aria-labelledby='password'
                                                aria-describedby='password'
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.input}>
                                        <label
                                            htmlFor='confirmPassword'
                                            style={{
                                                color: newPasswordError.length
                                                    ? 'var(--error-light)'
                                                    : 'var(--foreground-3)',
                                            }}
                                        >
                                            Confirm New Password
                                            {newPasswordError.length > 0 && (
                                                <span className={styles.errorLabel}>- {newPasswordError}</span>
                                            )}
                                        </label>
                                        <div className={styles.inputContainer}>
                                            <input
                                                id='confirmPassword'
                                                type='password'
                                                name='password'
                                                aria-label='Confirm Password'
                                                autoCapitalize='off'
                                                autoComplete='off'
                                                autoCorrect='off'
                                                spellCheck='false'
                                                aria-labelledby='password'
                                                aria-describedby='password'
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div>
                            <button
                                className='underline'
                                onClick={() => setPopup(null)}
                            >
                                Cancel
                            </button>

                            <button
                                className={
                                    popup?.delete || popup?.unpin
                                        ? 'red'
                                        : popup?.pin || popup?.username || popup?.password
                                        ? 'blue'
                                        : 'grey'
                                }
                                onClick={() => {
                                    if (popup?.delete) {
                                        deleteMessage(auth.accessToken, popup.message);
                                    } else if (popup?.pin) {
                                        pinMessage(auth.accessToken, popup.message);
                                    } else if (popup?.unpin) {
                                        unpinMessage(auth.accessToken, popup.message);
                                    } else if (popup?.username) {
                                        if (uid.length < 2) {
                                            setUsernameError('Must be between 2 and 32 in length.');
                                            return;
                                        } else if (uid.length > 32) {
                                            setUsernameError('Must be between 2 and 32 in length.');
                                            return;
                                        } else {
                                            handleUsernameSubmit();
                                            return;
                                        }
                                    } else if (popup?.password) {
                                        if (password1.length === 0) {
                                            setPassword1Error('Your password cannot be empty.');
                                            return;
                                        }
                                        if (newPassword.length < 8) {
                                            setNewPasswordError('Must be 8 or more in length.');
                                            return;
                                        } else if (newPassword !== confirmPassword) {
                                            setNewPasswordError('Passwords do not match.');
                                            return;
                                        } else {
                                            handlePasswordSubmit();
                                            return;
                                        }
                                    }

                                    setPopup(null);
                                }}
                            >
                                {popup?.delete && 'Delete'}
                                {popup?.pin && 'Oh yeah. Pin it'}
                                {popup?.unpin && 'Remove it please!'}
                                {(popup?.username || popup?.password) && !isLoading && 'Done'}
                                {isLoading && <div className={styles.loader} />}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Popup;
