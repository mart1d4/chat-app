"use client";

import { FixedMessage, LoadingDots, Icon, Popout, Checkbox, Avatar } from "@components";
import { useRef, useEffect, useState, ReactElement } from "react";
import { getChannelName, getRelativeDate } from "@/lib/strings";
import useFetchHelper from "@/hooks/useFetchHelper";
import { base } from "@uploadcare/upload-client";
import { useData, useLayers } from "@/lib/store";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import useLogout from "@/hooks/useLogout";
import filetypeinfo from "magic-bytes.js";
import styles from "./Popup.module.css";
import Image from "next/image";

export const Popup = ({ content, friends }: any): ReactElement => {
    if (content.type === "PINNED_MESSAGES" || content.type === "CREATE_DM") {
        return (
            <Popout
                content={content}
                friends={friends}
            />
        );
    }

    const user = useData((state) => state.user) as TCleanUser;
    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);

    const { sendRequest } = useFetchHelper();
    const { logout } = useLogout();
    const router = useRouter();
    const type = content.type;

    const [isLoading, setIsLoading] = useState(false);
    const [uid, setUID] = useState(user.username);
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [password, setPassword] = useState("");

    const [password1, setPassword1] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [password1Error, setPassword1Error] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");

    const [isImage, setIsImage] = useState<boolean>(false);
    const [filename, setFilename] = useState("");
    const [description, setDescription] = useState("");
    const [isSpoiler, setIsSpoiler] = useState(false);

    const [join, setJoin] = useState(false);
    const [guildTemplate, setGuildTemplate] = useState<number>(0);
    const [guildName, setGuildName] = useState(`${user.username}'s server`);
    const [guildIcon, setGuildIcon] = useState<null | File>(null);

    const [channelName, setChannelName] = useState("");
    const [channelType, setChannelType] = useState(2);
    const [channelLocked, setChannelLocked] = useState(false);

    const popupRef = useRef<HTMLDivElement>(null);
    const uidInputRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const guildIconInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Reset all state when popup is closed
        if (!layers.POPUP) {
            setIsLoading(false);
            setUID(user.username);
            setPassword("");
            setPassword1("");
            setNewPassword("");
            setConfirmPassword("");
            setPassword1Error("");

            setFilename("");
            setDescription("");
            setIsSpoiler(false);

            setJoin(false);
            setGuildTemplate(0);
            setGuildName("`${auth.user.username}'s server`");
            setGuildIcon(null);

            setChannelName("");
            setChannelType(2);
            setChannelLocked(false);
        }
    }, [layers.POPUP]);

    useEffect(() => {
        if (!content.file) return;

        const imageTypes = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/apng", "image/apng"];

        const isFileImage = async () => {
            const fileBytes = new Uint8Array(await content.file.file.arrayBuffer());
            const fileType = filetypeinfo(fileBytes)?.[0]?.mime?.toString();
            setIsImage(imageTypes.includes(fileType ?? ""));
        };

        isFileImage();
    }, [content.file]);

    const handleUsernameSubmit = async () => {
        if (isLoading) return;
        setIsLoading(true);

        if (!uid) {
            setUsernameError("Username cannot be empty.");
            return setIsLoading(false);
        }

        if (uid.length < 3 || uid.length > 32) {
            setUsernameError("Username must be between 3 and 32 characters.");
            return setIsLoading(false);
        }

        if (user.username === uid) {
            setUsernameError("Username cannot be the same as your current username.");
            return setIsLoading(false);
        }

        if (!password) {
            setPasswordError("Password cannot be empty.");
            return setIsLoading(false);
        }

        try {
            const response = await sendRequest({
                query: "UPDATE_USER",
                data: {
                    username: uid,
                    password: password,
                },
            });

            if (!response.success) return setUsernameError(response.message ?? "Couldn't update username.");
            setPassword("");
            setLayers({
                settings: {
                    type: "POPUP",
                    setNull: true,
                },
            });
        } catch (err) {
            console.error(err);
        }

        setIsLoading(false);
    };

    const handlePasswordSubmit = async () => {
        if (isLoading) return;
        setIsLoading(true);

        if (!password1) {
            setPassword1Error("Current password cannot be empty.");
            return setIsLoading(false);
        }

        if (!newPassword) {
            setNewPasswordError("New password cannot be empty.");
            return setIsLoading(false);
        }

        if (newPassword.length < 8 || newPassword.length > 256) {
            setNewPasswordError("New password must be between 8 and 256 characters.");
            return setIsLoading(false);
        }

        if (!confirmPassword) {
            setNewPasswordError("Confirm password cannot be empty.");
            return setIsLoading(false);
        }

        if (newPassword !== confirmPassword) {
            setNewPasswordError("New password and confirm password must match.");
            return setIsLoading(false);
        }

        try {
            const response = await sendRequest({
                query: "UPDATE_USER",
                data: {
                    password: password1,
                    newPassword: newPassword,
                },
            });

            if (!response.success) return setPassword1Error(response.message ?? "Couldn't update password.");
            setPassword1("");
            setNewPassword("");
            setConfirmPassword("");
            setLayers({
                settings: {
                    type: "POPUP",
                    setNull: true,
                },
            });
        } catch (err) {
            console.error(err);
        }

        setIsLoading(false);
    };

    const props = {
        CREATE_GUILD: {
            title: join || guildTemplate ? "Customize your server" : "Create a server",
            description:
                join || guildTemplate
                    ? "Give your new server a personality with a name and an icon. You can always change it later"
                    : "Your server is where you and your friends hang out. Make yours and start talking.",
            buttonColor: join || guildTemplate ? "blue" : "grey",
            buttonText: join ? "Join server" : guildTemplate ? "Create" : "Join a server",
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
            title: `Create ${content.isCategory ? "Category" : "Channel"}`,
            description: content.category ? `in ${content.category.name}` : content.isCategory ? null : " ",
            buttonColor: "blue",
            buttonText: channelLocked ? "Next" : `Create ${content.isCategory ? "Category" : "Channel"}`,
            buttonDisabled: !channelName || channelLocked,
            function: () => {
                if (!channelName || channelLocked) return;
                sendRequest({
                    query: "GUILD_CHANNEL_CREATE",
                    params: {
                        guildId: content.guild,
                    },
                    data: {
                        name: channelName,
                        type: content.isCategory ? 4 : channelType,
                        locked: channelLocked,
                        categoryId: content.category?.id,
                    },
                });
            },
        },
        GUILD_CHANNEL_DELETE: {
            title: `Delete ${content.channel?.type === 4 ? "Category" : "Channel"}`,
            description: `Are you sure you want to delete ${content.channel?.type === 2 ? "#" : ""}${
                content.channel?.name
            }? This cannot be undone.`,
            buttonColor: "red",
            buttonText: `Delete ${content.channel?.type === 4 ? "Category" : "Channel"}`,
            function: () => {
                sendRequest({
                    query: "GUILD_CHANNEL_DELETE",
                    params: {
                        channelId: content.channel?.id,
                    },
                });
            },
        },
        UPDATE_USERNAME: {
            title: "Change your username",
            description: "Enter a new username and your existing password.",
            buttonColor: "blue",
            buttonText: "Done",
            function: handleUsernameSubmit,
            centered: true,
        },
        UPDATE_PASSWORD: {
            title: "Update your password",
            description: "Enter your current password and a new password.",
            buttonColor: "blue",
            buttonText: "Done",
            function: handlePasswordSubmit,
            centered: true,
        },
        DELETE_MESSAGE: {
            title: "Delete Message",
            description: "Are you sure you want to delete this message?",
            buttonColor: "red",
            buttonText: "Delete",
            function: () => {
                sendRequest({
                    query: "DELETE_MESSAGE",
                    params: {
                        channelId: content.message.channelId,
                        messageId: content.message.id,
                    },
                });
            },
        },
        PIN_MESSAGE: {
            title: "Pin It. Pin It Good.",
            description:
                "Hey, just double checking that you want to pin this message to the current channel for posterity and greatness?",
            buttonColor: "blue",
            buttonText: "Oh yeah. Pin it",
            function: () => {
                sendRequest({
                    query: "PIN_MESSAGE",
                    params: {
                        channelId: content.message.channelId,
                        messageId: content.message.id,
                    },
                });
            },
        },
        UNPIN_MESSAGE: {
            title: "Unpin Message",
            description: "You sure you want to remove this pinned message?",
            buttonColor: "red",
            buttonText: "Remove it please!",
            function: () => {
                sendRequest({
                    query: "UNPIN_MESSAGE",
                    params: {
                        channelId: content.message.channelId,
                        messageId: content.message.id,
                    },
                });
            },
        },
        FILE_EDIT: {
            title: content.file?.file?.name.startsWith("SPOILER_")
                ? content.file.file.name.slice(8)
                : content?.file?.file?.name,
            description: "",
            buttonColor: "blue",
            buttonText: "Save",
            function: () => {
                content.handleFileChange({
                    filename: filename,
                    description: description,
                    isSpoiler: isSpoiler,
                });
            },
        },
        LOGOUT: {
            title: "Log Out",
            description: "Are you sure you want to logout?",
            buttonColor: "red",
            buttonText: "Log Out",
            function: () => logout(),
        },
        DELETE_ATTACHMENT: {
            title: "Are you sure?",
            description: "This will remove this attachment from this message permanently.",
            buttonColor: "red",
            buttonText: "Remove Attachment",
            function: () => {
                sendRequest({
                    query: "UPDATE_MESSAGE",
                    params: {
                        channelId: content.message.channelId,
                        messageId: content.message.id,
                    },
                    data: {
                        attachments: content.attachments,
                    },
                });
            },
        },
        CHANNEL_EXISTS: {
            title: "Confirm New Group",
            description: "You already have a group with these people! Are you sure you want to create a new one?",
            buttonColor: "blue",
            buttonText: "Create Group",
            function: () => {
                if (content?.addUsers) {
                    content.addUsers();
                } else if (content.recipients) {
                    sendRequest({
                        query: "CHANNEL_CREATE",
                        data: {
                            recipients: content.recipients,
                        },
                        skipCheck: true,
                    });
                }
            },
        },
        GROUP_OWNER_CHANGE: {
            title: "Transfer Group Ownership",
            buttonColor: "red",
            buttonText: "Confirm",
            function: () => {
                sendRequest({
                    query: "CHANNEL_RECIPIENT_OWNER",
                    params: {
                        channelId: content.channelId,
                        recipientId: content.recipient.id,
                    },
                });
            },
        },
    };

    useEffect(() => {
        if (!content?.file) return;
        const name = content.file.file.name;
        setFilename(name.startsWith("SPOILER_") ? name.slice(8) : name);
        setDescription(content.file.description ?? "");
        setIsSpoiler(content.file.file.name.startsWith("SPOILER_"));
    }, [content.file]);

    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            if (layers.POPUP.length === 0) return;

            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();

                setLayers({
                    settings: {
                        type: "POPUP",
                        setNull: true,
                    },
                });
            }

            if (e.key === "Enter" && !e.shiftKey && content.type) {
                e.preventDefault();
                e.stopPropagation();

                if (isLoading) return;

                if (type === "CREATE_GUILD") {
                    if (!guildTemplate && !join) {
                        setGuildTemplate(1);
                    } else if (guildTemplate) {
                        await createGuild();
                    } else if (join) {
                        // Join server with invite code
                    }
                    return;
                }

                props[content.type as keyof typeof props].function();
                setLayers({
                    settings: {
                        type: "POPUP",
                        setNull: true,
                    },
                });
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        layers.POPUP,
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
                    store: "auto",
                });

                if (!result.file) console.error(result);
                else uploadedIcon = result.file;
            };

            await getIcon();
            const response = await sendRequest({
                query: "GUILD_CREATE",
                data: {
                    name: guildName,
                    icon: uploadedIcon,
                    template: guildTemplate,
                },
            });

            if (!response.success) {
                return alert(response.message ?? "Something went wrong. Try again later.");
            }

            setLayers({
                settings: {
                    type: "POPUP",
                    setNull: true,
                },
            });
        } catch (err) {
            console.error(err);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        uidInputRef?.current?.focus();
        passwordRef?.current?.focus();
    }, [layers.POPUP]);

    useEffect(() => {
        setUsernameError("");
    }, [uid]);

    useEffect(() => {
        setPasswordError("");
    }, [password]);

    useEffect(() => {
        setPassword1Error("");
    }, [password1]);

    useEffect(() => {
        setNewPasswordError("");
    }, [newPassword, confirmPassword]);

    let prop: any;
    if (content?.type && content.type !== "WARNING") prop = props[content.type as keyof typeof props];

    return (
        <AnimatePresence>
            {content.type === "ATTACHMENT_PREVIEW" ? (
                <div
                    ref={popupRef}
                    role="dialog"
                    aria-modal="true"
                    className={styles.container}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <div
                        className={styles.imagePreview}
                        onContextMenu={(e) => {
                            setLayers({
                                settings: {
                                    type: "MENU",
                                    event: e,
                                },
                                content: {
                                    type: "IMAGE",
                                    attachment: content.attachments[content.current],
                                },
                            });
                        }}
                    >
                        <img
                            src={`${process.env.NEXT_PUBLIC_CDN_URL}/${
                                content.attachments[content.current].id
                            }/-/resize/${
                                content.attachments[content.current].dimensions.width >= window.innerWidth
                                    ? Math.ceil(window.innerWidth * 0.9)
                                    : content.attachments[content.current].dimensions.width
                            }x/`}
                            alt={content.attachments[content.current]?.description ?? "Image"}
                        />
                    </div>

                    <a
                        target="_blank"
                        className={styles.imageLink}
                        href={`${process.env.NEXT_PUBLIC_CDN_URL}/${content.attachments[content.current].id}/`}
                    >
                        Open in new tab
                    </a>
                </div>
            ) : content.type === "WARNING" ? (
                <div
                    ref={popupRef}
                    role="dialog"
                    aria-modal="true"
                    className={styles.container}
                    onContextMenu={(e) => e.preventDefault()}
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
                                {content.warning === "FILE_SIZE" && "Your files are too powerful"}
                                {content.warning === "FILE_TYPE" && "Invalid File Type"}
                                {content.warning === "FILE_NUMBER" && "Too many uploads!"}
                                {content.warning === "UPLOAD_FAILED" && "Upload Failed"}
                            </div>

                            <div className={styles.description}>
                                {content.warning === "FILE_SIZE" && "Max file size is 10.00 MB please."}
                                {content.warning === "FILE_TYPE" && "Hm.. I don't think we support that type of file"}
                                {content.warning === "FILE_NUMBER" && "You can only upload 10 files at a time!"}
                                {content.warning === "UPLOAD_FAILED" && "Something went wrong. try again later"}
                            </div>
                        </div>
                    </div>
                </div>
            ) : content.type ? (
                <div
                    ref={popupRef}
                    className={styles.cardContainer}
                    style={{
                        width: type === "FILE_EDIT" ? "530px" : type === "GUILD_CHANNEL_CREATE" ? "460px" : "",
                        padding: type === "FILE_EDIT" ? "84px 4px 0 4px" : "",
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    {type === "FILE_EDIT" &&
                        (isImage ? (
                            <img
                                className={styles.imagePopup}
                                src={URL.createObjectURL(content.file.file)}
                                alt={content.file.file.name}
                            />
                        ) : (
                            <img
                                className={styles.imagePopup}
                                src="https://ucarecdn.com/d2524731-0ab6-4360-b6c8-fc9d5b8147c8/"
                                alt={content.file.file.name}
                            />
                        ))}

                    {!prop?.centered ? (
                        <div
                            className={styles.titleBlock}
                            style={{
                                paddingBottom: type === "GUILD_CHANNEL_CREATE" && prop.description !== " " ? "0" : "",
                            }}
                        >
                            <h1>{prop.title}</h1>
                        </div>
                    ) : (
                        <div className={styles.titleBlockCentered}>
                            <div>{prop.title}</div>
                            <div>{prop.description}</div>

                            <button
                                onClick={() =>
                                    setLayers({
                                        settings: {
                                            type: "POPUP",
                                            setNull: true,
                                        },
                                    })
                                }
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    width="24"
                                    height="24"
                                    role="image"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}

                    <div className={styles.popupContent + " scrollbar"}>
                        {!prop?.centered && (
                            <>
                                {prop.description && (
                                    <div
                                        className={`${styles.description} ${
                                            type === "GUILD_CHANNEL_CREATE" ? styles.small : ""
                                        }`}
                                    >
                                        {prop.description}
                                    </div>
                                )}

                                {content.message && content.type !== "DELETE_ATTACHMENT" && (
                                    <div className={styles.messagesContainer}>
                                        <FixedMessage
                                            message={content.message}
                                            pinned={false}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                        {(type === "DELETE_MESSAGE" || type === "UNPIN_MESSAGE") && (
                            <div className={styles.protip}>
                                <div>Protip:</div>

                                <div>
                                    You can hold down shift when clicking
                                    <strong> {type === "DELETE_MESSAGE" ? "delete message" : "unpin message"} </strong>
                                    to bypass this confirmation entirely.
                                </div>
                            </div>
                        )}
                        {type === "CHANNEL_EXISTS" && (
                            <div
                                className={styles.channelItem}
                                onClick={() => {
                                    setLayers({
                                        settings: {
                                            type: "POPUP",
                                            setNull: true,
                                        },
                                    });
                                    router.push(`/channels/me/${content.channel.id}`);
                                }}
                            >
                                <Avatar
                                    src={content.channel.icon}
                                    alt={getChannelName(content.channel, user.id)}
                                    size={24}
                                />

                                <span>{getChannelName(content.channel, user.id)}</span>
                                <span>{getRelativeDate(content.channel.updatedAt, true)}</span>
                            </div>
                        )}
                        {type === "GROUP_OWNER_CHANGE" && (
                            <div className={styles.ownerChange}>
                                <svg
                                    height="16"
                                    width="80"
                                    viewBox="0 0 80 16"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g
                                        fill="none"
                                        fill-rule="evenodd"
                                        opacity=".6"
                                    >
                                        <path d="m0 0h80v16h-80z" />
                                        <g
                                            stroke="var(--foreground-3)"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                        >
                                            <path d="m71 1h4v4.16" />
                                            <path
                                                d="m2 1h4v4.16"
                                                transform="matrix(-1 0 0 1 8 0)"
                                            />
                                            <path d="m51 1h4m6 0h4m-24 0h4m-14 0h4m-14 0h4m-23 11v-2m9-9h4" />
                                            <path d="m72.13 10.474 2.869 3.12 2.631-3.12" />
                                        </g>
                                    </g>
                                </svg>

                                <div className={styles.ownerAvatars}>
                                    <div>
                                        <Avatar
                                            src={user.avatar}
                                            alt={user.username}
                                            size={80}
                                        />
                                    </div>

                                    <div>
                                        <Avatar
                                            src={content.recipient.avatar}
                                            alt={content.recipient.username}
                                            size={80}
                                        />
                                    </div>
                                </div>

                                <div>Transfer ownership of this group to {content.recipient.username}?</div>
                            </div>
                        )}
                        {type === "CREATE_GUILD" && !guildTemplate && !join && (
                            <>
                                <button
                                    className={styles.serverTemplate}
                                    onClick={() => setGuildTemplate(1)}
                                >
                                    <img
                                        src="https://ucarecdn.com/2699b806-e43b-4fea-aa0b-da3bde1972b4/"
                                        alt="Create My Own"
                                    />
                                    <div>Create My Own</div>
                                    <Icon name="arrow" />
                                </button>

                                <div className={styles.serverTemplateTitle}>Start from a template</div>

                                {[
                                    ["Gaming", "34bdb748-aea8-4542-b534-610ac9ad347f"],
                                    ["School Club", "d0460999-065f-4289-9021-5f9c4cf2ddd7"],
                                    ["Study Group", "fe757867-ce50-4353-9c9b-cb64ec3968b6"],
                                    ["Friends", "fcfc0474-e405-47df-b7ef-1373bfe83070"],
                                    ["Artists & Creators", "6057e335-8633-4909-b7c8-970182095185"],
                                    ["Local Community", "bca2a8ed-2498-42a1-a964-9af6f8479d7f"],
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
                                        <Icon name="arrow" />
                                    </button>
                                ))}
                            </>
                        )}

                        {type === "CREATE_GUILD" && guildTemplate !== 0 && (
                            <>
                                <div className={styles.uploadIcon}>
                                    <div>
                                        {guildIcon ? (
                                            <Image
                                                src={URL.createObjectURL(guildIcon)}
                                                alt="Guild Icon"
                                                width={80}
                                                height={80}
                                                style={{
                                                    borderRadius: "50%",
                                                }}
                                            />
                                        ) : (
                                            <Icon
                                                name="fileUpload"
                                                size={80}
                                                viewbox="0 0 80 80"
                                            />
                                        )}

                                        <div
                                            role="button"
                                            aria-label="Upload a Server Icon"
                                            onClick={() => guildIconInput.current?.click()}
                                        />
                                    </div>

                                    <input
                                        type="file"
                                        ref={guildIconInput}
                                        accept="image/png, image/jpeg, image/gif, image/apng, image/webp"
                                        onChange={async (e) => {
                                            const allowedFileTypes = [
                                                "image/png",
                                                "image/jpeg",
                                                "image/gif",
                                                "image/apng",
                                                "image/webp",
                                            ];

                                            const file = e.target.files ? e.target.files[0] : null;
                                            if (!file) return (e.target.value = "");

                                            // Run checks
                                            const maxFileSize = 1024 * 1024 * 10; // 10MB
                                            if (file.size > maxFileSize) {
                                                setLayers({
                                                    settings: {
                                                        type: "POPUP",
                                                    },
                                                    content: {
                                                        type: "WARNING",
                                                        warning: "FILE_SIZE",
                                                    },
                                                });
                                                return (e.target.value = "");
                                            }

                                            const fileBytes = new Uint8Array(await file.arrayBuffer());
                                            const fileType = filetypeinfo(fileBytes)?.[0].mime?.toString();

                                            if (!fileType || !allowedFileTypes.includes(fileType)) {
                                                setLayers({
                                                    settings: {
                                                        type: "POPUP",
                                                    },
                                                    content: {
                                                        type: "WARNING",
                                                        warning: "FILE_TYPE",
                                                    },
                                                });
                                                return (e.target.value = "");
                                            }

                                            const newFile = new File([file], "image", {
                                                type: file.type,
                                            });

                                            setGuildIcon(newFile);
                                            e.target.value = "";
                                        }}
                                    />
                                </div>

                                <div className={styles.input}>
                                    <label>Server name</label>
                                    <div>
                                        <input
                                            type="text"
                                            maxLength={100}
                                            value={guildName}
                                            onChange={(e) => setGuildName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        {type === "GUILD_CHANNEL_CREATE" && (
                            <>
                                {!content.isCategory && (
                                    <div className={styles.channelType}>
                                        <h2>Channel Type</h2>

                                        <div
                                            className={styles.typePick}
                                            onClick={() => setChannelType(2)}
                                            style={{
                                                backgroundColor: channelType === 2 ? "var(--background-hover-2)" : "",
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        color: channelType === 2 ? "var(--foreground-1)" : "",
                                                    }}
                                                >
                                                    <Icon name={channelType === 2 ? "circleChecked" : "circle"} />
                                                </div>

                                                <div>
                                                    <div>
                                                        <Icon name={channelLocked ? "hashtagLock" : "hashtag"} />
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
                                                backgroundColor: channelType === 3 ? "var(--background-hover-2)" : "",
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        color: channelType === 3 ? "var(--foreground-1)" : "",
                                                    }}
                                                >
                                                    <Icon name={channelType === 3 ? "circleChecked" : "circle"} />
                                                </div>

                                                <div>
                                                    <div>
                                                        <Icon name={channelLocked ? "voiceLock" : "voice"} />
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

                                <div className={`${styles.input} ${!content.isCategory && styles.channel}`}>
                                    <label>Channel name</label>
                                    <div>
                                        {!content.isCategory && (
                                            <Icon
                                                name={
                                                    channelType === 2
                                                        ? channelLocked
                                                            ? "hashtagLock"
                                                            : "hashtag"
                                                        : channelLocked
                                                        ? "voiceLock"
                                                        : "voice"
                                                }
                                            />
                                        )}

                                        <input
                                            type="text"
                                            maxLength={100}
                                            value={channelName}
                                            placeholder={content.isCategory ? "New Category" : "new-channel"}
                                            onChange={(e) => setChannelName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className={styles.privateCheck}>
                                    <div onClick={() => setChannelLocked((prev) => !prev)}>
                                        <label>
                                            <Icon name="lock" />
                                            {content.isCategory ? "Private Category" : "Private Channel"}
                                        </label>

                                        <div>
                                            <Checkbox checked={channelLocked} />
                                        </div>
                                    </div>

                                    <div>
                                        {content.isCategory
                                            ? "By making a category private, only selected members and roles will be able to view this category. Synced channels in this category will automatically match to this setting."
                                            : "Only selected members and roles will be able to view this channel."}
                                    </div>
                                </div>
                            </>
                        )}
                        {type === "FILE_EDIT" && (
                            <>
                                <div className={styles.input}>
                                    <label
                                        htmlFor="uid"
                                        style={{
                                            color: usernameError.length ? "var(--error-light)" : "var(--foreground-3)",
                                        }}
                                    >
                                        Filename
                                        {usernameError.length > 0 && (
                                            <span className={styles.errorLabel}>- {usernameError}</span>
                                        )}
                                    </label>
                                    <div className={styles.inputContainer}>
                                        <input
                                            id="filename"
                                            type="text"
                                            name="filename"
                                            aria-label="Filename"
                                            autoCapitalize="off"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            spellCheck="false"
                                            aria-labelledby="filename"
                                            aria-describedby="filename"
                                            value={filename}
                                            maxLength={999}
                                            onChange={(e) => setFilename(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className={styles.input}>
                                    <label
                                        htmlFor="password"
                                        style={{
                                            color: passwordError.length ? "var(--error-light)" : "var(--foreground-3)",
                                        }}
                                    >
                                        Description (alt text)
                                        {passwordError.length > 0 && (
                                            <span className={styles.errorLabel}>- {passwordError}</span>
                                        )}
                                    </label>
                                    <div className={styles.inputContainer}>
                                        <input
                                            id="description"
                                            type="text"
                                            name="description"
                                            placeholder="Add a description"
                                            aria-label="Description"
                                            autoCapitalize="off"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            spellCheck="false"
                                            aria-labelledby="description"
                                            aria-describedby="description"
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
                                    <input type="checkbox" />

                                    <div style={{ borderColor: isSpoiler ? "var(--accent-border)" : "" }}>
                                        {isSpoiler && (
                                            <Icon
                                                name="accept"
                                                fill="var(--accent-1)"
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <div>Mark as spoiler</div>
                                    </div>
                                </label>
                            </>
                        )}
                        {type === "UPDATE_USERNAME" && (
                            <>
                                <div className={styles.input}>
                                    <label
                                        htmlFor="uid"
                                        style={{
                                            color: usernameError.length ? "var(--error-light)" : "var(--foreground-3)",
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
                                            id="uid"
                                            type="text"
                                            name="username"
                                            aria-label="Username"
                                            autoCapitalize="off"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            spellCheck="false"
                                            aria-labelledby="uid"
                                            aria-describedby="uid"
                                            value={uid}
                                            onChange={(e) => setUID(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className={styles.input}>
                                    <label
                                        htmlFor="password"
                                        style={{
                                            color: passwordError.length ? "var(--error-light)" : "var(--foreground-3)",
                                        }}
                                    >
                                        Current Password
                                        {passwordError.length > 0 && (
                                            <span className={styles.errorLabel}>- {passwordError}</span>
                                        )}
                                    </label>
                                    <div className={styles.inputContainer}>
                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            aria-label="Password"
                                            autoCapitalize="off"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            spellCheck="false"
                                            aria-labelledby="password"
                                            aria-describedby="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        {type === "UPDATE_PASSWORD" && (
                            <>
                                <div className={styles.input}>
                                    <label
                                        htmlFor="password1"
                                        style={{
                                            color: password1Error.length ? "var(--error-light)" : "var(--foreground-3)",
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
                                            id="password1"
                                            type="password"
                                            name="password"
                                            aria-label="Password"
                                            autoCapitalize="off"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            spellCheck="false"
                                            aria-labelledby="password"
                                            aria-describedby="password"
                                            value={password1}
                                            onChange={(e) => setPassword1(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div
                                    className={styles.input}
                                    style={{ marginBottom: "20px" }}
                                >
                                    <label
                                        htmlFor="newPassword"
                                        style={{
                                            color: newPasswordError.length
                                                ? "var(--error-light)"
                                                : "var(--foreground-3)",
                                        }}
                                    >
                                        New Password
                                        {newPasswordError.length > 0 && (
                                            <span className={styles.errorLabel}>- {newPasswordError}</span>
                                        )}
                                    </label>
                                    <div className={styles.inputContainer}>
                                        <input
                                            id="newPassword"
                                            type="password"
                                            name="password"
                                            aria-label="New Password"
                                            autoCapitalize="off"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            spellCheck="false"
                                            aria-labelledby="password"
                                            aria-describedby="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className={styles.input}>
                                    <label
                                        htmlFor="confirmPassword"
                                        style={{
                                            color: newPasswordError.length
                                                ? "var(--error-light)"
                                                : "var(--foreground-3)",
                                        }}
                                    >
                                        Confirm New Password
                                        {newPasswordError.length > 0 && (
                                            <span className={styles.errorLabel}>- {newPasswordError}</span>
                                        )}
                                    </label>
                                    <div className={styles.inputContainer}>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            name="password"
                                            aria-label="Confirm Password"
                                            autoCapitalize="off"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            spellCheck="false"
                                            aria-labelledby="password"
                                            aria-describedby="password"
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
                            margin: type === "FILE_EDIT" ? "0 -4px" : "",
                        }}
                    >
                        <button
                            className="underline"
                            onClick={() => {
                                if (type === "CREATE_GUILD") {
                                    if (guildTemplate !== 0) return setGuildTemplate(0);
                                    else if (join) return setJoin(false);
                                }
                                setLayers({
                                    settings: {
                                        type: "POPUP",
                                        setNull: true,
                                    },
                                });
                            }}
                        >
                            {guildTemplate || join ? "Back" : "Cancel"}
                        </button>

                        <button
                            className={`${prop.buttonColor} ${prop?.buttonDisabled ? "disabled" : ""}`}
                            onClick={async () => {
                                if (prop?.buttonDisabled) return;
                                if (type === "CREATE_GUILD") {
                                    if (!guildTemplate && !join) setJoin(true);
                                    else if (join) console.log("Join server with invite code");
                                    else if (guildTemplate) await createGuild();
                                    return;
                                }

                                prop.function();
                                setLayers({
                                    settings: {
                                        type: "POPUP",
                                        setNull: true,
                                    },
                                });
                            }}
                        >
                            {isLoading ? <LoadingDots /> : prop.buttonText}
                        </button>
                    </div>
                </div>
            ) : (
                <></>
            )}
        </AnimatePresence>
    );
};
