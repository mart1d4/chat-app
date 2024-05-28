"use client";

import { useRef, useEffect, useMemo, useCallback, useReducer, Fragment } from "react";
import { statuses, colors, masks } from "@/lib/statuses";
import useFetchHelper from "@/hooks/useFetchHelper";
import { useKeenSlider } from "keen-slider/react";
import { sanitizeString } from "@/lib/strings";
import useRequests from "@/hooks/useRequests";
import { useData, useLayers } from "@/store";
import { getRelativeDate } from "@/lib/time";
import { useRouter } from "next/navigation";
import "keen-slider/keen-slider.min.css";
import type { Attachment } from "@/type";
import useFiles from "@/hooks/useFiles";
import styles from "./Popup.module.css";
import Image from "next/image";
import {
    FixedMessage,
    LoadingCubes,
    InvitePopup,
    LoadingDots,
    EmojiPicker,
    Checkbox,
    Popout,
    Avatar,
    Input,
    Icon,
} from "@components";

function getFileStyle(file: Attachment) {
    if (!file || !file.width || !file.height) return {};

    const maxWidth = 416;
    const maxHeight = 158;

    let width = file.width;
    let height = file.height;

    const wGreater = file.width > file.height;
    const hGreater = file.height > file.width;
    const sizeSame = file.width === file.height;

    if (wGreater) {
        if (height > maxHeight) {
            height = maxHeight;
            width = (maxHeight / file.height) * file.width;
        }

        if (width > maxWidth) {
            width = maxWidth;
            height = (maxWidth / file.width) * file.height;
        }
    } else if (hGreater) {
        if (width > maxWidth) {
            width = maxWidth;
            height = (maxWidth / file.width) * file.height;
        }

        if (height > maxHeight) {
            height = maxHeight;
            width = (maxHeight / file.height) * file.width;
        }
    } else if (sizeSame) {
        width = 103;
        height = 103;
    }

    return {
        width: width,
        height: height,
        marginLeft: 16,
        marginRight: 16,
        marginTop: sizeSame ? -33 : wGreater ? -33 : -86,
    };
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type PopupContent = {
    [key: string]: {
        title: string;
        description?: string;
        tip?: string;
        button: {
            color: "blue" | "red" | "grey";
            text: string;
            disabled?: boolean;
            big?: boolean;
        };
        noButtons?: boolean;
        centered?: boolean;
        skipClose?: boolean;
        function: () => void;
    };
};

function reducer(state, action) {
    switch (action.type) {
        case "SET_IMAGE_LOADING":
            return {
                ...state,
                image: {
                    ...state.image,
                    loading: action.payload,
                },
            };

        case "SET_USERNAME":
            return {
                ...state,
                username: action.payload,
            };

        case "SET_PASSWORD":
            return {
                ...state,
                password: action.payload,
            };

        case "SET_NEW_PASSWORD":
            return {
                ...state,
                newPassword: action.payload,
            };

        case "SET_CONFIRM_PASSWORD":
            return {
                ...state,
                confirmPassword: action.payload,
            };

        case "SET_FILE":
            return {
                ...state,
                file: {
                    ...state.file,
                    ...action.payload,
                },
            };

        case "SET_CHANNEL":
            return {
                ...state,
                channel: {
                    ...state.channel,
                    ...action.payload,
                },
            };

        case "SET_GUILD":
            return {
                ...state,
                guild: {
                    ...state.guild,
                    ...action.payload,
                },
            };

        case "SET_IMAGE_INDEX":
            return {
                ...state,
                image: {
                    ...state.image,
                    index: action.payload,
                },
            };

        case "SET_STATUS":
            return {
                ...state,
                status: action.payload,
            };

        case "SET_CUSTOM_STATUS":
            return {
                ...state,
                customStatus: action.payload,
            };

        case "SET_SHOW_OPTIONS":
            return {
                ...state,
                showOptions: action.payload,
            };

        case "SET_ERRORS":
            return {
                ...state,
                errors: {
                    ...state.errors,
                    ...action.payload,
                },
            };

        case "SET_LOADING":
            return {
                ...state,
                loading: action.payload,
            };

        case "SET_NOTIFY":
            return {
                ...state,
                notify: action.payload,
            };

        default:
            return state;
    }
}

export function Popup({
    content,
    element,
    closing,
}: {
    content: any;
    element: any;
    closing: boolean;
}) {
    const setLayers = useLayers((state) => state.setLayers);
    const layers = useLayers((state) => state.layers);
    const user = useData((state) => state.user);

    const { modifyUsername } = useRequests();
    const addGuild = useData((state) => state.addGuild);
    const { sendRequest } = useFetchHelper();
    const { onFileChange } = useFiles();
    const router = useRouter();
    const type = content.type;

    const initState = useMemo(
        () => ({
            loading: false,
            errors: {},
            username: user.username,
            password: "",
            newUsername: "",
            confirmPassword: "",
            newPassword: "",
            file: {
                name: content?.file?.name,
                description: content?.file?.description,
                spoiler: content?.file?.spoiler,
            },
            channel: {
                name: "",
                type: content.voice ? 3 : 2,
                locked: false,
            },
            guild: {
                join: false,
                invite: "",
                template: 0,
                name: `${user.username}'s server`,
                icon: null,
            },
            image: {
                index: content.current ?? 0,
                loading: true,
            },
            status: user.status,
            customStatus: user.customStatus ?? "",
            showOptions: null,
            notify: false,
        }),
        []
    );

    const [state, dispatch] = useReducer(reducer, initState);

    const guildIconInput = useRef<HTMLInputElement>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        dispatch({
            type: "SET_IMAGE_LOADING",
            payload: true,
        });
    }, [state.image.index]);

    const [sliderRef, instanceRef] = useKeenSlider(
        {
            initial: 0,
            drag: false,
        },
        []
    );

    async function submitUsername() {
        await modifyUsername({
            username: sanitizeString(state.username),
            current: user.username,
            password: state.password,
            onSuccess: () => {
                setLayers({
                    settings: {
                        type: "POPUP",
                        setNull: true,
                    },
                });
            },
            setErrors: (errors) => {
                dispatch({
                    type: "SET_ERRORS",
                    payload: errors,
                });
            },
            setLoading: (loading) => {
                dispatch({
                    type: "SET_LOADING",
                    payload: loading,
                });
            },
        });
    }

    async function handlePasswordSubmit() {
        dispatch({ type: "SET_LOADING", payload: true });

        if (!state.password) {
            dispatch({ type: "SET_ERRORS", payload: { password: "Password cannot be empty." } });
            return dispatch({ type: "SET_LOADING", payload: false });
        }

        if (!state.newPassword) {
            dispatch({
                type: "SET_ERRORS",
                payload: { newPassword: "New password cannot be empty." },
            });
            return dispatch({ type: "SET_LOADING", payload: false });
        }

        if (state.newPassword.length < 8 || state.newPassword.length > 256) {
            dispatch({
                type: "SET_ERRORS",
                payload: {
                    newPassword: "Password must be between 8 and 256 characters.",
                },
            });
            return dispatch({ type: "SET_LOADING", payload: false });
        }

        if (state.newPassword !== state.confirmPassword) {
            dispatch({
                type: "SET_ERRORS",
                payload: {
                    newPassword: "Passwords do not match.",
                    confirmPassword: "Passwords do not match.",
                },
            });
            return dispatch({ type: "SET_LOADING", payload: false });
        }

        if (state.password === state.newPassword) {
            dispatch({
                type: "SET_ERRORS",
                payload: {
                    newPassword: "New password cannot be the same as your current password.",
                    confirmPassword: "New password cannot be the same as your current password.",
                },
            });
            return dispatch({ type: "SET_LOADING", payload: false });
        }

        try {
            const response = await sendRequest({
                query: "UPDATE_USER",
                body: {
                    password: state.password,
                    newPassword: state.newPassword,
                },
            });

            if (!response.success) {
                dispatch({
                    type: "SET_ERRORS",
                    payload: {
                        password: response.message,
                    },
                });
            } else {
                setLayers({
                    settings: {
                        type: "POPUP",
                        setNull: true,
                    },
                });
            }
        } catch (err) {
            console.error(err);
        }

        dispatch({ type: "SET_LOADING", payload: false });
    }

    async function submitInvite() {
        dispatch({
            type: "SET_LOADING",
            payload: true,
        });

        // state.guild.invite can be anything, so we need to check if it's a valid invite

        let code = state.guild.invite;

        if (code.length < 2 || code.length > 100) {
            dispatch({
                type: "SET_ERRORS",
                payload: { guildInvite: "Invalid invite link." },
            });
            dispatch({
                type: "SET_LOADING",
                payload: false,
            });
            return;
        }

        if (code.includes("https://spark.mart1d4.dev/")) {
            code = code.split("/").pop();
        }

        const response = await sendRequest({
            query: "ACCEPT_INVITE",
            params: {
                inviteId: code,
            },
            body: {
                isGuild: true,
            },
        });

        if (response.success) {
            setLayers({
                settings: {
                    type: "POPUP",
                    setNull: true,
                },
            });

            if (response.guild) {
                addGuild(response.guild);
                router.push(`/channels/${response.guild.id}`);
            }
        } else {
            dispatch({
                type: "SET_ERRORS",
                payload: { guildInvite: response.message },
            });
        }

        dispatch({
            type: "SET_LOADING",
            payload: false,
        });
    }

    async function submitGuild() {
        if (state.loading) return;
        dispatch({
            type: "SET_LOADING",
            payload: true,
        });

        const response = await sendRequest({
            query: "GUILD_CREATE",
            body: {
                name: state.guild.name,
                icon: state.guild.icon,
                template: state.guild.template,
            },
        });

        const data = await response.json();

        if (response.ok) {
            setLayers({
                settings: {
                    type: "POPUP",
                    setNull: true,
                },
            });

            if (data.data.guild) {
                addGuild(data.data.guild);
                router.push(`/channels/${data.data.guild.id}`);
            }
        } else {
            dispatch({
                type: "SET_ERRORS",
                payload: data.data.errors,
            });
        }

        dispatch({
            type: "SET_LOADING",
            payload: false,
        });
    }

    const props: PopupContent = {
        GUILD_CHANNEL_CREATE: {
            title: `Create ${content.isCategory ? "Category" : "Channel"}`,
            description: content.category
                ? `in ${content.category.name}`
                : content.isCategory
                ? undefined
                : " ",
            button: {
                color: "blue",
                text: state.channel.locked
                    ? "Next"
                    : `Create ${content.isCategory ? "Category" : "Channel"}`,
                disabled: !state.channel.name || state.channel.locked,
            },
            function: () => {
                if (!state.channel.name || state.channel.locked) return;
                sendRequest({
                    query: "GUILD_CHANNEL_CREATE",
                    params: {
                        guildId: content.guild,
                    },
                    body: {
                        name: state.channel.name,
                        type: content.isCategory ? 4 : state.channel.type,
                        locked: state.channel.locked,
                        categoryId: content.category?.id,
                    },
                });
            },
        },
        GUILD_CHANNEL_DELETE: {
            title: `Delete ${content.channel?.type === 4 ? "Category" : "Channel"}`,
            description: `Are you sure you want to delete ${
                content.channel?.type === 2 ? "#" : ""
            }${content.channel?.name}? This cannot be undone.`,
            button: {
                color: "red",
                text: `Delete ${content.channel?.type === 4 ? "Category" : "Channel"}`,
            },
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
            button: {
                color: "blue",
                text: "Done",
                disabled: !state.username || !state.password,
            },
            function: submitUsername,
            centered: true,
            skipClose: true,
        },
        UPDATE_PASSWORD: {
            title: "Update your password",
            description: "Enter your current password and a new password.",
            button: {
                color: "blue",
                text: "Done",
                disabled: !state.password || !state.newPassword || !state.confirmPassword,
            },
            function: handlePasswordSubmit,
            centered: true,
            skipClose: true,
        },
        DELETE_MESSAGE: {
            title: "Delete Message",
            description: "Are you sure you want to delete this message?",
            button: {
                color: "red",
                text: "Delete",
            },
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
            button: {
                color: "blue",
                text: "Oh yeah. Pin it",
            },
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
            button: {
                color: "red",
                text: "Remove it please!",
            },
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
            title: content?.file?.name,
            button: {
                color: "blue",
                text: "Save",
            },
            function: () => {
                content.handleFileChange({
                    name: state.file.name,
                    description: state.file.description,
                    spoiler: state.file.spoiler,
                });
            },
        },
        LOGOUT: {
            title: "Log Out",
            description: "Are you sure you want to logout?",
            button: {
                color: "red",
                text: "Log Out",
            },
            function: () => {
                fetch(`${apiUrl}/auth/logout`, {
                    method: "POST",
                    credentials: "include",
                }).then(() => router.refresh());
            },
        },
        DELETE_ATTACHMENT: {
            title: "Are you sure?",
            description: "This will remove this attachment from this message permanently.",
            button: {
                color: "red",
                text: "Remove Attachment",
            },
            function: () => {
                sendRequest({
                    query: "UPDATE_MESSAGE",
                    params: {
                        channelId: content.message.channelId,
                        messageId: content.message.id,
                    },
                    body: {
                        attachments: content.attachments,
                    },
                });
            },
        },
        CHANNEL_EXISTS: {
            title: "Confirm New Group",
            description:
                "You already have a group with these people! Are you sure you want to create a new one?",
            button: {
                color: "blue",
                text: "Create New Group",
            },
            function: () => {
                if (content.addUsers) {
                    content.addUsers();
                } else if (content.recipients) {
                    sendRequest({
                        query: "CHANNEL_CREATE",
                        body: {
                            recipients: content.recipients,
                        },
                        skipCheck: true,
                    });
                }
            },
        },
        GROUP_OWNER_CHANGE: {
            title: "Transfer Group Ownership",
            button: {
                color: "blue",
                text: "Confirm",
            },
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
        LEAVE_CONFIRM: {
            title: `Leave '${content.channel ? content.channel.name : content.guild?.name}'`,
            description: `Are you sure you want to leave ${
                content.channel ? content.channel.name : content.guild?.name
            }? You won't be able to rejoin this ${
                content.guild ? "server" : "group"
            } unless your are re-invited.`,
            button: {
                color: "red",
                text: `Leave ${content.channel ? "Group" : "Server"}`,
            },
            function: () => {
                if (content.channel) {
                    sendRequest({
                        query: "CHANNEL_RECIPIENT_REMOVE",
                        params: {
                            channelId: content.channel?.id,
                            recipientId: user.id,
                            hideDeparture: state.notify,
                        },
                    });
                } else if (content.guild && !content.isOwner) {
                    sendRequest({
                        query: "GUILD_MEMBER_LEAVE",
                        params: {
                            guildId: content.guild.id,
                        },
                    });
                }
            },
        },
        RATE_LIMIT: {
            title: "WOAH THERE. WAY TOO SPICY",
            centered: true,
            description: "You're sending messages to quickly",
            button: {
                color: "blue",
                text: "Enter the chill zone",
                big: true,
            },
            function: () => {},
        },
        REMOVE_EMBEDS: {
            title: "Are you sure?",
            description: "This will remove all embeds on this message for everyone.",
            tip: "Hold shift when clearing embeds to skip this modal.",
            button: {
                color: "red",
                text: "Remove All Embeds",
            },
            function: () => content.onConfirm(),
        },
        CHANNEL_TOPIC: {
            title: content?.channel?.name,
            description: content?.channel?.topic,
            noButtons: true,
            function: () => {},
        },
        USER_STATUS: {
            title: "Set a custom status",
            button: {
                color: "blue",
                text: "Save",
            },
            function: () => {
                const correctStatus = statuses[state.status];

                if (correctStatus !== user.status || state.customStatus !== user.customStatus) {
                    sendRequest({
                        query: "UPDATE_USER",
                        data: {
                            status: correctStatus === user.status ? null : correctStatus,
                            customStatus:
                                state.customStatus === user.customStatus
                                    ? null
                                    : sanitizeString(state.customStatus),
                        },
                    });
                }
            },
        },
    };

    const prop = props[type as keyof typeof props] ?? null;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (layers.POPUP.length === 0) return;

            if (e.key === "Escape" && !layers.MENU && !state.loading) {
                setLayers({
                    settings: {
                        type: "POPUP",
                        setNull: true,
                    },
                });
            }

            if (e.key === "Enter" && !e.shiftKey && prop !== null) {
                if (
                    state.loading ||
                    document.activeElement === cancelRef.current ||
                    prop?.button?.disabled
                ) {
                    return;
                }

                prop.function();
                if (!prop.skipClose) {
                    setLayers({
                        settings: {
                            type: "POPUP",
                            setNull: true,
                        },
                    });
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [layers, state.loading, prop]);

    const getDimensions = useCallback((img: any) => {
        if (!img) return null;

        const ratio = img.width / img.height;
        const { innerWidth, innerHeight } = window;

        // Image max height is 75% of the window height minux 80px
        const maxHeight = innerHeight * 0.75 - 80;

        // Image max width is 75% of the window width
        const maxWidth = innerWidth * 0.75;

        const dimensions = {
            width: img.width,
            height: img.height,
            ratio,
            aspectRatio: `${img.width / img.height}`,
        };

        const isImageWiderThanWindow = img.width > maxWidth;
        const isImageTallerThanWindow = img.height > maxHeight;

        // If both, make dimensions depends on the smaller side of the window
        if (isImageWiderThanWindow && isImageTallerThanWindow) {
            if (maxWidth > maxHeight) {
                dimensions.height = maxHeight;
                dimensions.width = maxHeight * ratio;
            } else {
                dimensions.width = maxWidth;
                dimensions.height = maxWidth / ratio;
            }
        } else if (isImageWiderThanWindow) {
            dimensions.width = maxWidth;
            dimensions.height = maxWidth / ratio;
        } else if (isImageTallerThanWindow) {
            dimensions.height = maxHeight;
            dimensions.width = maxHeight * ratio;
        }

        return dimensions;
    }, []);

    const currentImage = useMemo(
        () =>
            content.attachments?.length
                ? {
                      ...content.attachments[state.image.index],
                      dimensions: getDimensions(content.attachments[state.image.index].dimensions),
                  }
                : null,
        [content.attachments, state.image.index]
    );

    const CloseButton = useMemo(
        () => (
            <button
                type="button"
                className={styles.closeButton}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setLayers({
                        settings: {
                            type: "POPUP",
                            setNull: true,
                        },
                    });
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                >
                    <path
                        fill="currentColor"
                        d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
                    />
                </svg>
            </button>
        ),
        []
    );

    const warnings = {
        FILE_TYPE: {
            title: "Invalid File Type",
            description: "Hm.. I don't think we support that type of file",
        },
        FILE_SIZE: {
            title: "Your files are too powerful",
            description: "Max file size is 5.00 MB please.",
        },
        FILE_NUMBER: {
            title: "Too many uploads!",
            description: "You can only upload 10 files at a time!",
        },
        UPLOAD_FAILED: {
            title: "Upload Failed",
            description: "Something went wrong. try again later",
        },
    };

    if (type === "PINNED_MESSAGES" || type === "CREATE_DM") {
        return (
            <Popout
                content={content}
                element={element}
            />
        );
    }

    if (type === "GUILD_INVITE") {
        return (
            <InvitePopup
                content={content}
                closing={closing}
            />
        );
    }

    return (
        <>
            {type === "CREATE_GUILD" ? (
                <div
                    ref={sliderRef}
                    className={`${styles.container} keen-slider`}
                    style={{
                        animationName: closing ? styles.popOut : "",
                        flexDirection: "row",
                        width: 440,
                    }}
                >
                    <div
                        className={`${styles.slider} keen-slider__slide`}
                        style={{ maxHeight: 558 }}
                    >
                        <header className={styles.centered}>
                            <div>Customize your server</div>
                            <div>
                                Give your new server a personality with a name and an icon. You can
                                always change it later
                            </div>

                            {CloseButton}
                        </header>

                        <main className={`${styles.content} scrollbar`}>
                            <div>
                                {[
                                    ["Create My Own", "/assets/system/own.svg"],
                                    ["Gaming", "/assets/system/gaming.svg"],
                                    ["School Club", "/assets/system/school.svg"],
                                    ["Study Group", "/assets/system/study.svg"],
                                    ["Friends", "/assets/system/friends.svg"],
                                    ["Artists & Creators", "/assets/system/artists.svg"],
                                    ["Local Community", "/assets/system/community.svg"],
                                ].map((template, index) => (
                                    <Fragment key={template[1]}>
                                        <button
                                            className={styles.serverTemplate}
                                            onClick={() => {
                                                dispatch({
                                                    type: "SET_GUILD",
                                                    payload: { template: index + 1 },
                                                });
                                                instanceRef.current?.next();
                                            }}
                                        >
                                            <img
                                                src={template[1]}
                                                alt={template[0]}
                                            />
                                            <div>{template[0]} </div>
                                            <Icon name="caret" />
                                        </button>

                                        {index === 0 && (
                                            <div className={styles.serverTemplateTitle}>
                                                Start from a template
                                            </div>
                                        )}
                                    </Fragment>
                                ))}
                            </div>
                        </main>

                        <footer className={styles.column}>
                            <h2>Have an invite already?</h2>

                            <button
                                className={`grey button ${styles.big}`}
                                onClick={() => {
                                    dispatch({
                                        type: "SET_GUILD",
                                        payload: { join: true },
                                    });
                                    instanceRef.current?.next();
                                }}
                            >
                                Join server
                            </button>
                        </footer>
                    </div>

                    <div
                        className={`${styles.slider} keen-slider__slide`}
                        style={{ maxHeight: 396 }}
                    >
                        <header className={styles.centered}>
                            {state.guild.join ? (
                                <>
                                    <div>Join a Server</div>
                                    <div>Enter an invite below to join an existing server</div>
                                </>
                            ) : (
                                <>
                                    <div>Create a server</div>
                                    <div>
                                        Your server is where you and your friends hang out. Make
                                        yours and start talking.
                                    </div>
                                </>
                            )}

                            {CloseButton}
                        </header>

                        <main className={`${styles.content} scrollbar`}>
                            {state.guild.join ? (
                                <div>
                                    <Input
                                        required
                                        maxLength={100}
                                        name="guild-invite"
                                        label="Invite Link"
                                        value={state.guild.invite}
                                        error={state.errors.guildInvite}
                                        placeholder="https://spark.mart1d4.dev/hTKzmak"
                                        onChange={(value) => {
                                            dispatch({
                                                type: "SET_GUILD",
                                                payload: { invite: value },
                                            });
                                            dispatch({
                                                type: "SET_ERRORS",
                                                payload: { guildInvite: "" },
                                            });
                                        }}
                                    />

                                    <div className={styles.input}>
                                        <label htmlFor="">Invites should look like</label>

                                        <ol
                                            style={{
                                                listStyle: "none",
                                                color: "var(--foreground-1)",
                                            }}
                                        >
                                            {[
                                                "hTKzmak",
                                                "https://spark.mart1d4.dev/hTKzmak",
                                                "https://spark.mart1d4.dev/cool-invite",
                                            ].map((invite) => (
                                                <li
                                                    key={invite}
                                                    onClick={() => {
                                                        dispatch({
                                                            type: "SET_GUILD",
                                                            payload: { invite },
                                                        });
                                                    }}
                                                >
                                                    {invite}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            ) : (
                                <form>
                                    <div className={styles.uploadIcon}>
                                        <div>
                                            {state.guild.icon ? (
                                                <Image
                                                    src={URL.createObjectURL(state.guild.icon)}
                                                    alt="Guild Icon"
                                                    width={80}
                                                    height={80}
                                                    style={{
                                                        borderRadius: "50%",
                                                    }}
                                                />
                                            ) : (
                                                <Icon
                                                    size={80}
                                                    name="fileUpload"
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
                                                const file = await onFileChange(e);
                                                if (file) {
                                                    dispatch({
                                                        type: "SET_GUILD",
                                                        payload: { icon: file },
                                                    });
                                                }
                                            }}
                                        />
                                    </div>

                                    <Input
                                        required
                                        maxLength={100}
                                        name="guild-name"
                                        label="Server name"
                                        value={state.guild.name}
                                        error={state.errors.name}
                                        onChange={(value) => {
                                            dispatch({
                                                type: "SET_GUILD",
                                                payload: { name: value },
                                            });
                                        }}
                                    />
                                </form>
                            )}
                        </main>

                        <footer className={styles.spaced}>
                            <button
                                type="button"
                                className="button underline"
                                onClick={() => {
                                    dispatch({
                                        type: "SET_GUILD",
                                        payload: { template: 0 },
                                    });
                                    if (state.guild.join) {
                                        dispatch({
                                            type: "SET_GUILD",
                                            payload: { join: false },
                                        });
                                    }
                                    instanceRef.current?.prev();
                                }}
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                className={`blue button ${
                                    state.guild.template && !state.guild.name ? "disabled" : ""
                                }`}
                                onClick={async () => {
                                    const disabled = state.guild.template && !state.guild.name;
                                    if (state.loading || disabled) return;

                                    if (state.guild.join && state.guild.invite) {
                                        await submitInvite();
                                    } else {
                                        await submitGuild();
                                    }
                                }}
                            >
                                {state.loading ? (
                                    <LoadingDots />
                                ) : state.guild.join ? (
                                    "Join Server"
                                ) : (
                                    "Create"
                                )}
                            </button>
                        </footer>
                    </div>
                </div>
            ) : type === "ATTACHMENT_PREVIEW" ? (
                <div
                    role="dialog"
                    aria-modal="true"
                    className={styles.animation}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ animationName: closing ? styles.popOut : "" }}
                >
                    {content.attachments.length > 1 && (
                        <button
                            className={styles.imageNav}
                            onClick={() => {
                                const length = content.attachments.length;
                                if (state.image.index === 0) {
                                    dispatch({ type: "SET_IMAGE_INDEX", payload: length - 1 });
                                } else {
                                    dispatch({
                                        type: "SET_IMAGE_INDEX",
                                        payload: state.image.index - 1,
                                    });
                                }
                            }}
                        >
                            <Icon name="arrowBig" />
                        </button>
                    )}

                    <div
                        className={styles.imagePreview}
                        style={{
                            width: currentImage.dimensions.width,
                            height: currentImage.dimensions.height,
                        }}
                    >
                        <div
                            style={{
                                width: currentImage.dimensions.width,
                                height: currentImage.dimensions.height,
                            }}
                            onContextMenu={(e) => {
                                setLayers({
                                    settings: {
                                        type: "MENU",
                                        event: e,
                                    },
                                    content: {
                                        type: "IMAGE",
                                        attachment: currentImage,
                                    },
                                });
                            }}
                        >
                            {state.image.loading && (
                                <div className={styles.imageLoading}>
                                    <LoadingCubes />
                                </div>
                            )}

                            <Image
                                style={{
                                    aspectRatio: currentImage.dimensions.aspectRatio,
                                    opacity: state.image.loading ? 0 : 1,
                                }}
                                src={currentImage.url}
                                alt={currentImage.description || "Image"}
                                width={currentImage.dimensions.width}
                                height={currentImage.dimensions.height}
                                onLoad={() =>
                                    dispatch({ type: "SET_IMAGE_LOADING", payload: false })
                                }
                                priority
                            />
                        </div>

                        <a
                            target="_blank"
                            className={styles.imageLink}
                            href={`${process.env.NEXT_PUBLIC_CDN_URL}/${currentImage.id}/`}
                        >
                            Open in new tab
                        </a>
                    </div>

                    {content.attachments.length > 1 && (
                        <button
                            className={styles.imageNav}
                            onClick={() => {
                                const length = content.attachments.length;
                                if (state.image.index === length - 1) {
                                    dispatch({ type: "SET_IMAGE_INDEX", payload: 0 });
                                } else {
                                    dispatch({
                                        type: "SET_IMAGE_INDEX",
                                        payload: state.image.index + 1,
                                    });
                                }
                            }}
                        >
                            <Icon name="arrowBig" />
                        </button>
                    )}
                </div>
            ) : type === "WARNING" ? (
                <div
                    role="dialog"
                    aria-modal="true"
                    className={styles.animation}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ animationName: closing ? styles.popOut : "" }}
                >
                    <div
                        className={styles.warning}
                        style={{
                            backgroundColor:
                                content.warning === "DRAG_FILE" ? "var(--accent-1)" : "",
                        }}
                    >
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
                                {content.warning !== "DRAG_FILE" && warnings[content.warning].title}
                                {content.warning === "DRAG_FILE" &&
                                    `Upload to ${
                                        content.channel?.type === 0
                                            ? "@"
                                            : content.channel?.type === 2
                                            ? "#"
                                            : ""
                                    }${content.channel.name}`}
                            </div>

                            <div className={styles.description}>
                                {content.warning !== "DRAG_FILE" &&
                                    warnings[content.warning].description}
                                {content.warning === "DRAG_FILE" && (
                                    <>
                                        You can add comments before uploading.
                                        <br />
                                        Hold shift to upload directly.
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    className={`${styles.container} ${
                        type === "FILE_EDIT"
                            ? styles.fileEdit
                            : type === "GUILD_CHANNEL_CREATE"
                            ? styles.guildChannelCreate
                            : ""
                    } ${type === "CREATE_GUILD" ? "keen-slider" : ""}`}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ animationName: closing ? styles.popOut : "" }}
                >
                    {type === "FILE_EDIT" && (
                        <img
                            className={styles.headerImage}
                            src={true ? content.file.url : `/assets/system/file-text.svg`}
                            alt={content.file.name}
                            style={getFileStyle(content.file)}
                        />
                    )}

                    {type === "USER_STATUS" && (
                        <Image
                            className={styles.headerImage + " " + styles.centered}
                            src="/assets/system/user-status.svg"
                            alt="Status"
                            width={200}
                            height={120}
                        />
                    )}

                    <header
                        className={prop.centered ? styles.centered : ""}
                        style={{
                            justifyContent: type === "USER_STATUS" ? "center" : "left",
                        }}
                    >
                        <h1>{prop.title}</h1>
                        {prop.centered && <p>{prop.description}</p>}
                        {prop.centered && CloseButton}
                    </header>

                    <main className={`${styles.content} scrollbar`}>
                        {!prop.centered && prop.description && (
                            <div
                                className={`${styles.description} ${
                                    type === "GUILD_CHANNEL_CREATE" ? styles.small : ""
                                }`}
                            >
                                {prop.description}
                            </div>
                        )}

                        {!prop.centered && prop.tip && (
                            <div style={{ color: "var(--foreground-5)", userSelect: "none" }}>
                                {prop.tip}
                            </div>
                        )}

                        {!prop.centered && content.message && type !== "DELETE_ATTACHMENT" && (
                            <div className={styles.messagesContainer}>
                                <FixedMessage
                                    message={content.message}
                                    pinned={false}
                                />
                            </div>
                        )}

                        {content.type === "LEAVE_CONFIRM" && content.channel && (
                            <div className={styles.checkbox}>
                                <Checkbox
                                    checked={state.notify}
                                    onChange={() => {
                                        dispatch({
                                            type: "SET_NOTIFY",
                                            payload: !state.notify,
                                        });
                                    }}
                                    inputFor={`leave-${content.channel.id}`}
                                    box
                                />

                                <label htmlFor={`leave-${content.channel.id}`}>
                                    Leave without notifying other members
                                </label>
                            </div>
                        )}

                        {type === "USER_STATUS" && (
                            <form>
                                <Input
                                    label={`What's cookin', ${user.username}?`}
                                    maxLength={100}
                                    value={state.customStatus}
                                    error={state.errors.customStatus}
                                    placeholder="Support has arrived!"
                                    onChange={(value) => {
                                        dispatch({
                                            type: "SET_CUSTOM_STATUS",
                                            payload: value,
                                        });
                                    }}
                                    leftItem={<EmojiPicker />}
                                    rightItem={
                                        state.customStatus && (
                                            <div
                                                onClick={() => {
                                                    dispatch({
                                                        type: "SET_CUSTOM_STATUS",
                                                        payload: "",
                                                    });
                                                }}
                                                className={styles.clearInput}
                                            >
                                                <Icon
                                                    name="closeFilled"
                                                    viewbox="0 0 14 14"
                                                />
                                            </div>
                                        )
                                    }
                                />

                                <div className={styles.divider} />

                                <div className={styles.input}>
                                    <label>Status</label>
                                    <div
                                        className={styles.divInput}
                                        style={{
                                            borderRadius: state.showOptions ? "4px 4px 0 0" : "",
                                        }}
                                        onClick={(e) => {
                                            if (state.showOptions)
                                                dispatch({
                                                    type: "SET_SHOW_OPTIONS",
                                                    payload: null,
                                                });
                                            else
                                                dispatch({
                                                    type: "SET_SHOW_OPTIONS",
                                                    payload: e.currentTarget,
                                                });
                                        }}
                                    >
                                        {statuses[state.status as keyof typeof statuses]}

                                        <div
                                            className={styles.inputIcon}
                                            style={{
                                                transform: state.showOptions
                                                    ? "translateY(-50%) rotate(-90deg)"
                                                    : "translateY(-50%) rotate(90deg)",
                                            }}
                                        >
                                            <Icon name="caret" />
                                        </div>

                                        {state.showOptions && (
                                            <ul className={styles.options}>
                                                {["online", "idle", "dnd", "offline"].map((s) => (
                                                    <li
                                                        className={
                                                            state.status === s
                                                                ? styles.selected
                                                                : ""
                                                        }
                                                        key={s}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            dispatch({
                                                                type: "SET_STATUS",
                                                                payload: s,
                                                            });
                                                            dispatch({
                                                                type: "SET_SHOW_OPTIONS",
                                                                payload: null,
                                                            });
                                                        }}
                                                    >
                                                        <div>
                                                            <svg className={styles.settingStatus}>
                                                                <rect
                                                                    height="10px"
                                                                    width="10px"
                                                                    rx={8}
                                                                    ry={8}
                                                                    fill={colors[s]}
                                                                    mask={`url(#${masks[s]})`}
                                                                />
                                                            </svg>
                                                            {statuses[s]}
                                                        </div>

                                                        {state.status === s && (
                                                            <Icon
                                                                name="selected"
                                                                fill="var(--accent-1)"
                                                            />
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </form>
                        )}

                        {(type === "DELETE_MESSAGE" || type === "UNPIN_MESSAGE") && (
                            <div className={styles.protip}>
                                <div>Protip:</div>

                                <div>
                                    You can hold down shift when clicking
                                    <strong>
                                        {" "}
                                        {type === "DELETE_MESSAGE"
                                            ? "delete message"
                                            : "unpin message"}{" "}
                                    </strong>
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
                                    alt={content.channel.name}
                                    type="icons"
                                    size={24}
                                />

                                <span>{content.channel.name}</span>
                                <span>{getRelativeDate(content.channel.updatedAt)}</span>
                            </div>
                        )}

                        {type === "GROUP_OWNER_CHANGE" && (
                            <div className={styles.ownerChange}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 80 16"
                                    height="16"
                                    width="80"
                                >
                                    <g
                                        fill="none"
                                        fillRule="evenodd"
                                        opacity=".6"
                                    >
                                        <path d="m0 0h80v16h-80z" />
                                        <g stroke="var(--foreground-3)">
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
                                            type="avatars"
                                            size={80}
                                        />
                                    </div>

                                    <div>
                                        <Avatar
                                            src={content.recipient.avatar}
                                            alt={content.recipient.username}
                                            type="avatars"
                                            size={80}
                                        />
                                    </div>
                                </div>

                                <div>
                                    Transfer ownership of this group to {content.recipient.username}
                                    ?
                                </div>
                            </div>
                        )}

                        {type === "GUILD_CHANNEL_CREATE" && (
                            <>
                                {!content.isCategory && (
                                    <div className={styles.channelType}>
                                        <h2>Channel Type</h2>

                                        <div
                                            tabIndex={0}
                                            className={styles.typePick}
                                            onClick={() =>
                                                dispatch({
                                                    type: "SET_CHANNEL",
                                                    payload: { type: 2 },
                                                })
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    dispatch({
                                                        type: "SET_CHANNEL",
                                                        payload: { type: 2 },
                                                    });
                                                }
                                            }}
                                            style={{
                                                backgroundColor:
                                                    state.channel.type === 2
                                                        ? "var(--background-hover-2)"
                                                        : "",
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        color:
                                                            state.channel.type === 2
                                                                ? "var(--foreground-1)"
                                                                : "",
                                                    }}
                                                >
                                                    <Icon
                                                        name={
                                                            state.channel.type === 2
                                                                ? "circleChecked"
                                                                : "circle"
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <div>
                                                        <Icon
                                                            name={
                                                                state.channel.locked
                                                                    ? "hashtagLock"
                                                                    : "hashtag"
                                                            }
                                                        />
                                                    </div>

                                                    <div className={styles.content}>
                                                        <div>Text</div>
                                                        <div>
                                                            Send messages, images, GIFs, emoji,
                                                            opinions, and puns
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            tabIndex={0}
                                            className={styles.typePick}
                                            onClick={() =>
                                                dispatch({
                                                    type: "SET_CHANNEL",
                                                    payload: { type: 3 },
                                                })
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    dispatch({
                                                        type: "SET_CHANNEL",
                                                        payload: { type: 3 },
                                                    });
                                                }
                                            }}
                                            style={{
                                                backgroundColor:
                                                    state.channel.type === 3
                                                        ? "var(--background-hover-2)"
                                                        : "",
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        color:
                                                            state.channel.type === 3
                                                                ? "var(--foreground-1)"
                                                                : "",
                                                    }}
                                                >
                                                    <Icon
                                                        name={
                                                            state.channel.type === 3
                                                                ? "circleChecked"
                                                                : "circle"
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <div>
                                                        <Icon
                                                            name={
                                                                state.channel.locked
                                                                    ? "voiceLock"
                                                                    : "voice"
                                                            }
                                                        />
                                                    </div>

                                                    <div className={styles.content}>
                                                        <div>Voice</div>
                                                        <div>
                                                            Hang out together with voice, video, and
                                                            screen share
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Input
                                    required
                                    maxLength={100}
                                    name="channel-name"
                                    label="Channel name"
                                    value={state.channel.name}
                                    error={state.errors.channelName}
                                    placeholder={
                                        content.isCategory ? "New Category" : "new-channel"
                                    }
                                    onChange={(value) => {
                                        dispatch({
                                            type: "SET_CHANNEL",
                                            payload: { name: value },
                                        });
                                    }}
                                    leftItem={
                                        !content.isCategory && (
                                            <Icon
                                                name={
                                                    state.channel.type === 2
                                                        ? state.channel.locked
                                                            ? "hashtagLock"
                                                            : "hashtag"
                                                        : state.channel.locked
                                                        ? "voiceLock"
                                                        : "voice"
                                                }
                                            />
                                        )
                                    }
                                />

                                <div className={styles.privateCheck}>
                                    <div
                                        onClick={() =>
                                            dispatch({
                                                type: "SET_CHANNEL",
                                                payload: { locked: !state.channel.locked },
                                            })
                                        }
                                    >
                                        <label>
                                            <Icon name="lock" />
                                            {content.isCategory
                                                ? "Private Category"
                                                : "Private Channel"}
                                        </label>

                                        <div>
                                            <Checkbox checked={state.channel.locked} />
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
                                <Input
                                    maxLength={999}
                                    name="filename"
                                    label="Filename"
                                    value={state.file.name}
                                    error={state.errors.filename}
                                    placeholder="https://spark.mart1d4.dev/hTKzmak"
                                    onChange={(value) => {
                                        dispatch({
                                            type: "SET_FILE",
                                            payload: { name: value },
                                        });
                                        dispatch({
                                            type: "SET_ERRORS",
                                            payload: { fileName: "" },
                                        });
                                    }}
                                />

                                <Input
                                    maxLength={999}
                                    name="description"
                                    label="Description (alt text)"
                                    value={state.file.description}
                                    error={state.errors.fileDescription}
                                    placeholder="Add a description"
                                    onChange={(value) => {
                                        dispatch({
                                            type: "SET_FILE",
                                            payload: { description: value },
                                        });
                                        dispatch({
                                            type: "SET_ERRORS",
                                            payload: { fileDescription: "" },
                                        });
                                    }}
                                />

                                <label
                                    className={styles.spoilerCheckbox}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        dispatch({
                                            type: "SET_FILE",
                                            payload: { spoiler: !state.file.spoiler },
                                        });
                                    }}
                                >
                                    <input type="checkbox" />

                                    <div
                                        style={{
                                            borderColor: state.file.isSpoiler
                                                ? "var(--accent-border)"
                                                : "",
                                            color: "var(--accent-1)",
                                        }}
                                    >
                                        {state.file.spoiler && <Icon name="checkmark" />}
                                    </div>

                                    <div>
                                        <div>Mark as spoiler</div>
                                    </div>
                                </label>
                            </>
                        )}

                        {type === "UPDATE_USERNAME" && (
                            <form>
                                <Input
                                    minLength={2}
                                    maxLength={32}
                                    name="username"
                                    label="Username"
                                    value={state.username}
                                    error={state.errors.username}
                                    onChange={(value) => {
                                        dispatch({
                                            type: "SET_USERNAME",
                                            payload: value,
                                        });
                                        dispatch({
                                            type: "SET_ERRORS",
                                            payload: { username: "" },
                                        });
                                    }}
                                />

                                <Input
                                    type="password"
                                    name="current-password"
                                    label="Current Password"
                                    value={state.password}
                                    error={state.errors.password}
                                    onChange={(value) => {
                                        dispatch({
                                            type: "SET_PASSWORD",
                                            payload: value,
                                        });
                                        dispatch({
                                            type: "SET_ERRORS",
                                            payload: { password: "" },
                                        });
                                    }}
                                />
                            </form>
                        )}

                        {type === "UPDATE_PASSWORD" && (
                            <form>
                                <Input
                                    type="password"
                                    name="current-password"
                                    label="Current Password"
                                    value={state.password}
                                    error={state.errors.password}
                                    onChange={(value) => {
                                        dispatch({
                                            type: "SET_PASSWORD",
                                            payload: value,
                                        });
                                        dispatch({
                                            type: "SET_ERRORS",
                                            payload: { password: "" },
                                        });
                                    }}
                                />

                                <Input
                                    type="password"
                                    name="new-password"
                                    label="New Password"
                                    value={state.newPassword}
                                    error={state.errors.newPassword}
                                    onChange={(value) => {
                                        dispatch({
                                            type: "SET_NEW_PASSWORD",
                                            payload: value,
                                        });
                                        dispatch({
                                            type: "SET_ERRORS",
                                            payload: { newPassword: "" },
                                        });
                                    }}
                                />

                                <Input
                                    type="password"
                                    name="confirm-password"
                                    label="Confirm New Password"
                                    value={state.confirmPassword}
                                    error={state.errors.confirmPassword}
                                    onChange={(value) => {
                                        dispatch({
                                            type: "SET_CONFIRM_PASSWORD",
                                            payload: value,
                                        });
                                        dispatch({
                                            type: "SET_ERRORS",
                                            payload: { confirmPassword: "" },
                                        });
                                    }}
                                />
                            </form>
                        )}
                    </main>

                    {!prop.noButtons && (
                        <footer>
                            {!prop.button.big && (
                                <button
                                    type="button"
                                    ref={cancelRef}
                                    className="button underline"
                                    onClick={() => {
                                        setLayers({
                                            settings: {
                                                type: "POPUP",
                                                setNull: true,
                                            },
                                        });
                                    }}
                                >
                                    Cancel
                                </button>
                            )}

                            <button
                                type="button"
                                className={`button ${prop.button.color} ${
                                    prop.button.disabled ? "disabled" : ""
                                } ${prop.button.big ? styles.big : ""}`}
                                onClick={async () => {
                                    if (state.loading || prop.button.disabled) return;

                                    prop.function();
                                    if (!prop.skipClose) {
                                        setLayers({
                                            settings: {
                                                type: "POPUP",
                                                setNull: true,
                                            },
                                        });
                                    }
                                }}
                            >
                                {state.loading ? <LoadingDots /> : prop.button.text}
                            </button>
                        </footer>
                    )}
                </div>
            )}
        </>
    );
}
