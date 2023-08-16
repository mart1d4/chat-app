'use client';

import { FixedMessage, LoadingDots, Icon, Avatar, Checkbox } from '@components';
import { useRef, useEffect, useState, ReactElement } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useContextHook from '@/hooks/useContextHook';
import useFetchHelper from '@/hooks/useFetchHelper';
import { base } from '@uploadcare/upload-client';
import { useRouter } from 'next/navigation';
import useLogout from '@/hooks/useLogout';
import filetypeinfo from 'magic-bytes.js';
import styles from './Popup.module.css';
import Image from 'next/image';

export const Popup = (): ReactElement => {
    const { popup, setPopup, setFixedLayer }: any = useContextHook({ context: 'layer' });
    const { sendRequest } = useFetchHelper();
    const { logout } = useLogout();
    const router = useRouter();
    const type = popup?.type;

    const [isLoading, setIsLoading] = useState(false);
    const [uid, setUID] = useState('auth.user.username');
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

    const [join, setJoin] = useState(false);
    const [guildTemplate, setGuildTemplate] = useState<number>(0);
    const [guildName, setGuildName] = useState("`${auth.user.username}'s server`");
    const [guildIcon, setGuildIcon] = useState<null | File>(null);

    const [channelName, setChannelName] = useState('');
    const [channelType, setChannelType] = useState(2);
    const [channelLocked, setChannelLocked] = useState(false);

    const popupRef = useRef<HTMLDivElement>(null);
    const uidInputRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const guildIconInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Reset all state when popup is closed
        if (!popup) {
            setIsLoading(false);
            setUID('auth.user.username');
            setPassword('');
            setPassword1('');
            setNewPassword('');
            setConfirmPassword('');
            setPassword1Error('');

            setFilename('');
            setDescription('');
            setIsSpoiler(false);

            setJoin(false);
            setGuildTemplate(0);
            setGuildName("`${auth.user.username}'s server`");
            setGuildIcon(null);

            setChannelName('');
            setChannelType(2);
            setChannelLocked(false);
        }
    }, [popup]);

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

        // if (auth.user.username === uid) {
        //     setUsernameError('Username cannot be the same as your current username.');
        //     setIsLoading(false);
        //     return;
        // }

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
        CREATE_GUILD: {
            title: join || guildTemplate ? 'Customize your server' : 'Create a server',
            description:
                join || guildTemplate
                    ? 'Give your new server a personality with a name and an icon. You can always change it later'
                    : 'Your server is where you and your friends hang out. Make yours and start talking.',
            buttonColor: join || guildTemplate ? 'blue' : 'grey',
            buttonText: join ? 'Join server' : guildTemplate ? 'Create' : 'Join a server',
            buttonDisabled: guildTemplate && !guildName,
            function: async () => {
                if (!guildTemplate && !join) {
                    setGuildTemplate(1);
                } else if (guildTemplate) {
                    await createGuild();
                } else if (join) {
                    // Join server with invite code
                }
            },
            centered: true,
        },
        GUILD_CHANNEL_CREATE: {
            title: `Create ${popup?.isCategory ? 'Category' : 'Channel'}`,
            description: popup?.category ? `in ${popup?.category.name}` : popup?.isCategory ? null : ' ',
            buttonColor: 'blue',
            buttonText: channelLocked ? 'Next' : `Create ${popup?.isCategory ? 'Category' : 'Channel'}`,
            buttonDisabled: !channelName || channelLocked,
            function: () => {
                if (!channelName || channelLocked) return;
                sendRequest({
                    query: 'GUILD_CHANNEL_CREATE',
                    params: {
                        guildId: popup.guild,
                    },
                    data: {
                        name: channelName,
                        type: popup?.isCategory ? 4 : channelType,
                        locked: channelLocked,
                        categoryId: popup?.category?.id,
                    },
                });
            },
        },
        GUILD_CHANNEL_DELETE: {
            title: `Delete ${popup?.channel?.type === 4 ? 'Category' : 'Channel'}`,
            description: `Are you sure you want to delete ${popup?.channel?.type === 2 ? '#' : ''}${
                popup?.channel?.name
            }? This cannot be undone.`,
            buttonColor: 'red',
            buttonText: `Delete ${popup?.channel?.type === 4 ? 'Category' : 'Channel'}`,
            function: () => {
                sendRequest({
                    query: 'GUILD_CHANNEL_DELETE',
                    params: {
                        channelId: popup.channel?.id,
                    },
                });
            },
        },
        UPDATE_USERNAME: {
            title: 'Change your username',
            description: 'Enter a new username and your existing password.',
            buttonColor: 'blue',
            buttonText: 'Done',
            function: handleUsernameSubmit,
            centered: true,
        },
        UPDATE_PASSWORD: {
            title: 'Update your password',
            description: 'Enter your current password and a new password.',
            buttonColor: 'blue',
            buttonText: 'Done',
            function: handlePasswordSubmit,
            centered: true,
        },
        DELETE_MESSAGE: {
            title: 'Delete Message',
            description: 'Are you sure you want to delete this message?',
            buttonColor: 'red',
            buttonText: 'Delete',
            function: () => {
                sendRequest({
                    query: 'DELETE_MESSAGE',
                    params: {
                        channelId: popup.message.channelId,
                        messageId: popup.message.id,
                    },
                });
            },
        },
        PIN_MESSAGE: {
            title: 'Pin It. Pin It Good.',
            description:
                'Hey, just double checking that you want to pin this message to the current channel for posterity and greatness?',
            buttonColor: 'blue',
            buttonText: 'Oh yeah. Pin it',
            function: () => {
                sendRequest({
                    query: 'PIN_MESSAGE',
                    params: {
                        channelId: popup.message.channelId,
                        messageId: popup.message.id,
                    },
                });
            },
        },
        UNPIN_MESSAGE: {
            title: 'Unpin Message',
            description: 'You sure you want to remove this pinned message?',
            buttonColor: 'red',
            buttonText: 'Remove it please!',
            function: () => {
                sendRequest({
                    query: 'UNPIN_MESSAGE',
                    params: {
                        channelId: popup.message.channelId,
                        messageId: popup.message.id,
                    },
                });
            },
        },
        FILE_EDIT: {
            title: popup?.file?.file?.name.startsWith('SPOILER_')
                ? popup.file.file.name.slice(8)
                : popup?.file?.file?.name,
            description: '',
            buttonColor: 'blue',
            buttonText: 'Save',
            function: () => {
                popup.handleFileChange({
                    filename: filename,
                    description: description,
                    isSpoiler: isSpoiler,
                });
            },
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
            function: () => {
                sendRequest({
                    query: 'UPDATE_MESSAGE',
                    params: {
                        channelId: popup.message.channelId,
                        messageId: popup.message.id,
                    },
                    data: {
                        attachments: popup.attachments,
                    },
                });
            },
        },
        CHANNEL_EXISTS: {
            title: 'Confirm New Group',
            description: 'You already have a group with these people! Are you sure you want to create a new one?',
            buttonColor: 'blue',
            buttonText: 'Create Group',
            function: () => {
                if (popup?.addUsers) {
                    popup.addUsers();
                } else if (popup?.recipients) {
                    sendRequest({
                        query: 'CHANNEL_CREATE',
                        data: {
                            recipients: popup.recipients,
                        },
                        skipCheck: true,
                    });
                }
            },
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

                if (type === 'CREATE_GUILD') {
                    if (guildTemplate !== 0) {
                        setGuildTemplate(0);
                        return;
                    } else if (join) {
                        setJoin(false);
                        return;
                    }
                }

                setPopup(null);
            }

            if (e.key === 'Enter' && !e.shiftKey && popup?.type) {
                e.preventDefault();
                e.stopPropagation();

                if (isLoading) return;

                if (type === 'CREATE_GUILD') {
                    if (!guildTemplate && !join) {
                        setGuildTemplate(1);
                    } else if (guildTemplate) {
                        await createGuild();
                    } else if (join) {
                        // Join server with invite code
                    }
                    return;
                }

                props[popup.type as keyof typeof props].function();
                setPopup(null);
            }
        };

        setTimeout(() => {
            window.addEventListener('keydown', handleKeyDown);
        }, 100);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        popup,
        type,
        uid,
        password,
        password1,
        newPassword,
        confirmPassword,
        isLoading,
        filename,
        description,
        isSpoiler,
        guildTemplate,
        guildName,
        guildIcon,
        join,
    ]);

    const createGuild = async () => {
        if (!guildTemplate || !guildName) return;
        setIsLoading(true);
        let uploadedIcon = null;

        try {
            const getIcon = async () => {
                if (!guildIcon) return null;

                const result = await base(guildIcon, {
                    publicKey: process.env.NEXT_PUBLIC_CDN_TOKEN as string,
                    store: 'auto',
                });

                if (!result.file) console.error(result);
                else uploadedIcon = result.file;
            };

            await getIcon();
            const response = await sendRequest({
                query: 'GUILD_CREATE',
                data: {
                    name: guildName,
                    icon: uploadedIcon,
                    template: guildTemplate,
                },
            });

            if (!response.success) {
                alert(response.message ?? 'Something went wrong. Try again later.');
                return;
            }

            setPopup(null);
        } catch (err) {
            console.error(err);
            setIsLoading(false);
        }
    };

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
                            setTimeout(() => {
                                setPopup(null);
                            }, 200);
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
                                menu: 'IMAGE',
                                event: {
                                    mouseX: e.clientX,
                                    mouseY: e.clientY,
                                },
                                attachment: popup.attachments[popup.current],
                            });
                        }}
                    >
                        <img
                            src={`${process.env.NEXT_PUBLIC_CDN_URL}/${popup.attachments[popup.current].id}/-/resize/${
                                popup.attachments[popup.current].dimensions.width >= window.innerWidth
                                    ? Math.ceil(window.innerWidth * 0.9)
                                    : popup.attachments[popup.current].dimensions.width
                            }x/`}
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
                                    : popup.warning === 'UPLOAD_FAILED'
                                    ? 'Upload Failed'
                                    : 'Too many uploads!'}
                            </div>

                            <div className={styles.description}>
                                {popup.warning === 'FILE_SIZE'
                                    ? 'Max file size is 10.00 MB please.'
                                    : popup.warning === 'FILE_TYPE'
                                    ? 'Unable to process image'
                                    : popup.warning === 'UPLOAD_FAILED'
                                    ? 'Something went wrong. Try again later'
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
                        width: type === 'FILE_EDIT' ? '530px' : type === 'GUILD_CHANNEL_CREATE' ? '460px' : '',
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
                                src='https://ucarecdn.com/d2524731-0ab6-4360-b6c8-fc9d5b8147c8/'
                                alt={popup.file.file.name}
                            />
                        ))}

                    {!prop?.centered ? (
                        <div
                            className={styles.titleBlock}
                            style={{
                                paddingBottom: type === 'GUILD_CHANNEL_CREATE' && prop.description !== ' ' ? '0' : '',
                            }}
                        >
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
                        {!prop?.centered && (
                            <>
                                {prop.description && (
                                    <div
                                        className={`${styles.description} ${
                                            type === 'GUILD_CHANNEL_CREATE' ? styles.small : ''
                                        }`}
                                    >
                                        {prop.description}
                                    </div>
                                )}

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
                        {type === 'CHANNEL_EXISTS' && (
                            <div
                                className={styles.channelItem}
                                onClick={() => {
                                    setPopup(null);
                                    router.push(`/channels/me/${popup.channel.id}`);
                                }}
                            >
                                {/* <Avatar
                                    src={popup.channel.icon}
                                    alt={getChannelName(popup.channel, auth.user.id)}
                                    size={24}
                                />

                                <span>{getChannelName(popup.channel, auth.user.id)}</span>
                                <span>{getRelativeDate(popup.channel.updatedAt, true)}</span> */}
                            </div>
                        )}
                        {type === 'CREATE_GUILD' && !guildTemplate && !join && (
                            <>
                                <button
                                    className={styles.serverTemplate}
                                    onClick={() => setGuildTemplate(1)}
                                >
                                    <img
                                        src='https://ucarecdn.com/2699b806-e43b-4fea-aa0b-da3bde1972b4/'
                                        alt='Create My Own'
                                    />
                                    <div>Create My Own</div>
                                    <Icon name='arrow' />
                                </button>

                                <div className={styles.serverTemplateTitle}>Start from a template</div>

                                {[
                                    ['Gaming', '34bdb748-aea8-4542-b534-610ac9ad347f'],
                                    ['School Club', 'd0460999-065f-4289-9021-5f9c4cf2ddd7'],
                                    ['Study Group', 'fe757867-ce50-4353-9c9b-cb64ec3968b6'],
                                    ['Friends', 'fcfc0474-e405-47df-b7ef-1373bfe83070'],
                                    ['Artists & Creators', '6057e335-8633-4909-b7c8-970182095185'],
                                    ['Local Community', 'bca2a8ed-2498-42a1-a964-9af6f8479d7f'],
                                ].map((template, index) => (
                                    <button
                                        key={template[1]}
                                        className={styles.serverTemplate}
                                        onClick={() => setGuildTemplate(index + 2)}
                                    >
                                        <img
                                            src={`https://ucarecdn.com/${template[1]}/`}
                                            alt={template[0]}
                                        />
                                        <div>{template[0]} </div>
                                        <Icon name='arrow' />
                                    </button>
                                ))}
                            </>
                        )}

                        {type === 'CREATE_GUILD' && guildTemplate !== 0 && (
                            <>
                                <div className={styles.uploadIcon}>
                                    <div>
                                        {guildIcon ? (
                                            <Image
                                                src={URL.createObjectURL(guildIcon)}
                                                alt='Guild Icon'
                                                width={80}
                                                height={80}
                                                style={{
                                                    borderRadius: '50%',
                                                }}
                                            />
                                        ) : (
                                            <Icon
                                                name='fileUpload'
                                                size={80}
                                                viewbox='0 0 80 80'
                                            />
                                        )}

                                        <div
                                            role='button'
                                            aria-label='Upload a Server Icon'
                                            onClick={() => guildIconInput.current?.click()}
                                        />
                                    </div>

                                    <input
                                        type='file'
                                        ref={guildIconInput}
                                        accept='image/png, image/jpeg, image/gif, image/apng, image/webp'
                                        onChange={async (e) => {
                                            const allowedFileTypes = [
                                                'image/png',
                                                'image/jpeg',
                                                'image/gif',
                                                'image/apng',
                                                'image/webp',
                                            ];
                                            const file = e.target.files ? e.target.files[0] : null;
                                            if (!file) {
                                                e.target.value = '';
                                                return;
                                            }

                                            // Run checks
                                            const maxFileSize = 1024 * 1024 * 10; // 10MB
                                            if (file.size > maxFileSize) {
                                                setPopup({
                                                    type: 'WARNING',
                                                    warning: 'FILE_SIZE',
                                                });
                                                e.target.value = '';
                                                return;
                                            }

                                            const fileBytes = new Uint8Array(await file.arrayBuffer());
                                            const fileType = filetypeinfo(fileBytes)?.[0].mime?.toString();

                                            if (!fileType || !allowedFileTypes.includes(fileType)) {
                                                setPopup({
                                                    type: 'WARNING',
                                                    warning: 'FILE_TYPE',
                                                });
                                                e.target.value = '';
                                                return;
                                            }

                                            const newFile = new File([file], 'image', {
                                                type: file.type,
                                            });

                                            setGuildIcon(newFile);
                                            e.target.value = '';
                                        }}
                                    />
                                </div>

                                <div className={styles.input}>
                                    <label>Server name</label>
                                    <div>
                                        <input
                                            type='text'
                                            maxLength={100}
                                            value={guildName}
                                            onChange={(e) => setGuildName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        {type === 'GUILD_CHANNEL_CREATE' && (
                            <>
                                {!popup?.isCategory && (
                                    <div className={styles.channelType}>
                                        <h2>Channel Type</h2>

                                        <div
                                            className={styles.typePick}
                                            onClick={() => setChannelType(2)}
                                            style={{
                                                backgroundColor: channelType === 2 ? 'var(--background-hover-2)' : '',
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        color: channelType === 2 ? 'var(--foreground-1)' : '',
                                                    }}
                                                >
                                                    <Icon name={channelType === 2 ? 'circleChecked' : 'circle'} />
                                                </div>

                                                <div>
                                                    <div>
                                                        <Icon name={channelLocked ? 'hashtagLock' : 'hashtag'} />
                                                    </div>

                                                    <div className={styles.content}>
                                                        <div>Text</div>
                                                        <div>
                                                            Send messages, images, GIFs, emoji, opinions, and puns
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className={styles.typePick}
                                            onClick={() => setChannelType(3)}
                                            style={{
                                                backgroundColor: channelType === 3 ? 'var(--background-hover-2)' : '',
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        color: channelType === 3 ? 'var(--foreground-1)' : '',
                                                    }}
                                                >
                                                    <Icon name={channelType === 3 ? 'circleChecked' : 'circle'} />
                                                </div>

                                                <div>
                                                    <div>
                                                        <Icon name={channelLocked ? 'voiceLock' : 'voice'} />
                                                    </div>

                                                    <div className={styles.content}>
                                                        <div>Voice</div>
                                                        <div>Hang out together with voice, video, and screen share</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className={`${styles.input} ${!popup?.isCategory && styles.channel}`}>
                                    <label>Channel name</label>
                                    <div>
                                        {!popup?.isCategory && (
                                            <Icon
                                                name={
                                                    channelType === 2
                                                        ? channelLocked
                                                            ? 'hashtagLock'
                                                            : 'hashtag'
                                                        : channelLocked
                                                        ? 'voiceLock'
                                                        : 'voice'
                                                }
                                            />
                                        )}

                                        <input
                                            type='text'
                                            maxLength={100}
                                            value={channelName}
                                            placeholder={popup?.isCategory ? 'New Category' : 'new-channel'}
                                            onChange={(e) => setChannelName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className={styles.privateCheck}>
                                    <div onClick={() => setChannelLocked((prev) => !prev)}>
                                        <label>
                                            <Icon name='lock' />
                                            {popup?.isCategory ? 'Private Category' : 'Private Channel'}
                                        </label>

                                        <div>
                                            <Checkbox checked={channelLocked} />
                                        </div>
                                    </div>

                                    <div>
                                        {popup?.isCategory
                                            ? 'By making a category private, only selected members and roles will be able to view this category. Synced channels in this category will automatically match to this setting.'
                                            : 'Only selected members and roles will be able to view this channel.'}
                                    </div>
                                </div>
                            </>
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
                            onClick={() => {
                                if (type === 'CREATE_GUILD') {
                                    if (guildTemplate !== 0) {
                                        setGuildTemplate(0);
                                        return;
                                    } else if (join) {
                                        setJoin(false);
                                        return;
                                    }
                                }
                                setPopup(null);
                            }}
                        >
                            {guildTemplate || join ? 'Back' : 'Cancel'}
                        </button>

                        <button
                            className={`${prop.buttonColor} ${prop?.buttonDisabled ? 'disabled' : ''}`}
                            onClick={async () => {
                                if (prop?.buttonDisabled) return;
                                if (type === 'CREATE_GUILD') {
                                    if (!guildTemplate && !join) setJoin(true);
                                    else if (join) console.log('Join server with invite code');
                                    else if (guildTemplate) await createGuild();
                                    return;
                                }

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