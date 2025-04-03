"use client";

import { type ChangeEvent, useEffect, useState, useRef, useCallback } from "react";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import type { MessageFunctions } from "../Message/Message";
import { useRequests } from "@/hooks/useRequests";
import { fileTypeFromStream } from "file-type";
import styles from "./TextArea.module.css";
import { getNanoId } from "@/lib/utils";
import { nanoid } from "nanoid";
import {
    useDialogContext,
    TooltipTrigger,
    TooltipContent,
    DialogContent,
    VoiceMessage,
    FilePreview,
    LoadingDots,
    MenuTrigger,
    MenuContent,
    EmojiButton,
    MenuItem,
    Tooltip,
    Menu,
    Icon,
} from "@components";
import {
    useTriggerDialog,
    useEmojiPicker,
    useSettings,
    useMessages,
    useMention,
    useData,
} from "@/store";
import type {
    DMChannelWithRecipients,
    ChannelRecipient,
    ResponseMessage,
    Attachment,
} from "@/type";

import { AutoLinkPlugin, createLinkMatcherWithRegExp } from "@lexical/react/LexicalAutoLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { InlineStylePlugin } from "./plugins/InlineStylePlugin";
import EmojiPickerPlugin from "./plugins/EmojiPickerPlugin";
import NewMentionsPlugin from "./plugins/MentionsPlugin";
import { InlineStyleNode } from "./ui/InlineStyleNode";
import { EmojisPlugin } from "./plugins/EmojisPlugin";
import {
    $getRoot,
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_CRITICAL,
    INSERT_LINE_BREAK_COMMAND,
    INSERT_PARAGRAPH_COMMAND,
    KEY_ENTER_COMMAND,
} from "lexical";
import { MentionNode } from "./ui/MentionNode";
import { SymbolNode } from "./ui/SymbolNode";
import { AutoLinkNode } from "@lexical/link";
import { EmojiNode } from "./ui/EmojiNode";

const URL_REGEX =
    /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(?<![-.+():%])/;

export function TextArea({
    edit,
    channel,
    functions,
    setMessages,
    messageObject,
}: {
    edit?: string;
    functions?: MessageFunctions;
    messageObject?: ResponseMessage;
    channel: DMChannelWithRecipients;
    setMessages: (message: ResponseMessage) => void;
}) {
    const initialConfig = {
        namespace: "Editor",
        theme: {},
        onError: (error: any) => console.error(error),
        nodes: [EmojiNode, AutoLinkNode, InlineStyleNode, SymbolNode, MentionNode],
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <TextAreaContent
                edit={edit}
                channel={channel}
                functions={functions}
                setMessages={setMessages}
                messageObject={messageObject}
            />
        </LexicalComposer>
    );
}

