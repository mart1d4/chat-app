// @ts-nocheck

'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { Icon, Tooltip } from '@/app/app-components';
import useContextHook from '@/hooks/useContextHook';
import { useRouter } from 'next/navigation';
import styles from './TextArea.module.css';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

const TextArea = ({ channel, friend, edit, setEdit, reply, setReply }: any) => {
    const [message, setMessage] = useState<string>('');
    const [files, setFiles] = useState([]);
    const [usersTyping, setUsersTyping] = useState<
        {
            [key: string]: boolean;
        }[]
    >(false);

    const { auth }: any = useContextHook({ context: 'auth' });
    const { userSettings }: any = useContextHook({ context: 'settings' });
    const { setFixedLayer }: any = useContextHook({ context: 'layer' });

    const router = useRouter();
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (reply) {
            textAreaRef?.current?.focus();
            moveCursorToEnd();
        }
    }, [reply]);

    const pasteText = async () => {
        const text = await navigator.clipboard.readText();
        // textAreaRef?.current.innerText += text;
        setMessage((message) => message + text);
        moveCursorToEnd();
    };

    useEffect(() => {
        if (!channel) return;

        const message = JSON.parse(localStorage.getItem(`channel-${channel.id}`) ?? '{}')?.message;
        if (message) {
            setMessage(message);
            textAreaRef.current.innerText = message;
            moveCursorToEnd();
        }

        textAreaRef?.current.focus();
    }, [channel]);

    useEffect(() => {
        if (!channel) return;

        localStorage.setItem(
            `channel-${channel.id}`,
            JSON.stringify({
                ...(JSON.parse(localStorage.getItem(`channel-${channel.id}`)) ?? {}),
                message: message,
            })
        );

        if (textAreaRef.current.innerHTML.includes('<span>')) {
            const cursorPosition = window.getSelection().getRangeAt(0).startOffset;
            textAreaRef.current.innerText = message;
            moveCursorToEnd();
        }
    }, [message]);

    useEffect(() => {
        if (!edit) return;
        const text = textAreaRef.current.innerText;

        if (text !== edit) {
            setMessage(edit);
            textAreaRef.current.innerText = edit;
            moveCursorToEnd();
        }
    }, [edit]);

    const moveCursorToEnd = () => {
        textAreaRef.current.focus();
        if (
            typeof window.getSelection != 'undefined' &&
            typeof document.createRange != 'undefined'
        ) {
            const range = document.createRange();
            range.selectNodeContents(textAreaRef.current);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != 'undefined') {
            const textRange = document.body.createTextRange();
            textRange.moveToElementText(textAreaRef.current);
            textRange.collapse(false);
            textRange.select();
        }
    };

    const sendMessage = async () => {
        console.log('send message');
        if (message.length === 0 && files.length === 0) {
            return;
        }

        let messageContent = message;

        while (messageContent.startsWith('\n')) {
            messageContent = messageContent.substring(1);
        }

        while (messageContent.endsWith('\n')) {
            messageContent = messageContent.substring(0, messageContent.length - 1);
        }

        try {
            await fetch(`/api/users/me/channels/${channel.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({
                    message: {
                        content: messageContent,
                        attachments: files,
                        messageReference: reply?.id ?? null,
                    },
                }),
            });

            textAreaRef.current.innerText = '';
            setFiles([]);

            if (reply) {
                setReply(null);
                localStorage.setItem(
                    `channel-${channel.id}`,
                    JSON.stringify({
                        ...JSON.parse(localStorage.getItem(`channel-${channel.id}`) ?? '{}'),
                        reply: null,
                    })
                );
            }
        } catch (err) {
            console.error(err);
        }
    };

    const textContainer = useMemo(
        () => (
            <div
                className={styles.textContainer}
                style={{ height: textAreaRef?.current?.scrollHeight || 44 }}
            >
                <div>
                    {message.length === 0 && !edit && (
                        <div className={styles.textContainerPlaceholder}>
                            Message {friend ? `@${friend.username}` : channel?.name}
                        </div>
                    )}

                    <div
                        ref={textAreaRef}
                        className={styles.textContainerInner}
                        role='textarea'
                        spellCheck='true'
                        autoCorrect='off'
                        aria-multiline='true'
                        aria-label={
                            edit
                                ? 'Edit Message'
                                : `Message ${friend ? `@${friend.username}` : channel?.name}`
                        }
                        aria-autocomplete='list'
                        contentEditable='plaintext-only'
                        onInput={(e) => {
                            const text = e.target.innerText.toString();
                            if (edit) {
                                setEdit(text);
                                localStorage.setItem(
                                    `channel-${router.query.channelID}`,
                                    JSON.stringify({
                                        ...JSON.parse(
                                            localStorage.getItem(
                                                `channel-${router.query.channelID}`
                                            ) ?? '{}'
                                        ),
                                        edit: {
                                            ...JSON.parse(
                                                localStorage.getItem(
                                                    `channel-${router.query.channelID}`
                                                ) ?? '{}'
                                            ).edit,
                                            content: text,
                                        },
                                    })
                                );
                            }
                            setMessage(text);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (edit) return;
                                sendMessage();
                                setMessage('');
                                e.target.innerText = '';
                            }
                        }}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            setFixedLayer({
                                type: 'menu',
                                event: e,
                                input: true,
                                pasteText,
                                sendButton: true,
                            });
                        }}
                    />
                </div>
            </div>
        ),
        [message, friend, channel, edit, reply]
    );

    if (edit)
        return (
            <form
                className={styles.form}
                style={{
                    padding: '0 0 0 0',
                    marginTop: '8px',
                }}
            >
                <div
                    className={styles.textArea}
                    style={{
                        marginBottom: '0',
                    }}
                >
                    <div className={styles.scrollableContainer + ' scrollbar'}>
                        <div className={styles.input}>
                            {textContainer}

                            <div className={styles.toolsContainer}>
                                <EmojiPicker />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        );
    else if (!auth.user.blockedUserIds.includes(friend?.id)) {
        return (
            <form className={styles.form}>
                {reply?.channel === channel?.id && (
                    <div className={styles.replyContainer}>
                        <div className={styles.replyName}>
                            Replying to <span>{reply?.author.username}</span>
                        </div>

                        <div
                            className={styles.replyClose}
                            onClick={() => {
                                setReply(null);
                                localStorage.setItem(
                                    `channel-${channel.id}`,
                                    JSON.stringify({
                                        ...JSON.parse(
                                            localStorage.getItem(`channel-${channel.id}`) ?? '{}'
                                        ),
                                        reply: null,
                                    })
                                );
                            }}
                        >
                            <div>
                                <Icon
                                    name='closeFilled'
                                    size={16}
                                    viewbox={'0 0 14 14'}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div
                    className={styles.textArea}
                    style={{
                        borderRadius: reply?.channel === channel?.id ? '0 0 8px 8px' : '8px',
                    }}
                >
                    <div className={styles.scrollableContainer + ' scrollbar'}>
                        {files.length > 0 && (
                            <>
                                <ul className={styles.filesList}>
                                    {files?.map((file) => (
                                        <FilePreview
                                            key={uuidv4()}
                                            file={file}
                                            setFiles={setFiles}
                                        />
                                    ))}
                                </ul>
                                <div className={styles.formDivider} />
                            </>
                        )}

                        <div className={styles.input}>
                            <div className={styles.attachWrapper}>
                                <input
                                    type='file'
                                    id='file'
                                    accept='image/*'
                                    multiple
                                    onChange={(e) => {
                                        const newFiles = Array.from(e.target.files);
                                        if (files.length + newFiles.length > 10) {
                                            return;
                                        }
                                        setFiles(files.concat(newFiles).slice(0, 10));
                                    }}
                                    style={{ display: 'none' }}
                                />

                                <button
                                    onClick={(e) => e.preventDefault()}
                                    onDoubleClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('file')?.click();
                                    }}
                                >
                                    <div>
                                        <Icon name='attach' />
                                    </div>
                                </button>
                            </div>

                            {textContainer}

                            <div className={styles.toolsContainer}>
                                <button onClick={(e) => e.preventDefault()}>
                                    <Icon
                                        name='keyboard'
                                        size={30}
                                    />
                                </button>

                                <button onClick={(e) => e.preventDefault()}>
                                    <Icon name='gif' />
                                </button>

                                <EmojiPicker />

                                {userSettings?.sendButton && (
                                    <button
                                        className={
                                            message.length === 0
                                                ? styles.sendButton + ' ' + styles.empty
                                                : styles.sendButton
                                        }
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (edit) return;
                                            sendMessage();
                                            setMessage('');
                                            e.target.innerText = '';
                                        }}
                                        style={{
                                            disabled: message.length === 0,
                                            cursor:
                                                message.length === 0 ? 'not-allowed' : 'pointer',
                                            opacity: message.length === 0 ? 0.5 : 1,
                                        }}
                                    >
                                        <div>
                                            <Icon
                                                name='sendButton'
                                                size={20}
                                            />
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.bottomForm}>
                    <div className={styles.typingContainer}>
                        {usersTyping.length > 0 && (
                            <>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='24.5'
                                    height='7'
                                >
                                    <circle
                                        cx='3.5'
                                        cy='3.5'
                                        r='3.5'
                                    />
                                    <circle
                                        cx='12.25'
                                        cy='3.5'
                                        r='3.5'
                                    />
                                    <circle
                                        cx='21'
                                        cy='3.5'
                                        r='3.5'
                                    />
                                </svg>
                                <span>
                                    {usersTyping.map((user) => (
                                        <span>{user.username}, </span>
                                    ))}

                                    {usersTyping.length > 0 ? 'are typing...' : 'is typing...'}
                                </span>
                            </>
                        )}
                    </div>

                    <div className={styles.counterContainer}>
                        <span
                            style={{
                                color:
                                    message.length > 4000
                                        ? 'var(--error-1)'
                                        : 'var(--foreground-3)',
                            }}
                        >
                            {message.length}
                        </span>
                        /4000
                    </div>
                </div>
            </form>
        );
    } else {
        return (
            <form className={styles.form}>
                <div className={styles.wrapperBlocked}>
                    <div>You cannot send messages to a user you have blocked.</div>

                    <button
                        className='grey'
                        // onClick={(e) => unblockUser()}
                    >
                        Unblock
                    </button>
                </div>
            </form>
        );
    }
};

const emojisPos = [
    { x: 0, y: 0 },
    { x: 0, y: -22 },
    { x: 0, y: -44 },
    { x: 0, y: -66 },
    { x: 0, y: -88 },
    { x: -22, y: 0 },
    { x: -22, y: -22 },
    { x: -22, y: -44 },
    { x: -22, y: -66 },
    { x: -22, y: -88 },
    { x: -44, y: 0 },
    { x: -44, y: -22 },
    { x: -44, y: -44 },
    { x: -44, y: -66 },
    { x: -44, y: -88 },
    { x: -66, y: 0 },
    { x: -66, y: -22 },
    { x: -66, y: -44 },
    { x: -66, y: -66 },
    { x: -66, y: -88 },
    { x: -88, y: 0 },
    { x: -88, y: -22 },
    { x: -88, y: -44 },
    { x: -88, y: -66 },
    { x: -88, y: -88 },
    { x: -110, y: 0 },
    { x: -110, y: -22 },
    { x: -110, y: -44 },
    { x: -110, y: -66 },
    { x: -110, y: -88 },
    { x: -132, y: 0 },
    { x: -132, y: -22 },
    { x: -132, y: -44 },
    { x: -132, y: -66 },
    { x: -154, y: 0 },
    { x: -154, y: -22 },
    { x: -154, y: -44 },
    { x: -154, y: -66 },
    { x: -176, y: 0 },
    { x: -176, y: -22 },
    { x: -176, y: -44 },
    { x: -176, y: -66 },
    { x: -198, y: 0 },
    { x: -198, y: -22 },
    { x: -198, y: -44 },
    { x: -198, y: -66 },
    { x: -220, y: 0 },
    { x: -220, y: -22 },
    { x: -220, y: -44 },
    { x: -220, y: -66 },
];

const scale = {
    hover: {
        scale: 1.15,
        transition: {
            duration: 0.1,
            ease: 'easeInOut',
        },
    },
};

const EmojiPicker = () => {
    const [emojisPosIndex, setEmojisPosIndex] = useState(
        Math.floor(Math.random() * emojisPos.length)
    );

    return (
        <motion.button
            onMouseEnter={() => setEmojisPosIndex(Math.floor(Math.random() * emojisPos.length))}
            onClick={(e) => e.preventDefault()}
            className={styles.buttonContainer}
            whileHover='hover'
        >
            <motion.div
                className={styles.emoji}
                style={{
                    backgroundPosition: `${emojisPos[emojisPosIndex].x}px ${emojisPos[emojisPosIndex].y}px`,
                }}
                variants={scale}
            ></motion.div>
        </motion.button>
    );
};

const FilePreview = ({ file, setFiles }: any) => {
    const [showTooltip, setShowTooltip] = useState(null);

    return useMemo(
        () => (
            <li className={styles.fileItem}>
                <div className={styles.fileItemContainer}>
                    <div className={styles.image}>
                        <img
                            src={URL.createObjectURL(file)}
                            alt='File Preview'
                        />
                    </div>

                    <div className={styles.fileName}>
                        <div>{file.name}</div>
                    </div>
                </div>

                <div className={styles.fileMenu}>
                    <div>
                        <div>
                            <div
                                className={styles.fileMenuButton}
                                onMouseEnter={() => setShowTooltip(1)}
                                onMouseLeave={() => setShowTooltip(null)}
                            >
                                <Icon
                                    name='eye'
                                    size={20}
                                />
                            </div>
                            <Tooltip
                                show={showTooltip === 1}
                                pos='top'
                                dist={5}
                            >
                                Spoiler Attachment
                            </Tooltip>
                        </div>

                        <div>
                            <div
                                className={styles.fileMenuButton}
                                onMouseEnter={() => setShowTooltip(2)}
                                onMouseLeave={() => setShowTooltip(null)}
                            >
                                <Icon
                                    name='edit'
                                    size={20}
                                />
                            </div>
                            <Tooltip
                                show={showTooltip === 2}
                                pos='top'
                                dist={5}
                            >
                                Modify Attachment
                            </Tooltip>
                        </div>

                        <div>
                            <div
                                className={styles.fileMenuButton + ' ' + styles.danger}
                                onMouseEnter={() => setShowTooltip(3)}
                                onMouseLeave={() => setShowTooltip(null)}
                                onClick={() => setFiles((files) => files.filter((f) => f !== file))}
                            >
                                <Icon
                                    name='delete'
                                    size={20}
                                    fill='var(--error-1)'
                                />
                            </div>
                            <Tooltip
                                show={showTooltip === 3}
                                pos='top'
                                dist={5}
                            >
                                Remove Attachment
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </li>
        ),
        [showTooltip]
    );
};

export default TextArea;
