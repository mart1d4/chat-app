"use client";

import { type ChangeEvent, useCallback, useEffect, useState, useMemo, useRef } from "react";
import { Editor, Transforms, Range, createEditor, Point, Node, addMark } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import type { Channel, ChannelRecipient, Message } from "@/type";
import type { MessageFunctions } from "../Message/Message";
import useFetchHelper from "@/hooks/useFetchHelper";
import { lowercaseContains } from "@/lib/strings";
import { fileTypeFromStream } from "file-type";
import type { CustomEditor } from "@/slate";
import { withHistory } from "slate-history";
import { getNanoIdInt } from "@/lib/utils";
import styles from "./TextArea.module.css";
import { nanoid } from "nanoid";
import {
    useDialogContext,
    TooltipTrigger,
    TooltipContent,
    DialogContent,
    VoiceMessage,
    FilePreview,
    LoadingDots,
    UserMention,
    MenuTrigger,
    MenuContent,
    EmojiButton,
    MenuItem,
    Tooltip,
    Avatar,
    Menu,
    Icon,
} from "@components";
import {
    useWindowSettings,
    useTriggerDialog,
    useEmojiPicker,
    useSettings,
    useMessages,
    useMention,
    useData,
} from "@/store";

const initialEditorValue = [{ type: "paragraph", children: [{ text: "" }] }];

function serialize(nodes: Node[]) {
    return nodes.map((n) => Node.string(n)).join("\n");
}

function withMentions(editor: CustomEditor) {
    const { isInline, isVoid, markableVoid } = editor;

    editor.isInline = (element) => {
        return element.type === "mention" ? true : isInline(element);
    };

    editor.isVoid = (element) => {
        return element.type === "mention" ? true : isVoid(element);
    };

    editor.markableVoid = (element) => {
        return element.type === "mention" || markableVoid(element);
    };

    return editor;
}

function insertMention(editor: CustomEditor, recipient: ChannelRecipient) {
    Transforms.insertNodes(editor, {
        type: "mention",
        recipient,
        children: [{ text: `<@${recipient.id}>` }],
    });
    Transforms.move(editor);
    Editor.insertText(editor, " ");
}

// Borrow Leaf renderer from the Rich Text example.
// In a real project you would get this via `withRichText(editor)` or similar.
function Leaf({ attributes, children, leaf }) {
    if (leaf.bold) {
        children = <strong>{children}</strong>;
    }

    if (leaf.code) {
        children = <code>{children}</code>;
    }

    if (leaf.italic) {
        children = <em>{children}</em>;
    }

    if (leaf.underline) {
        children = <u>{children}</u>;
    }

    if (leaf.strikethrough) {
        children = <s>{children}</s>;
    }

    if (leaf.spoiler) {
        children = <span className={styles.spoiler}>{children}</span>;
    }

    if (leaf.link) {
        children = <span className={styles.link}>{children}</span>;
    }

    return <span {...attributes}>{children}</span>;
}

function Element(props) {
    const { attributes, children, element } = props;

    if (element.type === "mention") {
        return <Mention {...props} />;
    }

    if (element.type === "code") {
        return (
            <pre {...attributes}>
                <code>{children}</code>
            </pre>
        );
    }

    return <p {...attributes}>{children}</p>;
}

function Mention({ attributes, children, element }) {
    return (
        <span
            {...attributes}
            contentEditable={false}
            data-cy={`mention-${element.recipient.id}`}
        >
            <UserMention
                user={element.recipient}
                full
                editor
            />

            <span style={{ display: "none" }}>{children}</span>
        </span>
    );
}