export function TextAreaContent({
    edit,
    channel,
    functions,
    setMessages,
    messageObject,
}: {
    edit?: string;
    functions?: MessageFunctions;
    messageObject?: ResponseMessage;
    channel: DMChannelWithRecipients;
    setMessages: (message: ResponseMessage) => void;
}) {
    const reply = useMessages((state) => state.replies).find((r) => r.channelId === channel.id);
    const draft = useMessages.getState().drafts.find((d) => d.channelId === channel.id);
    const editContent = useMessages
        .getState()
        .edits.find((d) => d.messageId === messageObject?.id)?.content;

    const isEditing = typeof edit === "string";

    const { data: emojiPickerData, setData: setEmojiPickerData } = useEmojiPicker();
    const { triggerDialog, removeDialog } = useTriggerDialog();
    const { setDraft, setEdit, setReply } = useMessages();
    const { userId: mention, setMention } = useMention();
    const { updateMessage } = useRequests();
    const { unblockUser } = useRequests();
    const user = useAuthenticatedUser();
    const { settings } = useSettings();
    const { blocked } = useData();

    const [editor] = useLexicalComposerContext();
    const [text, setText] = useState("");

    const friend = channel.recipients.find((r) => r.id !== user?.id);
    const placeholder = `Message ${channel.type === 0 ? friend?.username : channel.name}`;

    const [voiceMessage, setVoiceMessage] = useState<Blob | null>(null);
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const canSend = text.length > 0 || attachments.length > 0;
    const isFirstRender = useRef(true);

    useEffect(() => {
        const removeListener = editor.registerCommand<KeyboardEvent | null>(
            KEY_ENTER_COMMAND,
            (event) => {
                const selection = $getSelection();

                if (!$isRangeSelection(selection)) {
                    return false;
                }

                if (event !== null) {
                    // if ((IS_IOS || IS_SAFARI || IS_APPLE_WEBKIT) && CAN_USE_BEFORE_INPUT) {
                    //     return false;
                    // }

                    event.preventDefault();

                    if (event.shiftKey) {
                        return editor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, false);
                    }
                }

                if (isEditing) editMessage();
                else sendMessage();

                return true;
            },
            COMMAND_PRIORITY_CRITICAL
        );

        return () => {
            removeListener();
        };
    }, [isEditing, text, attachments, channel, messageObject, reply]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            if (typeof edit === "string") {
                if (editContent) {
                    const initialEditorState = editor.parseEditorState(editContent);

                    if (initialEditorState && !initialEditorState.isEmpty()) {
                        editor.setEditorState(initialEditorState);
                    }
                }
            } else if (draft && draft.content) {
                const initialEditorState = editor.parseEditorState(draft.content);

                if (initialEditorState && !initialEditorState.isEmpty()) {
                    editor.setEditorState(initialEditorState);
                }
            }
        }
    }, [isFirstRender.current, draft, editContent, edit]);

    useEffect(() => {
        editor.focus();
    }, [reply]);

    function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
        let timer: ReturnType<typeof setTimeout>;
        return ((...args: Parameters<T>) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        }) as T;
    }

    const debouncedSetDraft = useCallback(
        debounce((editorState: any) => {
            const stringifiedEditorState = JSON.stringify(editorState.toJSON());

            if (isEditing) {
                setEdit(messageObject!.id, stringifiedEditorState);
            } else {
                setDraft(channel.id, stringifiedEditorState);
            }
        }, 500),
        [channel.id, isEditing]
    );

    function onChange(editorState: any) {
        const parsedEditorState = editor.parseEditorState(JSON.stringify(editorState.toJSON()));
        const editorStateTextString = parsedEditorState.read(() => $getRoot().getTextContent());

        setText(editorStateTextString);
        console.log("Text: ", editorStateTextString);
        debouncedSetDraft(editorState);
    }

    async function handleFileSubmit(files: File[], e: DragEvent | ChangeEvent<HTMLInputElement>) {
        if (files.length === 0) return;

        if (attachments.length + files.length > 10) {
            triggerDialog({ type: "FILE_NUMBER" });

            if (e.target instanceof HTMLInputElement) {
                return (e.target.value = "");
            }

            return;
        }

        let checkedFiles: Attachment[] = [];
        const maxFileSize = 1024 * 1024 * 8; // 8MB

        for (const file of files) {
            if (file.size > maxFileSize) {
                triggerDialog({ type: "FILE_SIZE" });
                checkedFiles = [];

                if (e.target instanceof HTMLInputElement) {
                    return (e.target.value = "");
                }

                return;
            }

            const stream = file.stream();
            const typeObj = await fileTypeFromStream(stream);
            const mimeType = typeObj?.mime?.split("/")[0];
            const mime = mimeType ?? "file";
            const type = ["image", "video", "audio"].includes(mime) ? mime : "file";

            const { width, height } = await new Promise<
                HTMLImageElement | { width: number; height: number }
            >((resolve) => {
                if (type !== "image") return resolve({ width: 0, height: 0 });
                const img = new Image();
                img.onload = () => resolve(img);
                img.src = URL.createObjectURL(file);
            });

            checkedFiles.push({
                id: getNanoId(),

                file,
                ext: typeObj?.ext ?? file.name.split(".").pop() ?? "",
                url: URL.createObjectURL(file),
                type: type as Attachment["type"],

                size: file.size,
                filename: file.name ?? "",
                spoiler: false,
                description: "",

                height,
                width,
            });
        }

        setAttachments((prev) => [...prev, ...checkedFiles]);
        editor.focus();

        if (e.target instanceof HTMLInputElement) {
            return (e.target.value = "");
        }

        return;
    }

    useEffect(() => {
        let dragCounter = 0; // Counter to track active drag events
        let dragged = false;

        function isFileDrag(event: DragEvent): boolean {
            return Array.from(event.dataTransfer?.items || []).some((item) => item.kind === "file");
        }

        function handleDragOver(e: DragEvent) {
            e.preventDefault();
            e.stopPropagation(); // Required for allowing drop
        }

        function handleDragEnter(e: DragEvent) {
            e.preventDefault();
            e.stopPropagation();

            if (isFileDrag(e)) {
                dragCounter++;
                if (!dragged) {
                    dragged = true;
                    triggerDialog({ type: "DRAG_FILE", data: { channel } });
                }
            }
        }

        function handleDragLeave(e: DragEvent) {
            e.preventDefault();
            e.stopPropagation();

            dragCounter--;
            if (dragCounter === 0 && dragged) {
                removeDialog("DRAG_FILE");
                dragged = false;
            }
        }

        async function handleDrop(e: DragEvent) {
            e.preventDefault();
            e.stopPropagation();

            if (dragged && isFileDrag(e)) {
                dragged = false;
                dragCounter = 0;

                const files = Array.from(e.dataTransfer?.files || []);
                await handleFileSubmit(files, e);

                removeDialog("DRAG_FILE");
            }
        }

        document.addEventListener("dragover", handleDragOver);
        document.addEventListener("dragenter", handleDragEnter);
        document.addEventListener("dragleave", handleDragLeave);
        document.addEventListener("drop", handleDrop);

        return () => {
            document.removeEventListener("dragover", handleDragOver);
            document.removeEventListener("dragenter", handleDragEnter);
            document.removeEventListener("dragleave", handleDragLeave);
            document.removeEventListener("drop", handleDrop);
        };
    }, [attachments]);

    if (mention && !edit) {
        const user = channel.recipients.find((r) => r.id === mention);

        if (user) {
            editor.update(() => {
                const selection = $getSelection();
                if (!selection) return;

                const mentionNode = new MentionNode(`<@${user.id}>`, user.displayName);
                selection.insertNodes([mentionNode]);
            });
        }

        setMention(null);
    }

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                if (edit) setEdit(messageObject?.id, null);
                if (reply) setReply(channel.id, null);
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [edit, reply]);

    function sendMessage() {
        if (!canSend) return;

        if (text.length > 16000) {
            triggerDialog({ type: "MESSAGE_LIMIT" });
            return;
        }

        const temp = {
            id: nanoid(),
            type: reply?.messageId ? 1 : 0,
            content: text,
            attachments,
            embeds: [],
            author: user,
            reference: reply?.messageId ?? null,
            mentions: [] as ChannelRecipient[],
            roleMentions: [],
            channelMentions: [],
            reactions: [],
            pinned: null,
            edited: null,
            createdAt: new Date().toISOString(),
            local: true,
            error: false,
        };

        // Search for mentions, and add them to the mentions array if they exist
        const mentions = text.match(/<@(\d+)>/g) || [];

        for (const mention of mentions) {
            const id = parseInt(mention.replace(/<@|>/g, ""));
            const recipient = channel.recipients.find((r) => r.id === id);

            if (recipient && !temp.mentions.find((m) => m.id === recipient.id)) {
                temp.mentions.push(recipient);
            }
        }

        editor.update(() => {
            const root = $getRoot();
            root.clear();
        });

        if (isEditing && messageObject) {
            functions?.startEditingMessage();
            return;
        } else {
            setDraft(channel.id, null);
        }

        setAttachments([]);
        setMessages(temp);

        if (reply?.messageId) setReply(channel.id, null);
    }

    async function editMessage() {
        if (!messageObject) return;

        if (text === messageObject.content) {
            return setEdit(messageObject.id, null);
        }

        if (!text && messageObject.attachments.length === 0) {
            return triggerDialog({ type: "DELETE_MESSAGE" });
        }

        if (text.length > 16000) {
            return triggerDialog({ type: "MESSAGE_LIMIT" });
        }

        try {
            const data = await updateMessage.send({
                channelId: channel.id,
                messageId: messageObject.id,
                message: {
                    content: text,
                },
            });

            if (data) {
                setEdit(messageObject.id, null);
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (voiceMessage) {
            const att = {
                id: nanoid(),
                file: voiceMessage,
                ext: "webm",
                url: URL.createObjectURL(voiceMessage),
                type: "audio",
                size: voiceMessage.size,
                filename: "voice-message.webm",
                spoiler: false,
                voiceMessage: true,
                description: "",
                height: 0,
                width: 0,
            };

            const temp = {
                id: nanoid(),
                content: null,
                attachments: [att],
                embeds: [],
                author: user,
                reference: reply?.messageId ?? null,
                mentions: [],
                roleMentions: [],
                channelMentions: [],
                reactions: [],
                pinned: null,
                edited: null,
                createdAt: new Date(),
                local: true,
                error: false,
            };

            setMessages(temp);
            if (reply?.messageId) setReply(channel.id, null);

            setVoiceMessage(null);
        }
    }, [voiceMessage]);

    const textContainer = (
        <div
            className={styles.textContainer}
            ref={(el) => {
                if (el) {
                    el.style.height = "auto";
                    el.style.height = `${el.scrollHeight}px`;
                }
            }}
        >
            <AutoFocusPlugin />
            <OnChangePlugin onChange={onChange} />
            <AutoLinkPlugin matchers={[createLinkMatcherWithRegExp(URL_REGEX)]} />

            <RichTextPlugin
                contentEditable={
                    <ContentEditable
                        aria-placeholder={placeholder}
                        placeholder={<div className={styles.placeholder}>{placeholder}</div>}
                    />
                }
                ErrorBoundary={LexicalErrorBoundary}
            />
        </div>
    );

    const container = document.getElementById(`text-area${edit ? "-edit" : ""}-${channel.id}`);

    if (isEditing) {
        return (
            <>
                <form
                    className={styles.form}
                    id={`text-area-edit-${channel.id}`}
                    style={{ padding: "0 0 0 0", margin: "8px 0 0 0" }}
                >
                    <NewMentionsPlugin members={channel.recipients} />

                    <EmojisPlugin />
                    <EmojiPickerPlugin />
                    <InlineStylePlugin />

                    <div
                        id="text-area"
                        className={styles.textArea}
                        style={{ marginBottom: "0" }}
                    >
                        <div className={styles.scrollableContainer + " scrollbar"}>
                            <div
                                className={styles.input}
                                style={{ borderRadius: "8px" }}
                            >
                                {textContainer}

                                <div className={styles.toolsContainer}>
                                    <EmojiButton
                                        open={
                                            emojiPickerData.open &&
                                            emojiPickerData.container === container
                                        }
                                        setOpen={() => {
                                            setEmojiPickerData({
                                                open: true,
                                                container,
                                                placement: "top-end",
                                                onClick: (emoji) => {
                                                    editor.update(() => {
                                                        const selection = $getSelection();
                                                        if (!selection) return;

                                                        selection.insertText(`:${emoji}: `);
                                                    });
                                                },
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <div className={styles.editHint}>
                    escape to{" "}
                    <span
                        tabIndex={0}
                        onClick={() => setEdit(messageObject!.id, null)}
                    >
                        cancel{" "}
                    </span>
                    • enter to{" "}
                    <span
                        tabIndex={0}
                        onClick={() => editMessage()}
                    >
                        save{" "}
                    </span>
                </div>
            </>
        );
    } else if (!blocked.find((b) => b.id === friend?.id) || channel.type !== 0) {
        return (
            <form
                className={styles.form}
                id={`text-area-${channel.id}`}
            >
                <NewMentionsPlugin members={channel.recipients} />

                <EmojisPlugin />
                <EmojiPickerPlugin />
                <InlineStylePlugin />

                {reply && !edit && (
                    <div className={styles.replyContainer}>
                        <div className={styles.replyName}>
                            Replying to <span>{reply?.username || "User"}</span>
                        </div>

                        <div
                            className={styles.replyClose}
                            onClick={() => setReply(channel.id, null, "")}
                        >
                            <div>
                                <Icon
                                    size={16}
                                    name="closeFilled"
                                    viewBox={"0 0 14 14"}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div
                    id="text-area"
                    className={styles.textArea}
                    style={{ borderRadius: reply?.messageId ? "0 0 8px 8px" : "8px" }}
                >
                    <div className={styles.scrollableContainer + " scrollbar"}>
                        {attachments.length > 0 && (
                            <>
                                <ul className={styles.filesList + " scrollbar"}>
                                    {attachments.map((a) => (
                                        <FilePreview
                                            key={a.id}
                                            attachment={a}
                                            setAttachments={setAttachments}
                                        />
                                    ))}
                                </ul>
                                <div className={styles.formDivider} />
                            </>
                        )}

                        <div
                            className={styles.input}
                            style={{
                                borderRadius: attachments.length > 0 ? "0 0 8px 8px" : "8px",
                            }}
                        >
                            <div className={styles.attachWrapper}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="*"
                                    multiple
                                    onChange={async (e) => {
                                        const files = Array.from(e.target.files as FileList);
                                        await handleFileSubmit(files, e);
                                    }}
                                    style={{ display: "none" }}
                                />

                                <Menu placement="top-start">
                                    <MenuTrigger>
                                        <button
                                            type="button"
                                            onDoubleClick={(e) => {
                                                e.preventDefault();
                                                fileInputRef.current?.click();
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    fileInputRef.current?.click();
                                                }
                                            }}
                                        >
                                            <div>
                                                <Icon name="add-circle" />
                                            </div>
                                        </button>
                                    </MenuTrigger>

                                    <MenuContent>
                                        <MenuItem
                                            leftIcon="upload"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Upload File
                                        </MenuItem>

                                        <MenuItem
                                            leftIcon="mic"
                                            onClick={() => {
                                                triggerDialog({
                                                    type: "RECORD_VOICE_MESSAGE",
                                                    data: { setVoiceMessage },
                                                });
                                            }}
                                        >
                                            Voice Message
                                        </MenuItem>
                                    </MenuContent>
                                </Menu>
                            </div>

                            {textContainer}

                            <div className={styles.toolsContainer}>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();

                                        setEmojiPickerData({
                                            open: true,
                                            container,
                                            placement: "top-end",
                                            tab: "gif",
                                            onClick: (gif) => {},
                                        });
                                    }}
                                >
                                    <Icon name="gif" />
                                </button>

                                {container && (
                                    <EmojiButton
                                        open={
                                            emojiPickerData.open &&
                                            emojiPickerData.container === container
                                        }
                                        setOpen={() => {
                                            setEmojiPickerData({
                                                open: true,
                                                container,
                                                placement: "top-end",
                                                onClick: (emoji) => {
                                                    editor.update(() => {
                                                        const selection = $getSelection();
                                                        if (!selection) return;

                                                        selection.insertText(`:${emoji}: `);
                                                    });
                                                },
                                            });
                                        }}
                                    />
                                )}

                                {(settings.sendButton || !width562) && (
                                    <button
                                        type="button"
                                        className={`${styles.send} ${!canSend ? styles.empty : ""}`}
                                        onClick={() => !edit && sendMessage()}
                                        disabled={!canSend}
                                    >
                                        <div>
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 16 16"
                                            >
                                                <path
                                                    d="M8.2738 8.49222L1.99997 9.09877L0.349029 14.3788C0.250591 14.691 0.347154 15.0322 0.595581 15.246C0.843069 15.4597 1.19464 15.5047 1.48903 15.3613L15.2384 8.7032C15.5075 8.57195 15.6781 8.29914 15.6781 8.00007C15.6781 7.70101 15.5074 7.4282 15.2384 7.29694L1.49839 0.634063C1.20401 0.490625 0.852453 0.535625 0.604941 0.749376C0.356493 0.963128 0.259941 1.30344 0.358389 1.61563L2.00932 6.89563L8.27093 7.50312C8.52405 7.52843 8.71718 7.74125 8.71718 7.99531C8.71718 8.24938 8.52406 8.46218 8.27093 8.4875L8.2738 8.49222Z"
                                                    fill="currentColor"
                                                />
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
                        {[].length > 0 && (
                            <>
                                <LoadingDots />
                                <span>
                                    {[].map((username) => (
                                        <span>{username}, </span>
                                    ))}

                                    {[].length > 0 ? "are typing..." : "is typing..."}
                                </span>
                            </>
                        )}
                    </div>

                    <div className={styles.counterContainer}>
                        <Tooltip>
                            <TooltipTrigger>
                                <span>
                                    <span
                                        style={{
                                            color:
                                                text.length > 16000
                                                    ? "var(--danger-0)"
                                                    : "var(--fg-3)",
                                        }}
                                    >
                                        {text.length}
                                    </span>
                                    /16000
                                </span>
                            </TooltipTrigger>

                            <TooltipContent>
                                {text.length > 16000
                                    ? "Message is too long"
                                    : `${16000 - text.length} characters remaining`}
                            </TooltipContent>
                        </Tooltip>
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
                        type="button"
                        className="button grey"
                        onClick={() => unblockUser.send({ userId: friend.id })}
                    >
                        {unblockUser.isLoading ? <LoadingDots /> : "Unblock"}
                    </button>
                </div>
            </form>
        );
    }
}

export function RecordVoiceMessage({ setVoiceMessage }: { setVoiceMessage: (blob: Blob) => void }) {
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recording, setRecording] = useState(false);

    const { setOpen } = useDialogContext();

    useEffect(() => {
        // Update time if recording
        if (recording) {
            const interval = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

            return () => clearInterval(interval);
        } else {
            setRecordingTime(0);
        }
    }, [recording]);

    async function startRecording() {
        setAudioBlob(null);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const localAudioChunks: Blob[] = []; // Local variable to store chunks
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                localAudioChunks.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            // Create the Blob when recording stops
            const blob = new Blob(localAudioChunks, { type: "audio/webm" });
            setAudioBlob(blob); // Update state with the finalized Blob
            stream.getTracks().forEach((track) => track.stop()); // Stop the stream
        };

        mediaRecorder.start();
        setRecording(true);
        setMediaRecorder(mediaRecorder);
    }

    function stopRecording() {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setRecording(false);
        }
    }

    function send() {
        if (audioBlob) {
            const file = new File([audioBlob], "voice-message.webm", {
                type: "audio/webm",
            });

            setVoiceMessage(file);
        }
    }

    return (
        <DialogContent
            showClose
            confirmLabel="Send"
            onConfirm={() => {
                send();
                setOpen(false);
            }}
            confirmDisabled={!audioBlob}
            heading="Record Voice Message"
            description="Record a voice message for your friends. Press the button to start recording and press it again to stop."
        >
            <div className={styles.voiceRecording}>
                <button
                    type="button"
                    className="button blue submit"
                    onClick={() => (recording ? stopRecording() : startRecording())}
                >
                    {recording ? "Stop Recording" : "Start Recording"}
                </button>

                <p className={styles.label}>Preview</p>

                {audioBlob && <VoiceMessage blob={audioBlob} />}

                {!audioBlob && (
                    <div className={styles.preview}>
                        <div
                            className={styles.dot}
                            style={{ backgroundColor: recording ? "var(--danger-0)" : "" }}
                        />

                        <span className={styles.time}>
                            {recording
                                ? `${Math.floor(recordingTime / 60)}:${String(
                                      recordingTime % 60
                                  ).padStart(2, "0")}`
                                : "0:00"}
                        </span>

                        <div className={styles.title}>{recording ? "Recording" : "- - - -"}</div>
                    </div>
                )}
            </div>
        </DialogContent>
    );
}
