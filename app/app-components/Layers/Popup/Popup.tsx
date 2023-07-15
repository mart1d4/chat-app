'use client';

import { useRef, useEffect, useState, ReactElement, useMemo } from 'react';
import { FixedMessage, LoadingDots, Icon } from '@/app/app-components';
import { AnimatePresence, motion } from 'framer-motion';
import useContextHook from '@/hooks/useContextHook';
import useFetchHelper from '@/hooks/useFetchHelper';
import useLogout from '@/hooks/useLogout';
import filetypeinfo from 'magic-bytes.js';
import styles from './Popup.module.css';

const Popup = (): ReactElement => {
    const { popup, setPopup, setFixedLayer }: any = useContextHook({ context: 'layer' });
    const { auth }: any = useContextHook({ context: 'auth' });
    const { sendRequest } = useFetchHelper();
    const { logout } = useLogout();
    const type = popup?.type;

    const [isLoading, setIsLoading] = useState(false);
    const [uid, setUID] = useState(auth.user.username);
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [password, setPassword] = useState('');

    const [password1, setPassword1] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [password1Error, setPassword1Error] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');

    const [isImage, setIsImage] = useState<boolean>(false);
    const [filename, setFilename] = useState('');
    const [description, setDescription] = useState('');
    const [isSpoiler, setIsSpoiler] = useState(false);

    const popupRef = useRef<HTMLDivElement>(null);
    const uidInputRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!popup?.file) return;

        const imageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/apng', 'image/apng'];

        const isFileImage = async () => {
            const fileBytes = new Uint8Array(await popup?.file.file.arrayBuffer());
            const fileType = filetypeinfo(fileBytes)?.[0]?.mime?.toString();
            setIsImage(imageTypes.includes(fileType ?? ''));
        };

        isFileImage();
    }, [popup?.file]);

    const handleUsernameSubmit = async () => {
        if (isLoading) return;
        setIsLoading(true);

        if (!uid) {
            setUsernameError('Username cannot be empty.');
            setIsLoading(false);
            return;
        }

        if (uid.length < 3 || uid.length > 32) {
            setUsernameError('Username must be between 3 and 32 characters.');
            setIsLoading(false);
            return;
        }

        if (auth.user.username === uid) {
            setUsernameError('Username cannot be the same as your current username.');
            setIsLoading(false);
            return;
        }

        if (!password) {
            setPasswordError('Password cannot be empty.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await sendRequest({
                query: 'UPDATE_USER',
                data: {
                    username: uid,
                    password: password,
                },
            });

            if (!response.success) return setUsernameError(response.message ?? "Couldn't update username.");
            setPassword('');
            setPopup(null);
        } catch (err) {
            console.error(err);
        }

        setIsLoading(false);
    };

    const handlePasswordSubmit = async () => {
        if (isLoading) return;
        setIsLoading(true);

        if (!password1) {
            setPassword1Error('Current password cannot be empty.');
            setIsLoading(false);
            return;
        }

        if (!newPassword) {
            setNewPasswordError('New password cannot be empty.');
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 8 || newPassword.length > 256) {
            setNewPasswordError('New password must be between 8 and 256 characters.');
            setIsLoading(false);
            return;
        }

        if (!confirmPassword) {
            setNewPasswordError('Confirm password cannot be empty.');
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setNewPasswordError('New password and confirm password must match.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await sendRequest({
                query: 'UPDATE_USER',
                data: {
                    password: password1,
                    newPassword: newPassword,
                },
            });

            if (!response.success) return setPassword1Error(response.message ?? "Couldn't update password.");
            setPassword1('');
            setNewPassword('');
            setConfirmPassword('');
            setPopup(null);
        } catch (err) {
            console.error(err);
        }

        setIsLoading(false);
    };

    const props = {
        UPDATE_USERNAME: {
            title: 'Change your username',
            description: 'Enter a new username and your existing password.',
            buttonColor: 'blue',
            buttonText: 'Done',
            function: handleUsernameSubmit,
        },
        UPDATE_PASSWORD: {
            title: 'Update your password',
            description: 'Enter your current password and a new password.',
            buttonColor: 'blue',
            buttonText: 'Done',
            function: handlePasswordSubmit,
        },
        DELETE_MESSAGE: {
            title: 'Delete Message',
            description: 'Are you sure you want to delete this message?',
            buttonColor: 'red',
            buttonText: 'Delete',
            function: () =>
                sendRequest({
                    query: 'DELETE_MESSAGE',
                    params: {
                        channelId: popup.message.channelId[0],
                        messageId: popup.message.id,
                    },
                }),
        },
        PIN_MESSAGE: {
            title: 'Pin It. Pin It Good.',
            description:
                'Hey, just double checking that you want to pin this message to the current channel for posterity and greatness?',
            buttonColor: 'blue',
            buttonText: 'Oh yeah. Pin it',
            function: () =>
                sendRequest({
                    query: 'PIN_MESSAGE',
                    params: {
                        channelId: popup.message.channelId[0],
                        messageId: popup.message.id,
                    },
                }),
        },
        UNPIN_MESSAGE: {
            title: 'Unpin Message',
            description: 'You sure you want to remove this pinned message?',
            buttonColor: 'red',
            buttonText: 'Remove it please!',
            function: () =>
                sendRequest({
                    query: 'UNPIN_MESSAGE',
                    params: {
                        channelId: popup.message.channelId[0],
                        messageId: popup.message.id,
                    },
                }),
        },
        FILE_EDIT: {
            title: popup?.file?.file?.name.startsWith('SPOILER_')
                ? popup.file.file.name.slice(8)
                : popup?.file?.file?.name,
            description: '',
            buttonColor: 'blue',
            buttonText: 'Save',
            function: () =>
                popup.handleFileChange({
                    filename: filename,
                    description: description,
                    isSpoiler: isSpoiler,
                }),
        },
        LOGOUT: {
            title: 'Log Out',
            description: 'Are you sure you want to logout?',
            buttonColor: 'red',
            buttonText: 'Log Out',
            function: () => logout(),
        },
        DELETE_ATTACHMENT: {
            title: 'Are you sure?',
            description: 'This will remove this attachment from this message permanently.',
            buttonColor: 'red',
            buttonText: 'Remove Attachment',
            function: () =>
                sendRequest({
                    query: 'UPDATE_MESSAGE',
                    params: {
                        channelId: popup.message.channelId[0],
                        messageId: popup.message.id,
                    },
                    data: {
                        attachments: popup.attachments,
                    },
                }),
        },
    };

    useEffect(() => {
        if (!popup?.file) return;
        const name = popup?.file.file.name;
        setFilename(name.startsWith('SPOILER_') ? name.slice(8) : name);
        setDescription(popup?.file.description ?? '');
        setIsSpoiler(popup?.file.file.name.startsWith('SPOILER_'));
    }, [popup?.file]);

    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                setPopup(null);
            }

            if (e.key === 'Enter' && !e.shiftKey && popup?.type) {
                e.preventDefault();
                e.stopPropagation();

                props[popup.type as keyof typeof props].function();
                setPopup(null);
            }
        };

        setTimeout(() => {
            window.addEventListener('keydown', handleKeyDown);
        }, 100);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [popup, uid, password, password1, newPassword, confirmPassword, isLoading, filename, description, isSpoiler]);

    useEffect(() => {
        uidInputRef?.current?.focus();
        passwordRef?.current?.focus();
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

    let prop: any;
    if (popup?.type && popup?.type !== 'WARNING') prop = props[popup.type as keyof typeof props];

    return (
        <AnimatePresence>
            {popup?.type && (
                <motion.div
                    key='wrapper'
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
                    onContextMenu={(e) => e.preventDefault()}
                />
            )}

            {popup?.type === 'ATTACHMENT_PREVIEW' ? (
                <motion.div
                    className={styles.container}
                    key='attachment-preview'
                    ref={popupRef}
                    role='dialog'
                    aria-modal='true'
                    initial={{
                        transform: 'translate(-50%, -50%) scale(0.5)',
                        opacity: 0,
                    }}
                    animate={{
                        transform: 'translate(-50%, -50%) scale(1)',
                        opacity: 1,
                    }}
                    exit={{
                        transform: 'translate(-50%, -50%) scale(0.5)',
                        opacity: 0,
                    }}
                    transition={{ ease: 'easeInOut', duration: 0.2 }}
                >
                    <div
                        className={styles.imagePreview}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFixedLayer({
                                type: 'menu',
                                event: {
                                    mouseX: e.clientX,
                                    mouseY: e.clientY,
                                },
                                attachment: popup.attachments[popup.current],
                            });
                        }}
                    >
                        <img
                            src={`${process.env.NEXT_PUBLIC_CDN_URL}/${popup.attachments[popup.current].id}/`}
                            alt={popup.attachments[popup.current]?.description ?? 'Image'}
                        />
                    </div>

                    <a
                        target='_blank'
                        className={styles.imageLink}
                        href={`${process.env.NEXT_PUBLIC_CDN_URL}/${popup.attachments[popup.current].id}/`}
                    >
                        Open in new tab
                    </a>
                </motion.div>
            ) : popup?.type === 'WARNING' ? (
                <motion.div
                    className={styles.container}
                    key='warning'
                    ref={popupRef}
                    role='dialog'
                    aria-modal='true'
                    initial={{
                        transform: 'translate(-50%, -50%) scale(0.5)',
                        opacity: 0,
                    }}
                    animate={{
                        transform: 'translate(-50%, -50%) scale(1)',
                        opacity: 1,
                    }}
                    exit={{
                        transform: 'translate(-50%, -50%) scale(0.5)',
                        opacity: 0,
                    }}
                    transition={{ ease: 'easeInOut', duration: 0.2 }}
                >
                    <div className={styles.warning}>
                        <div>
                            <div className={styles.icons}>
                                <div>
                                    <div />
                                </div>
                                <div>
                                    <div />
                                </div>
                                <div>
                                    <div />
                                </div>
                            </div>

                            <div className={styles.title}>
                                {popup.warning === 'FILE_SIZE'
                                    ? 'Your files are too powerful'
                                    : popup.warning === 'FILE_TYPE'
                                    ? 'Oops, something went wrong...'
                                    : 'Too many uploads!'}
                            </div>

                            <div className={styles.description}>
                                {popup.warning === 'FILE_SIZE'
                                    ? 'Max file size is 10.00 MB please.'
                                    : popup.warning === 'FILE_TYPE'
                                    ? 'Unable to process image'
                                    : 'You can only upload 10 files at a time.'}
                            </div>
                        </div>
                    </div>
                </motion.div>
            ) : popup?.type ? (
                <motion.div
                    key='popup'
                    ref={popupRef}
                    className={styles.cardContainer}
                    initial={{
                        transform: 'translate(-50%, -50%) scale(0.5)',
                        opacity: 0,
                    }}
                    animate={{
                        transform: 'translate(-50%, -50%) scale(1)',
                        opacity: 1,
                    }}
                    exit={{
                        transform: 'translate(-50%, -50%) scale(0.5)',
                        opacity: 0,
                    }}
                    transition={{ ease: 'easeInOut', duration: 0.2 }}
                    style={{
                        width: type === 'FILE_EDIT' ? '530px' : '',
                        padding: type === 'FILE_EDIT' ? '84px 4px 0 4px' : '',
                    }}
                >
                    {type === 'FILE_EDIT' &&
                        (isImage ? (
                            <img
                                className={styles.imagePopup}
                                src={URL.createObjectURL(popup.file.file)}
                                alt={popup.file.file.name}
                            />
                        ) : (
                            <img
                                className={styles.imagePopup}
                                src='/assets/app/file-text.svg'
                                alt={popup.file.file.name}
                            />
                        ))}

                    {type !== 'UPDATE_USERNAME' && type !== 'UPDATE_PASSWORD' ? (
                        <div className={styles.titleBlock}>
                            <h1>{prop.title}</h1>
                        </div>
                    ) : (
                        <div className={styles.titleBlockCentered}>
                            <div>{prop.title}</div>
                            <div>{prop.description}</div>

                            <button onClick={() => setPopup(null)}>
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
                        {type !== 'UPDATE_USERNAME' && type !== 'UPDATE_PASSWORD' && (
                            <>
                                {prop.description && <div className={styles.description}>{prop.description}</div>}

                                {popup?.message && popup.type !== 'DELETE_ATTACHMENT' && (
                                    <div className={styles.messagesContainer}>
                                        <FixedMessage
                                            message={popup.message}
                                            pinned={false}
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {(type === 'DELETE_MESSAGE' || type === 'UNPIN_MESSAGE') && (
                            <div className={styles.protip}>
                                <div>Protip:</div>

                                <div>
                                    You can hold down shift when clicking
                                    <strong> {type === 'DELETE_MESSAGE' ? 'delete message' : 'unpin message'} </strong>
                                    to bypass this confirmation entirely.
                                </div>
                            </div>
                        )}

                        {type === 'FILE_EDIT' && (
                            <>
                                <div className={styles.input}>
                                    <label
                                        htmlFor='uid'
                                        style={{
                                            color: usernameError.length ? 'var(--error-light)' : 'var(--foreground-3)',
                                        }}
                                    >
                                        Filename
                                        {usernameError.length > 0 && (
                                            <span className={styles.errorLabel}>- {usernameError}</span>
                                        )}
                                    </label>
                                    <div className={styles.inputContainer}>
                                        <input
                                            id='filename'
                                            type='text'
                                            name='filename'
                                            aria-label='Filename'
                                            autoCapitalize='off'
                                            autoComplete='off'
                                            autoCorrect='off'
                                            spellCheck='false'
                                            aria-labelledby='filename'
                                            aria-describedby='filename'
                                            value={filename}
                                            maxLength={999}
                                            onChange={(e) => setFilename(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className={styles.input}>
                                    <label
                                        htmlFor='password'
                                        style={{
                                            color: passwordError.length ? 'var(--error-light)' : 'var(--foreground-3)',
                                        }}
                                    >
                                        Description (alt text)
                                        {passwordError.length > 0 && (
                                            <span className={styles.errorLabel}>- {passwordError}</span>
                                        )}
                                    </label>
                                    <div className={styles.inputContainer}>
                                        <input
                                            id='description'
                                            type='text'
                                            name='description'
                                            placeholder='Add a description'
                                            aria-label='Description'
                                            autoCapitalize='off'
                                            autoComplete='off'
                                            autoCorrect='off'
                                            spellCheck='false'
                                            aria-labelledby='description'
                                            aria-describedby='description'
                                            value={description}
                                            maxLength={999}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <label
                                    className={styles.spoilerCheckbox}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsSpoiler(!isSpoiler);
                                    }}
                                >
                                    <input type='checkbox' />

                                    <div style={{ borderColor: isSpoiler ? 'var(--accent-border)' : '' }}>
                                        {isSpoiler && (
                                            <Icon
                                                name='accept'
                                                fill='var(--accent-1)'
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <div>Mark as spoiler</div>
                                    </div>
                                </label>
                            </>
                        )}

                        {type === 'UPDATE_USERNAME' && (
                            <>
                                <div className={styles.input}>
                                    <label
                                        htmlFor='uid'
                                        style={{
                                            color: usernameError.length ? 'var(--error-light)' : 'var(--foreground-3)',
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
                                            color: passwordError.length ? 'var(--error-light)' : 'var(--foreground-3)',
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

                        {type === 'UPDATE_PASSWORD' && (
                            <>
                                <div className={styles.input}>
                                    <label
                                        htmlFor='password1'
                                        style={{
                                            color: password1Error.length ? 'var(--error-light)' : 'var(--foreground-3)',
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

                    <div
                        style={{
                            margin: type === 'FILE_EDIT' ? '0 -4px' : '',
                        }}
                    >
                        <button
                            className='underline'
                            onClick={() => setPopup(null)}
                        >
                            Cancel
                        </button>

                        <button
                            className={prop.buttonColor}
                            onClick={() => {
                                prop.function();
                                setPopup(null);
                            }}
                        >
                            {!isLoading && prop.buttonText}
                            {isLoading && <LoadingDots />}
                        </button>
                    </div>
                </motion.div>
            ) : (
                <></>
            )}
        </AnimatePresence>
    );
};

export default Popup;