export function TextArea({
    channel,
    setMessages,
    messageObject,
    functions,
    edit,
}: {
    channel: Channel;
    setMessages: InfiniteKeyedMutator;
    messageObject?: Message;
    functions?: MessageFunctions;
    edit?: {
        messageId: number;
        content: string | undefined;
    };
}) {
    const width562 = useWindowSettings((state) => state.widthThresholds)[562];
    const setMention = useMention((state) => state.setMention);
    const setDraft = useMessages((state) => state.setDraft);
    const settings = useSettings((state) => state.settings);

    const setReply = useMessages((state) => state.setReply);
    const replies = useMessages((state) => state.replies);
    const setEdit = useMessages((state) => state.setEdit);
    const mention = useMention((state) => state.userId);
    const drafts = useMessages((state) => state.drafts);
    const user = useData((state) => state.user);
    const { sendRequest } = useFetchHelper();

    const reply = replies.find((r) => r.channelId === channel.id);
    const draft = drafts.find((d) => d.channelId === channel.id);

    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const [voiceMessage, setVoiceMessage] = useState<Blob | null>(null);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [usersTyping, setUsersTyping] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const textAreaRef = useRef<HTMLDivElement>(null);

    const { blocked } = useData();
    const friend = channel.recipients.find((r) => r.id !== user?.id);

    const [target, setTarget] = useState<Range | null>(null);
    const [index, setIndex] = useState(0);
    const [search, setSearch] = useState("");

    const renderElement = useCallback((props) => <Element {...props} />, []);
    const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
    const editor = useMemo(() => withMentions(withReact(withHistory(createEditor()))), []);

    const { data: emojiPickerData, setData: setEmojiPickerData } = useEmojiPicker();

    const text = serialize(editor.children);
    const canSend = text.length > 0 || attachments.length > 0;

    const recipients = channel.recipients.filter((r) => lowercaseContains(r.displayName, search));

    const onKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (target && recipients.length > 0) {
                if (["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(event.key)) {
                    event.preventDefault();
                }

                switch (event.key) {
                    case "ArrowDown":
                        const prevIndex = index >= recipients.length - 1 ? 0 : index + 1;
                        setIndex(prevIndex);
                        break;
                    case "ArrowUp":
                        const nextIndex = index <= 0 ? recipients.length - 1 : index - 1;
                        setIndex(nextIndex);
                        break;
                    case "Enter":
                        Transforms.select(editor, target);
                        insertMention(editor, recipients[index]);
                        setTarget(null);
                        break;
                    case "Escape":
                        setTarget(null);
                        break;
                }
            } else if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        },
        [recipients, editor, index, target]
    );

    const { triggerDialog, removeDialog } = useTriggerDialog();

    async function handleFileSubmit(files: File[], e: DragEvent | ChangeEvent<HTMLInputElement>) {
        if (files.length === 0) return;

        if (attachments.length + files.length > 10) {
            triggerDialog({ type: "FILE_NUMBER" });

            if (e.target instanceof HTMLInputElement) {
                return (e.target.value = "");
            }

            return;
        }

        let checkedFiles = [];
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
                id: getNanoIdInt(),

                file,
                ext: typeObj?.ext ?? file.name.split(".").pop() ?? "",
                url: URL.createObjectURL(file),
                type: type as AttachmentType,

                size: file.size,
                filename: file.name ?? "",
                spoiler: false,
                description: "",

                height,
                width,
            });
        }

        setAttachments((prev) => [...prev, ...checkedFiles]);

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

        // Add listeners
        document.addEventListener("dragover", handleDragOver);
        document.addEventListener("dragenter", handleDragEnter);
        document.addEventListener("dragleave", handleDragLeave);
        document.addEventListener("drop", handleDrop);

        // Cleanup
        return () => {
            document.removeEventListener("dragover", handleDragOver);
            document.removeEventListener("dragenter", handleDragEnter);
            document.removeEventListener("dragleave", handleDragLeave);
            document.removeEventListener("drop", handleDrop);
        };
    }, [attachments]);

    useEffect(() => {
        if (!mention || edit) return;

        insertMention(editor, mention);
        setMention(null);
    }, [mention]);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                if (edit) setEdit(edit.messageId, null);
                if (reply) setReply(channel.id, null);
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
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
            mentions: [],
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
            if (recipient && !temp.mentions.map((m) => m.id).includes(recipient.id)) {
                temp.mentions.push(recipient);
            }
        }

        // Reset the editor state
        // First set caret to the start of the editor and select nothing

        editor.selection = {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 0 },
        };
        editor.children = [{ type: "paragraph", children: [{ text: "" }] }];

        if (edit && messageObject) {
            functions?.startEditingMessage();
            return;
        } else {
            setDraft(channel.id, null);
        }

        setAttachments([]);
        setMessages(temp);

        if (reply?.messageId) setReply(channel.id, null);
    }

    async function unblockUser() {
        setLoading((prev) => ({ ...prev, unblockUser: true }));

        try {
            await sendRequest({
                query: "UNBLOCK_USER",
                params: { userId: friend?.id },
            });
        } catch (error) {
            console.error(error);
        }

        setLoading((prev) => ({ ...prev, unblockUser: false }));
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
                send: true,
                error: false,
                loading: true,
            };

            setMessages(temp);
            if (reply?.messageId) setReply(channel.id, null);

            setVoiceMessage(null);
        }
    }, [voiceMessage]);

    const textContainer = useMemo(
        () => (
            <div
                className={styles.textContainer}
                ref={(el) => {
                    if (el) {
                        el.style.height = "auto";
                        el.style.height = `${el.scrollHeight}px`;
                    }
                }}
            >
                <div
                    ref={textAreaRef}
                    className={styles.textbox}
                    onContextMenu={() => {
                        // setLayers({
                        //     settings: { type: "MENU", event: e },
                        //     content: {
                        //         type: "INPUT",
                        //         input: true,
                        //         sendButton: true,
                        //         pasteText,
                        //     },
                        // });
                    }}
                >
                    <Slate
                        editor={editor}
                        initialValue={JSON.parse(
                            edit?.content || draft?.content || JSON.stringify(initialEditorValue)
                        )}
                        onChange={(value) => {
                            // Get current text at cursor
                            // const currentWord = Editor.string(editor, editor.selection);

                            const json = JSON.stringify(value);

                            if (edit && messageObject) {
                                setEdit(messageObject.id, json);
                            } else {
                                setDraft(channel.id, json);
                            }

                            const { selection } = editor;

                            if (selection && Range.isCollapsed(selection)) {
                                const [start] = Range.edges(selection);

                                const before = Editor.before(editor, start, { unit: "character" });
                                const beforeRange = before && Editor.range(editor, before, start);
                                const beforeText =
                                    beforeRange && Editor.string(editor, beforeRange);

                                const range =
                                    beforeRange &&
                                    word(editor, beforeRange, {
                                        terminator: [" "],
                                        directions: "both",
                                        include: true,
                                    });

                                let text = range && Editor.string(editor, range);

                                // If text includes spaces and text after those spaces,
                                // only keep the text after the space
                                if (
                                    text &&
                                    text.includes(" ") &&
                                    text.split(" ").length > 1 &&
                                    text.split(" ").pop() !== ""
                                ) {
                                    text = text.split(" ").pop() || "";
                                }

                                const match = text && text.match(/(?<=^|\s)@(\S*)/);

                                if (match && beforeText !== " ") {
                                    setTarget(beforeRange);
                                    setSearch(match[1]);
                                    setIndex(0);
                                    return;
                                }
                            }

                            setTarget(null);
                        }}
                    >
                        <Editable
                            autoFocus
                            focus-id="text-area"
                            onKeyDown={onKeyDown}
                            onPaste={async (e) => {
                                // If text is more than 16000 characters, prevent paste
                                // and add a .txt file instead to the attachments, unless it's full alreaddy
                                // and if user is pasting a file, well just add it to the attachments
                                const items = Array.from(e.clipboardData.items);
                                const textItem = items.find((i) => i.type === "text/plain");

                                if (textItem) {
                                    textItem.getAsString((text) => {
                                        if (text.length > 16000) {
                                            e.preventDefault();

                                            const blob = new Blob([text], { type: "text/plain" });
                                            const file = new File([blob], "message.txt", {
                                                type: "text/plain",
                                            });

                                            return handleFileSubmit([file], e as any);
                                        }
                                    });
                                }

                                const fileItem = items.find((i) => i.kind === "file");

                                if (fileItem) {
                                    e.preventDefault();
                                    const file = fileItem.getAsFile();
                                    if (file) {
                                        handleFileSubmit([file], e as any);
                                    }
                                }
                            }}
                            renderLeaf={renderLeaf}
                            renderElement={renderElement}
                            id={`textarea${edit ? "-edit" : ""}-${channel.id}`}
                            placeholder={
                                edit
                                    ? "Edit Message"
                                    : `Message ${
                                          channel.type === 0 ? "@" : channel.type === 2 ? "#" : ""
                                      }${channel.name}`
                            }
                        />
                    </Slate>
                </div>
            </div>
        ),
        [text, attachments, edit, draft]
    );

    const container = document.getElementById(`text-area${edit ? "-edit" : ""}-${channel.id}`);

    if (edit) {
        return (
            <form
                className={styles.form}
                id={`text-area-edit-${channel.id}`}
                style={{ padding: "0 0 0 0", margin: "8px 0 0 0" }}
            >
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
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        );
    } else if (!blocked.find((b) => b.id === friend?.id) || channel.type !== 0) {
        return (
            <form
                className={styles.form}
                id={`text-area-${channel.id}`}
            >
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
                    {target && recipients.length > 0 && (
                        <div
                            className={`${styles.mentionPopover} scrollbar`}
                            data-cy="mentions-portal"
                        >
                            <div>
                                <h3>Members</h3>
                            </div>

                            {recipients.map((recipient, i) => (
                                <div
                                    key={recipient.id}
                                    className={styles.mentionContainer}
                                >
                                    <div
                                        onMouseEnter={() => setIndex(i)}
                                        onClick={() => {
                                            Transforms.select(editor, target);
                                            insertMention(editor, recipient);
                                            setTarget(null);
                                        }}
                                        style={{
                                            backgroundColor:
                                                i === index ? "var(--background-4)" : "",
                                        }}
                                    >
                                        <div className={styles.avatar}>
                                            <Avatar
                                                size={24}
                                                type="user"
                                                status={recipient.status}
                                                fileId={recipient.avatar}
                                                generateId={recipient.id}
                                                alt={recipient.displayName}
                                            />
                                        </div>

                                        <div className={styles.displayName}>
                                            {recipient.displayName}
                                        </div>
                                        <div className={styles.username}>
                                            {recipient.displayName}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

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
                        {usersTyping.length > 0 && (
                            <>
                                <LoadingDots />
                                <span>
                                    {usersTyping.map((username) => (
                                        <span>{username}, </span>
                                    ))}

                                    {usersTyping.length > 0 ? "are typing..." : "is typing..."}
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
                                                    ? "var(--error-1)"
                                                    : "var(--foreground-3)",
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
                        onClick={() => unblockUser()}
                    >
                        {loading.unblockUser ? <LoadingDots /> : "Unblock"}
                    </button>
                </div>
            </form>
        );
    }
}

function word(
    editor: ReactEditor,
    location: Range,
    options: {
        terminator?: string[];
        include?: boolean;
        directions?: "both" | "left" | "right";
    } = {}
): Range | undefined {
    const { terminator = [" "], include = false, directions = "both" } = options;

    const { selection } = editor;
    if (!selection) return;

    // Get start and end, modify it as we move along.
    let [start, end] = Range.edges(location);

    let point: Point = start;

    function move(direction: "right" | "left"): boolean {
        const next =
            direction === "right"
                ? Editor.after(editor, point, {
                      unit: "character",
                  })
                : Editor.before(editor, point, { unit: "character" });

        const wordNext =
            next &&
            Editor.string(
                editor,
                direction === "right"
                    ? { anchor: point, focus: next }
                    : { anchor: next, focus: point }
            );

        const last = wordNext && wordNext[direction === "right" ? 0 : wordNext.length - 1];
        if (next && last && !terminator.includes(last)) {
            point = next;

            if (point.offset === 0) {
                // Means we've wrapped to beginning of another block
                return false;
            }
        } else {
            return false;
        }

        return true;
    }

    // Move point and update start & end ranges

    // Move forwards
    if (directions !== "left") {
        point = end;
        while (move("right"));
        end = point;
    }

    // Move backwards
    if (directions !== "right") {
        point = start;
        while (move("left"));
        start = point;
    }

    if (include) {
        return {
            anchor: Editor.before(editor, start, { unit: "offset" }) ?? start,
            focus: Editor.after(editor, end, { unit: "offset" }) ?? end,
        };
    }

    return { anchor: start, focus: end };
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
                            style={{ backgroundColor: recording ? "var(--error-1)" : "" }}
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
