'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import useContextHook from '@/hooks/useContextHook';
import useFetchHelper from '@/hooks/useFetchHelper';
import { trimMessage } from '@/lib/strings';
import { Icon } from '@/app/app-components';
import styles from './TextArea.module.css';
import filetypeinfo from 'magic-bytes.js';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

const TextArea = ({ channel, friend, editContent, setEditContent, reply, setReply, setMessages }: any) => {
    const [message, setMessage] = useState<string>('');
    const [files, setFiles] = useState<
        {
            file: File;
            id: string;
        }[]
    >([]);
    const [usersTyping, setUsersTyping] = useState<
        {
            [key: string]: boolean;
        }[]
    >([]);

    const { setFixedLayer, setPopup }: any = useContextHook({ context: 'layer' });
    const { userSettings }: any = useContextHook({ context: 'settings' });
    const { auth }: any = useContextHook({ context: 'auth' });
    const { sendRequest } = useFetchHelper();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const textAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (reply?.messageId) textAreaRef?.current?.focus();
    }, [reply]);

    const pasteText = async () => {
        const text = await navigator.clipboard.readText();
        setMessage((message) => message + text);
    };

    useEffect(() => {
        if (!channel) return;

        const message = JSON.parse(localStorage.getItem(`channel-${channel.id}`) || '{}')?.message;
        if (message) setMessage(message);

        textAreaRef.current?.focus();
    }, [channel]);

    useEffect(() => {
        if (!channel) return;

        localStorage.setItem(
            `channel-${channel.id}`,
            JSON.stringify({
                ...JSON.parse(localStorage.getItem(`channel-${channel.id}`) || '{}'),
                message: message,
            })
        );
    }, [message]);

    useEffect(() => {
        if (!editContent) return;
        const input = textAreaRef.current as HTMLInputElement;

        if (input?.innerText !== editContent) {
            setMessage(editContent);
            input.innerText = editContent;
            // set cursor to end of text
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(input.childNodes[0], input.innerText.length);
            range.collapse(true);
            sel?.removeAllRanges();
            sel?.addRange(range);

            input.focus();
        }
    }, [editContent]);

    const sendMessage = async () => {
        let messageContent = trimMessage(message);

        if (message.length === 0 && files.length === 0) {
            return;
        }

        const tempId = uuidv4();
        const tempMessage = {
            id: tempId,
            content: messageContent,
            attachments: files,
            author: auth.user,
            channelId: [channel.id],
            messageReference: reply?.messageId ?? null,
            createdAt: new Date(),
            error: false,
            waiting: true,
        };

        const input = textAreaRef.current as HTMLInputElement;
        input.innerText = '';
        setFiles([]);
        setMessages((messages: TMessage[]) => [...messages, tempMessage]);
        if (reply?.messageId) {
            setReply(null);
            localStorage.setItem(
                `channel-${channel.id}`,
                JSON.stringify({
                    ...JSON.parse(localStorage.getItem(`channel-${channel.id}`) || '{}'),
                    reply: null,
                })
            );
        }

        try {
            const response = await sendRequest({
                query: 'SEND_MESSAGE',
                params: { channelId: channel.id },
                data: {
                    message: {
                        content: messageContent,
                        attachments: files,
                        messageReference: reply?.messageId ?? null,
                    },
                },
            });

            if (!response.success) {
                setMessages((messages: TMessage[]) =>
                    messages.map((message) =>
                        message.id === tempId ? { ...message, error: true, waiting: false } : message
                    )
                );
                return;
            }

            const message = response.data.message;

            // Stop message from being marked as waiting
            setMessages((messages: TMessage[]) => messages.filter((message) => message.id !== tempId));
            setMessages((messages: TMessage[]) => [...messages, message]);
        } catch (err) {
            console.error(err);
            // Make message marked as error
            setMessages((messages: TMessage[]) =>
                messages.map((message) =>
                    message.id === tempId ? { ...message, error: true, waiting: false } : message
                )
            );
        }
    };

    const textContainer = useMemo(
        () => (
            <div
                className={styles.textContainer}
                style={{ height: textAreaRef?.current?.scrollHeight || 44 }}
            >
                <div>
                    {message.length === 0 && typeof editContent !== 'string' && (
                        <div className={styles.textContainerPlaceholder}>
                            Message {!channel ? '' : friend ? `@${friend.username}` : channel?.name}
                        </div>
                    )}

                    <div
                        ref={textAreaRef}
                        className={styles.textContainerInner}
                        role='textbox'
                        spellCheck='true'
                        aria-haspopup='listbox'
                        aria-invalid='false'
                        aria-label={
                            editContent ? 'Edit Message' : `Message ${friend ? `@${friend.username}` : channel?.name}`
                        }
                        aria-multiline='true'
                        aria-required='true'
                        aria-autocomplete='list'
                        autoCorrect='off'
                        contentEditable='true'
                        onDragStart={() => false}
                        onDrop={() => false}
                        onInput={(e) => {
                            if (!channel) return;
                            const input = e.target as HTMLDivElement;
                            const text = input.innerText.toString();

                            if (editContent) {
                                setEditContent(text);
                                localStorage.setItem(
                                    `channel-${channel.id}`,
                                    JSON.stringify({
                                        ...JSON.parse(localStorage.getItem(`channel-${channel.id}`) || '{}'),
                                        editContent: {
                                            ...JSON.parse(localStorage.getItem(`channel-${channel.id}`) || '{}')
                                                .editContent,
                                            content: text,
                                        },
                                    })
                                );
                            } else {
                                setMessage(text);
                            }
                        }}
                        onPaste={(e) => {
                            if (!channel) return;
                            e.preventDefault();

                            // Get where the cursor is to insert the text at the right place
                            const selection = window.getSelection();
                            const range = selection?.getRangeAt(0);
                            const start = range?.startOffset;
                            const end = range?.endOffset;

                            // Convert HTML to plain text
                            const text = e.clipboardData.getData('text/plain');

                            // Add text to the div at the right place
                            const input = e.target as HTMLDivElement;
                            const currentText = input.innerText.toString();
                            const newText = currentText.slice(0, start) + text + currentText.slice(end);
                            input.innerText = newText;

                            // Set the cursor back to the right place
                            const newRange = document.createRange();
                            newRange.setStart(input.childNodes[0], start || 0 + text.length);
                            newRange.collapse(true);
                            selection?.removeAllRanges();
                            selection?.addRange(newRange);

                            // Finally, update the state
                            setMessage(text);
                        }}
                        onKeyDown={(e) => {
                            if (!channel) return;
                            if (e.key === 'Enter' && !e.shiftKey && editContent) {
                                e.preventDefault();
                                return;
                            }
                            if (e.key === 'Enter' && !e.shiftKey && !editContent) {
                                e.preventDefault();
                                sendMessage();
                                setMessage('');
                                const input = textAreaRef.current as HTMLInputElement;
                                input.innerText = '';
                            }
                        }}
                        onContextMenu={(e) => {
                            if (!channel) return;
                            e.preventDefault();
                            setFixedLayer({
                                type: 'menu',
                                event: {
                                    mouseX: e.clientX,
                                    mouseY: e.clientY,
                                },
                                input: true,
                                pasteText,
                                sendButton: true,
                            });
                        }}
                    />
                </div>
            </div>
        ),
        [message, friend, channel, editContent, reply]
    );

    if (typeof editContent === 'string')
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
                    style={{ marginBottom: '0' }}
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
                {reply?.channelId === channel?.id && channel && (
                    <div className={styles.replyContainer}>
                        <div className={styles.replyName}>
                            Replying to <span>{reply?.author?.username || 'User'}</span>
                        </div>

                        <div
                            className={styles.replyClose}
                            onClick={() => {
                                if (!channel) return;
                                setReply(null);
                                localStorage.setItem(
                                    `channel-${channel.id}`,
                                    JSON.stringify({
                                        ...JSON.parse(localStorage.getItem(`channel-${channel.id}`) ?? '{}'),
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
                        borderRadius: reply?.channelId === channel?.id && channel ? '0 0 8px 8px' : '8px',
                    }}
                >
                    <div className={styles.scrollableContainer + ' scrollbar'}>
                        {files.length > 0 && (
                            <>
                                <ul className={styles.filesList + ' scrollbar'}>
                                    {files?.map((file) => (
                                        <FilePreview
                                            key={file.id}
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
                                    ref={fileInputRef}
                                    type='file'
                                    accept='*'
                                    multiple
                                    onChange={async (e) => {
                                        const newFiles = Array.from(e.target.files as FileList);

                                        if (files.length + newFiles.length > 10) {
                                            setPopup({
                                                type: 'WARNING',
                                                warning: 'FILE_LIMIT',
                                            });
                                            e.target.value = '';
                                            return;
                                        }

                                        let checkedFiles = [];

                                        const maxFileSize = 1024 * 1024 * 10; // 10MB

                                        for (const file of newFiles) {
                                            if (file.size > maxFileSize) {
                                                setPopup({
                                                    type: 'WARNING',
                                                    warning: 'FILE_SIZE',
                                                });
                                                e.target.value = '';
                                                checkedFiles = [];
                                                return;
                                            }

                                            const fileToAdd = {
                                                file: file,
                                                id: uuidv4(),
                                            };
                                            checkedFiles.push(fileToAdd);
                                        }

                                        setFiles([...files, ...checkedFiles]);
                                        e.target.value = '';
                                    }}
                                    style={{ display: 'none' }}
                                />

                                <button
                                    onClick={(e) => e.preventDefault()}
                                    onDoubleClick={(e) => {
                                        if (!channel) return;
                                        e.preventDefault();
                                        fileInputRef.current?.click();
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
                                            if (!channel) return;
                                            e.preventDefault();
                                            if (editContent) return;
                                            sendMessage();
                                            setMessage('');
                                            // @ts-expect-error
                                            e.target.innerText = '';
                                        }}
                                        disabled={message.length === 0}
                                        style={{
                                            cursor: message.length === 0 ? 'not-allowed' : 'pointer',
                                            opacity: message.length === 0 ? 0.3 : 1,
                                            color: message.length === 0 ? 'var(--foreground-5)' : '',
                                        }}
                                    >
                                        <div>
                                            <svg
                                                width='16'
                                                height='16'
                                                viewBox='0 0 16 16'
                                            >
                                                <path
                                                    d='M8.2738 8.49222L1.99997 9.09877L0.349029 14.3788C0.250591 14.691 0.347154 15.0322 0.595581 15.246C0.843069 15.4597 1.19464 15.5047 1.48903 15.3613L15.2384 8.7032C15.5075 8.57195 15.6781 8.29914 15.6781 8.00007C15.6781 7.70101 15.5074 7.4282 15.2384 7.29694L1.49839 0.634063C1.20401 0.490625 0.852453 0.535625 0.604941 0.749376C0.356493 0.963128 0.259941 1.30344 0.358389 1.61563L2.00932 6.89563L8.27093 7.50312C8.52405 7.52843 8.71718 7.74125 8.71718 7.99531C8.71718 8.24938 8.52406 8.46218 8.27093 8.4875L8.2738 8.49222Z'
                                                    fill='currentColor'
                                                ></path>
                                            </svg>
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
                                color: message.length > 4000 ? 'var(--error-1)' : 'var(--foreground-3)',
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

export const EmojiPicker = () => {
    const [emojisPosIndex, setEmojisPosIndex] = useState(Math.floor(Math.random() * emojisPos.length));

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
    const [hideSpoiler, setHideSpoiler] = useState<boolean>(false);
    const [isImage, setIsImage] = useState<boolean | null>(null);

    const { setTooltip }: any = useContextHook({ context: 'tooltip' });
    const { setPopup }: any = useContextHook({ context: 'layer' });

    useEffect(() => {
        const imageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/apng', 'image/apng'];

        const isFileImage = async () => {
            const fileBytes = new Uint8Array(await file.file.arrayBuffer());
            const fileType = filetypeinfo(fileBytes)?.[0]?.mime?.toString();
            setIsImage(imageTypes.includes(fileType ?? ''));
        };

        isFileImage();
    }, [file]);

    const handleFileChange = (data: any) => {
        console.log(data);
        const editedFile = {
            file: new File([file.file], data.isSpoiler ? `SPOILER_${data.filename}` : data.filename, {
                type: file.file.type,
            }),
            id: file.id,
            description: data.description,
        };

        setFiles((files: any) => files.map((f: any) => (f.id === file.id ? editedFile : f)));
    };

    const isSpoiler = file.file.name.startsWith('SPOILER_');

    return useMemo(() => {
        if (typeof isImage !== 'boolean') {
            return <></>;
        }

        return (
            <li className={styles.fileItem}>
                <div className={styles.fileItemContainer}>
                    <div
                        className={styles.image}
                        style={{
                            backgroundColor: isSpoiler && !hideSpoiler ? 'var(--background-dark-2)' : '',
                            cursor: isSpoiler && !hideSpoiler ? 'pointer' : 'default',
                        }}
                        onClick={() => isSpoiler && setHideSpoiler(true)}
                    >
                        {isSpoiler && !hideSpoiler && <div className={styles.spoilerButton}>Spoiler</div>}

                        {isImage ? (
                            <img
                                src={URL.createObjectURL(file.file)}
                                alt='File Preview'
                                style={{ filter: isSpoiler && !hideSpoiler ? 'blur(44px)' : 'none' }}
                            />
                        ) : (
                            <img
                                src='/assets/app/file-text.svg'
                                alt='File Preview'
                                style={{ filter: isSpoiler && !hideSpoiler ? 'blur(44px)' : 'none' }}
                            />
                        )}

                        <div className={styles.imageTags}>
                            {file.description && <span>Alt</span>}
                            {isSpoiler && hideSpoiler && <span>Spoiler</span>}
                        </div>
                    </div>

                    <div className={styles.fileName}>
                        <div>{isSpoiler ? file.file.name.slice(8) : file.file.name}</div>
                    </div>
                </div>

                <div className={styles.fileMenu}>
                    <div>
                        <div>
                            <div
                                className={styles.fileMenuButton}
                                onMouseEnter={(e) =>
                                    setTooltip({
                                        text: 'Spoiler Attachment',
                                        element: e.currentTarget,
                                        gap: 3,
                                    })
                                }
                                onMouseLeave={() => setTooltip(null)}
                                onClick={() => {
                                    const editedFile = {
                                        file: new File(
                                            [file.file],
                                            isSpoiler ? file.file.name.slice(8) : 'SPOILER_' + file.file.name,
                                            { type: file.file.type }
                                        ),
                                        id: file.id,
                                        description: file.description,
                                    };

                                    setFiles((files: any) =>
                                        files.map((f: any) => (f.id === file.id ? editedFile : f))
                                    );
                                }}
                            >
                                <Icon
                                    name={isSpoiler ? 'eyeSlash' : 'eye'}
                                    size={20}
                                />
                            </div>
                        </div>

                        <div>
                            <div
                                className={styles.fileMenuButton}
                                onMouseEnter={(e) =>
                                    setTooltip({
                                        text: 'Modify Attachment',
                                        element: e.currentTarget,
                                        gap: 3,
                                    })
                                }
                                onMouseLeave={() => setTooltip(null)}
                                onClick={() => {
                                    setTooltip(null);
                                    setPopup({
                                        type: 'FILE_EDIT',
                                        file: file,
                                        handleFileChange,
                                    });
                                }}
                            >
                                <Icon
                                    name='edit'
                                    size={20}
                                />
                            </div>
                        </div>

                        <div>
                            <div
                                className={styles.fileMenuButton + ' ' + styles.danger}
                                onMouseEnter={(e) =>
                                    setTooltip({
                                        text: 'Remove Attachment',
                                        element: e.currentTarget,
                                        gap: 3,
                                    })
                                }
                                onMouseLeave={() => setTooltip(null)}
                                onClick={() => {
                                    setFiles((files: any) => files.filter((f: any) => f.id !== file.id));
                                    setTooltip(null);
                                }}
                            >
                                <Icon
                                    name='delete'
                                    size={20}
                                    fill='var(--error-1)'
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        );
    }, [file, isImage, hideSpoiler]);
};

export default TextArea;
